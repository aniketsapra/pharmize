from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional, List

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SupplierCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr
    address: str

class SupplierResponse(BaseModel):
    SUID: int
    name: str
    phone: str
    email: EmailStr
    address: str

    class Config:
        orm_mode = True

class CustomerCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr
    address: str


class CustomerResponse(BaseModel):
    CUID: int
    name: str
    phone: str
    email: EmailStr
    address: str

    class Config:
        orm_mode = True

class MedicineCreate(BaseModel):
    name: str
    batchNumber: str
    expiryDate: date
    quantity: int
    costPrice: float
    description: Optional[str] = None
    SUID: int
    
class InvoiceItemCreate(BaseModel):
    medicineId: int
    quantity: int
    unitPrice: float

class InvoiceCreate(BaseModel):
    CUID: int
    date: date
    discount: float
    items: List[InvoiceItemCreate]
    finalTotal: float

class InvoiceItemResponse(BaseModel):
    id: int
    medicine_name: str
    quantity: int
    unit_price: float

    class Config:
        orm_mode = True

class InvoiceResponse(BaseModel):
    id: int
    CUID: int
    customer_name: str
    date: date
    discount: float
    total_amount: float
    items: List[InvoiceItemResponse]

    class Config:
        orm_mode = True

