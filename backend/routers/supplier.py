from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from models import Supplier
from schemas import SupplierResponse, SupplierCreate, SupplierUpdate
from database import get_db
from auth import get_current_user
from utils import log_activity
from typing import List

router = APIRouter(tags=["Supplier"])

@router.post("/supplier/create")
def create_supplier(
    supplier: schemas.SupplierCreate,
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user)
):
    db_supplier = models.Supplier(
        name=supplier.name,
        phone=supplier.phone,
        email=supplier.email,
        address=supplier.address
    )
    try:
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)

        # Log the addition
        log_activity(
            db=db,
            type="addition",
            message=f"Supplier added: {db_supplier.name} (SUID: {db_supplier.SUID})"
        )

        return {"message": "Supplier added successfully", "SUID": db_supplier.SUID}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


    
@router.get("/suppliers", response_model=List[SupplierResponse])
def get_suppliers(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    return db.query(Supplier).all()

@router.put("/supplier/update/{suid}")
def update_supplier(suid: int, updated: SupplierUpdate, db: Session = Depends(get_db)):
    supplier = db.query(Supplier).filter(Supplier.SUID == suid).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    supplier.name = updated.name
    supplier.address = updated.address
    supplier.phone = updated.phone
    supplier.email = updated.email

    db.commit()
    db.refresh(supplier)

    # Log the update
    log_activity(
        db=db,
        type="edit",
        message=f"Supplier updated: {supplier.name} (SUID: {supplier.SUID})"
    )

    return supplier

