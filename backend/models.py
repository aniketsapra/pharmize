from sqlalchemy import Column, Integer, String, DECIMAL, Text, Date, ForeignKey, Float, Boolean,DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    password = Column(String(255), nullable=False)

class Supplier(Base):
    __tablename__ = "suppliers"

    SUID = Column(Integer, primary_key=True, index=True, autoincrement=True, unique=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)

    medicines = relationship("Medicine", back_populates="supplier")
    purchases = relationship("Purchase", back_populates="supplier")  

class Customer(Base):
    __tablename__ = "customers"

    CUID = Column(Integer, primary_key=True, index=True, autoincrement=True, unique=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)

class Medicine(Base):
    __tablename__ = "medicines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    batch_number = Column(String(100), nullable=False)
    entry_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    quantity = Column(Integer, nullable=False)
    cost_price = Column(DECIMAL(10, 2), nullable=False)
    description = Column(Text)
    SUID = Column(Integer, ForeignKey("suppliers.SUID"), nullable=False)
    is_active = Column(Boolean, default=True)  # Add this column
    
    supplier = relationship("Supplier", back_populates="medicines")
    invoice_items = relationship("InvoiceItem", back_populates="medicine")
    purchases = relationship("Purchase", back_populates="medicine")
 
    
class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    P_ID = Column(Integer, index=True)  # ✅ Add this line for grouping
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    medicine_name = Column(String(100))  # ✅ new
    suid = Column(Integer, ForeignKey("suppliers.SUID"))
    supplier_name = Column(String(100))  # ✅ new
    quantity = Column(Integer)
    unit_price = Column(Float)
    total_price = Column(Float)
    date = Column(Date)

    supplier = relationship("Supplier", back_populates="purchases")
    medicine = relationship("Medicine", back_populates="purchases")



class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    CUID = Column(Integer, ForeignKey("customers.CUID"), nullable=False)
    date = Column(Date, nullable=False)
    discount = Column(DECIMAL(5, 2), default=0)
    total_amount = Column(DECIMAL(10, 2), nullable=False)

    customer = relationship("Customer")
    items = relationship("InvoiceItem", back_populates="invoice")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(10, 2), nullable=False)

    invoice = relationship("Invoice", back_populates="items")
    medicine = relationship("Medicine")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)  # e.g., "addition", "archiving", "edit"
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)