# schemas.py
from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str
    
class SupplierCreate(BaseModel):
    name: str
    phone: str
    email: str
    address: str