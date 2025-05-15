from fastapi import FastAPI, Depends, HTTPException, APIRouter
import schemas, models
from schemas import CustomerCreate, CustomerResponse, CustomerUpdate
from models import Customer
from typing import List
from database import get_db
from auth import get_current_user
from sqlalchemy.orm import Session
from utils import log_activity

router = APIRouter( tags=["Cusomter"])


@router.post("/customer/create")
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    db_customer = models.Customer(
        name=customer.name,
        phone=customer.phone,
        email=customer.email,
        address=customer.address
    )
    try:
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)

        # ✅ Log the addition
        log_activity(
            db=db,
            type="addition",
            message=f"Customer added: {db_customer.name} (CUID: {db_customer.CUID})"
        )

        return {"message": "Customer added successfully", "CUID": db_customer.CUID}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))



@router.get("/customers", response_model=List[CustomerResponse])
def get_customers(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    return db.query(Customer).all()

@router.put("/customer/{cuid}/update")
def update_customer(cuid: str, updated_data: CustomerUpdate, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    customer = db.query(Customer).filter(Customer.CUID == cuid).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    for field, value in updated_data.dict(exclude_unset=True).items():
        setattr(customer, field, value)
    
    db.commit()
    db.refresh(customer)

    # Add log entry
    log_activity(
        db=db,
        type="edit",
        message=f"Customer updated: {customer.name} (CUID: {customer.CUID})"
    )

    return customer
