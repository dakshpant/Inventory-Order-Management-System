from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import Customer, Order, OrderItem, Product
from app.schemas import OrderCreate, OrderOut
from app.utils import make_id

router = APIRouter(prefix="/orders", tags=["orders"])


def serialize_order(order: Order) -> dict:
    return {
        "id": order.id,
        "customerId": order.customer_id,
        "customerName": order.customer.name,
        "customerEmail": order.customer.email,
        "items": [
            {
                "productId": item.product_id,
                "name": item.name,
                "sku": item.sku,
                "price": item.price,
                "quantity": item.quantity,
                "total": item.total,
            }
            for item in order.items
        ],
        "totalAmount": order.total_amount,
        "createdAt": order.created_at,
        "status": order.status,
    }


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    customer = db.get(Customer, payload.customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    product_quantities: dict[str, int] = {}
    for item in payload.items:
        product_quantities[item.product_id] = product_quantities.get(item.product_id, 0) + item.quantity

    products = (
        db.query(Product)
        .filter(Product.id.in_(product_quantities.keys()))
        .with_for_update()
        .all()
    )
    product_map = {product.id: product for product in products}

    missing_ids = [product_id for product_id in product_quantities if product_id not in product_map]
    if missing_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f'Product ID "{missing_ids[0]}" not found',
        )

    for product_id, requested_qty in product_quantities.items():
        product = product_map[product_id]
        if product.quantity < requested_qty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f'Insufficient stock for "{product.name}". Requested {requested_qty}, '
                    f"but only {product.quantity} available."
                ),
            )

    order = Order(id=make_id("o"), customer_id=customer.id, total_amount=Decimal("0.00"))
    db.add(order)

    total_amount = Decimal("0.00")
    for product_id, requested_qty in product_quantities.items():
        product = product_map[product_id]
        line_total = (product.price * requested_qty).quantize(Decimal("0.01"))
        product.quantity -= requested_qty
        total_amount += line_total
        db.add(
            OrderItem(
                order=order,
                product_id=product.id,
                name=product.name,
                sku=product.sku,
                price=product.price,
                quantity=requested_qty,
                total=line_total,
            )
        )

    order.total_amount = total_amount.quantize(Decimal("0.01"))
    db.commit()
    order = (
        db.query(Order)
        .options(selectinload(Order.customer), selectinload(Order.items))
        .filter(Order.id == order.id)
        .one()
    )
    return serialize_order(order)


@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(selectinload(Order.customer), selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .all()
    )
    return [serialize_order(order) for order in orders]


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(selectinload(Order.customer), selectinload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return serialize_order(order)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: str, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(selectinload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.status == "Completed":
        for item in order.items:
            product = db.get(Product, item.product_id)
            if product:
                product.quantity += item.quantity

    db.delete(order)
    db.commit()
    return None
