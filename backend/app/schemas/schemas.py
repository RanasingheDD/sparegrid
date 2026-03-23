from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    buyer = "buyer"
    seller = "seller"

class ProductStatus(str, enum.Enum):
    active = "active"
    pending = "pending"
    sold = "sold"
    rejected = "rejected"
    out_of_stock = "out_of_stock"

class RequestStatus(str, enum.Enum):
    pending_admin = "pending_admin"
    approved = "approved"
    rejected = "rejected"
    processing = "processing"
    completed = "completed"

class DeliveryStatus(str, enum.Enum):
    pending = "pending"
    picked_from_seller = "picked_from_seller"
    in_delivery = "in_delivery"
    delivered = "delivered"
    pending_admin = "pending_admin"
    rejected = "rejected"


# ─── Auth Schemas ────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.user
    phone: str
    phone2: Optional[str] = None
    address: str
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None
    account_number: Optional[str] = None
    account_name: Optional[str] = None

class ProfileUpdate(BaseModel):
    phone: Optional[str] = None
    phone2: Optional[str] = None
    address: Optional[str] = None
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None
    account_number: Optional[str] = None
    account_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    id: str
    name: str
    email: str
    role: UserRole
    phone: Optional[str] = None
    phone2: Optional[str] = None
    address: Optional[str] = None
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None
    account_number: Optional[str] = None
    account_name: Optional[str] = None
    earnings: float = 0.0
    is_restricted: bool = False
    restriction_reason: Optional[str] = None
    failed_orders_count: int = 0

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    phone: Optional[str] = None
    phone2: Optional[str] = None
    address: Optional[str] = None
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None
    account_number: Optional[str] = None
    account_name: Optional[str] = None
    earnings: float = 0.0
    is_restricted: bool = False
    restriction_reason: Optional[str] = None
    failed_orders_count: int = 0
    created_at: datetime


# ─── Product Schemas ──────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    condition: Optional[str] = "Used"
    category: str
    images: List[str] = [] # Changed from image_url
    stock_count: int = 1
    model_number: Optional[str] = None

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    condition: Optional[str] = None
    category: Optional[str] = None
    images: Optional[List[str]] = None # Changed from image_url
    status: Optional[ProductStatus] = None
    stock_count: Optional[int] = None
    model_number: Optional[str] = None

class ProductOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    price: float
    condition: str
    category: str
    images: List[str] = [] # Changed from image_url
    status: ProductStatus
    seller_id: Optional[str] = None
    stock_count: int = 1
    model_number: Optional[str] = None
    created_at: datetime
    seller: Optional[UserOut] = None


# ─── Request Schemas ──────────────────────────────────────────────────────────

class RequestCreate(BaseModel):
    quantity: int = 1
    shipping_address: Optional[str] = None
    message: Optional[str] = None

class RequestOut(BaseModel):
    id: str
    product_id: str
    buyer_id: str
    status: RequestStatus
    admin_notes: Optional[str] = None
    quantity: int = 1
    shipping_address: Optional[str] = None
    message: Optional[str] = None
    created_at: datetime
    product: Optional[ProductOut] = None
    buyer: Optional[UserOut] = None
    order: Optional[dict] = None # Using dict to sidestep circular forward reference parsing without typing loops.

class RequestStatusUpdate(BaseModel):
    status: RequestStatus
    admin_notes: Optional[str] = None


# ─── Order Schemas ────────────────────────────────────────────────────────────

class OrderOut(BaseModel):
    id: str
    product_id: str
    seller_id: str
    buyer_id: str
    delivery_status: DeliveryStatus
    tracking_notes: Optional[str] = None
    quantity: int = 1
    shipping_address: Optional[str] = None
    message: Optional[str] = None
    created_at: datetime
    shipping_cost: Optional[float] = None
    total_cost: Optional[float] = None
    buyer: Optional[UserOut] = None
    seller: Optional[UserOut] = None
    product: Optional[ProductOut] = None

class OrderCreate(BaseModel):
    product_id: str
    quantity: int = 1
    shipping_address: Optional[str] = None
    message: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    delivery_status: DeliveryStatus
    tracking_notes: Optional[str] = None

class UserEarningsUpdate(BaseModel):
    earnings: float


class UserRestrictionUpdate(BaseModel):
    is_restricted: bool
    reason: Optional[str] = None
