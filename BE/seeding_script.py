from decimal import Decimal

from app.database import SessionLocal
from app.models import Product, Customer, Order, OrderItem
from app.utils import make_id

db = SessionLocal()

# Clear existing data
db.query(OrderItem).delete()
db.query(Order).delete()
db.query(Customer).delete()
db.query(Product).delete()
db.commit()

# ------------------
# Products
# ------------------

products = [
    Product(
        id=make_id("p"),
        name="Wireless Mouse",
        sku="WM001",
        price=Decimal("799"),
        quantity=45,
    ),
    Product(
        id=make_id("p"),
        name="Mechanical Keyboard",
        sku="MK001",
        price=Decimal("3499"),
        quantity=20,
    ),
    Product(
        id=make_id("p"),
        name="USB-C Hub",
        sku="HUB001",
        price=Decimal("1499"),
        quantity=12,
    ),
    Product(
        id=make_id("p"),
        name="Laptop Stand",
        sku="LS001",
        price=Decimal("999"),
        quantity=8,
    ),
    Product(
        id=make_id("p"),
        name="SSD 1TB",
        sku="SSD001",
        price=Decimal("5999"),
        quantity=6,
    ),
    Product(
        id=make_id("p"),
        name="24 Inch Monitor",
        sku="MON001",
        price=Decimal("12999"),
        quantity=4,
    ),
]

db.add_all(products)

# ------------------
# Customers
# ------------------

customers = [
    Customer(
        id=make_id("c"),
        name="John Smith",
        email="john@example.com",
        phone="9999999991",
    ),
    Customer(
        id=make_id("c"),
        name="Sarah Wilson",
        email="sarah@example.com",
        phone="9999999992",
    ),
    Customer(
        id=make_id("c"),
        name="Michael Brown",
        email="michael@example.com",
        phone="9999999993",
    ),
]

db.add_all(customers)
db.commit()

product_map = {p.sku: p for p in products}

# ------------------
# Orders
# ------------------

order1 = Order(
    id=make_id("o"),
    customer_id=customers[0].id,
    total_amount=Decimal("5097"),
)

db.add(order1)

db.add_all(
    [
        OrderItem(
            order=order1,
            product_id=product_map["WM001"].id,
            name="Wireless Mouse",
            sku="WM001",
            price=Decimal("799"),
            quantity=2,
            total=Decimal("1598"),
        ),
        OrderItem(
            order=order1,
            product_id=product_map["MK001"].id,
            name="Mechanical Keyboard",
            sku="MK001",
            price=Decimal("3499"),
            quantity=1,
            total=Decimal("3499"),
        ),
    ]
)

product_map["WM001"].quantity -= 2
product_map["MK001"].quantity -= 1

order2 = Order(
    id=make_id("o"),
    customer_id=customers[1].id,
    total_amount=Decimal("6998"),
)

db.add(order2)

db.add(
    OrderItem(
        order=order2,
        product_id=product_map["SSD001"].id,
        name="SSD 1TB",
        sku="SSD001",
        price=Decimal("5999"),
        quantity=1,
        total=Decimal("5999"),
    )
)

product_map["SSD001"].quantity -= 1

db.commit()

print("Seed data inserted successfully!")