from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import date
from typing import Optional, List
from models import Medicine  # or wherever your Medicine model is defined
from datetime import datetime

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

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None

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

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None

class MedicineCreate(BaseModel):
    name: str
    batchNumber: str
    entryDate: date
    expiryDate: date
    quantity: int
    costPrice: float
    description: Optional[str] = None
    SUID: int

class MedicineOut(BaseModel):
    id: int
    name: str
    batch_number: str
    entry_date: date
    expiry_date: date
    quantity: int
    cost_price: float
    description: str | None = None
    SUID: int
    supplier_name: str | None = None
    archived: bool | None = None  # Optional

    model_config = ConfigDict(from_attributes=True)

    @staticmethod
    def from_orm_with_archived(medicine: Medicine):
        # Validate and build the model
        base = MedicineOut.model_validate(medicine)
        
        # Add derived fields like supplier_name and archived
        base.supplier_name = medicine.supplier.name if medicine.supplier else None
        base.archived = not medicine.is_active
        
        return base


    model_config = ConfigDict(from_attributes=True)

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

class ActivityLogSchema(BaseModel):
    id: int
    type: str
    message: str
    timestamp: datetime

    class Config:
        orm_mode = True