from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=80)
    price: Decimal = Field(..., ge=0, max_digits=12, decimal_places=2)
    quantity: int = Field(..., ge=0)

    @field_validator("name", "sku")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Field cannot be blank")
        return value

    @field_validator("sku")
    @classmethod
    def normalize_sku(cls, value: str) -> str:
        return value.upper()


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: str


class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(default="", max_length=40)

    @field_validator("name", "phone")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.lower()


class CustomerCreate(CustomerBase):
    pass


class CustomerOut(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: str


class OrderItemCreate(BaseModel):
    product_id: str = Field(..., alias="productId")
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_id: str = Field(..., alias="customerId")
    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderItemOut(BaseModel):
    product_id: str = Field(..., alias="productId")
    name: str
    sku: str
    price: Decimal
    quantity: int
    total: Decimal


class OrderOut(BaseModel):
    id: str
    customer_id: str = Field(..., alias="customerId")
    customer_name: str = Field(..., alias="customerName")
    customer_email: str = Field(..., alias="customerEmail")
    items: list[OrderItemOut]
    total_amount: Decimal = Field(..., alias="totalAmount")
    created_at: datetime = Field(..., alias="createdAt")
    status: Literal["Completed", "Cancelled"]


class SystemStats(BaseModel):
    total_products: int = Field(..., alias="totalProducts")
    total_customers: int = Field(..., alias="totalCustomers")
    total_orders: int = Field(..., alias="totalOrders")
    low_stock_count: int = Field(..., alias="lowStockCount")
    revenue: Decimal
