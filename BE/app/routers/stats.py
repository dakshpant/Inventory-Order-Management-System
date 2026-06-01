from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer, Order, Product
from app.schemas import SystemStats

router = APIRouter(tags=["stats"])


@router.get("/stats", response_model=SystemStats)
def get_stats(db: Session = Depends(get_db)):
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    low_stock_count = db.query(func.count(Product.id)).filter(Product.quantity < 10).scalar() or 0
    revenue = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.status == "Completed")
        .scalar()
        or Decimal("0.00")
    )

    return {
        "totalProducts": total_products,
        "totalCustomers": total_customers,
        "totalOrders": total_orders,
        "lowStockCount": low_stock_count,
        "revenue": revenue,
    }
