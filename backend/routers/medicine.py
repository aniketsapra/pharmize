from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query
from database import get_db
from auth import get_current_user
from sqlalchemy.orm import Session
import schemas, models
from utils import log_activity
from schemas import MedicineOut, MedicineCreate, Medicine
from datetime import date

router = APIRouter( tags=["Medicine"])

@router.post("/medicine/create")
def create_medicines(
    medicines: list[schemas.MedicineCreate],
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user)
):
    try:
        # Step 0: Generate a new P_ID (max existing + 1)
        last_purchase = db.query(models.Purchase).order_by(models.Purchase.P_ID.desc()).first()
        new_p_id = (last_purchase.P_ID + 1) if last_purchase and last_purchase.P_ID else 1

        for med in medicines:
            supplier = db.query(models.Supplier).filter(models.Supplier.SUID == med.SUID).first()
            if not supplier:
                raise HTTPException(status_code=404, detail=f"Supplier with SUID {med.SUID} not found.")

            db_medicine = models.Medicine(
                name=med.name,
                batch_number=med.batchNumber,
                entry_date=med.entryDate,
                expiry_date=med.expiryDate,
                quantity=med.quantity,
                cost_price=med.costPrice,
                description=med.description,
                SUID=med.SUID
            )
            db.add(db_medicine)
            db.flush()

            db_purchase = models.Purchase(
                P_ID=new_p_id,
                medicine_id=db_medicine.id,
                medicine_name=med.name,
                suid=med.SUID,
                supplier_name=supplier.name,
                quantity=med.quantity,
                unit_price=float(med.costPrice),
                total_price=float(med.quantity) * float(med.costPrice),
                date=med.entryDate
            )
            db.add(db_purchase)

        db.commit()

        # ✅ Log activity
        log_activity(
            db=db,
            type="addition",
            message=f"{len(medicines)} medicines and purchases added (P_ID: {new_p_id})"
        )

        return {"message": f"{len(medicines)} medicines and purchases added successfully under P_ID {new_p_id}."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error adding medicines: {str(e)}")


@router.patch("/medicine/{medicine_id}/archive", response_model=MedicineOut, status_code=200)
def archive_medicine(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    # Archive the medicine
    medicine.is_active = False
    db.commit()
    db.refresh(medicine)

    # Log the archiving action
    log_activity(
        db=db,
        type="archiving",
        message=f"Medicine Archived: {medicine.name} (ID: {medicine.id})"
    )

    # Return the updated medicine with the archived field
    return MedicineOut.from_orm_with_archived(medicine)


@router.get("/medicines")
def get_medicines(
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user),
    include_inactive: bool = Query(False, description="Include inactive medicines")
):
    today = date.today()

    # First fetch all medicines
    medicines = db.query(Medicine).all()

    # Update expired medicines to inactive
    updated = False
    for med in medicines:
        if med.expiry_date and med.expiry_date < today and med.is_active:
            med.is_active = False
            updated = True

    if updated:
        db.commit()

    # Filter if not including inactive
    if not include_inactive:
        medicines = [m for m in medicines if m.is_active]

    return [
        {
            "id": m.id,
            "name": m.name,
            "batch_number": m.batch_number,
            "entry_date": m.entry_date,
            "expiry_date": m.expiry_date,
            "quantity": m.quantity,
            "cost_price": float(m.cost_price),
            "description": m.description,
            "SUID": m.SUID,
            "supplier_name": m.supplier.name if m.supplier else None,
            "is_active": m.is_active
        }
        for m in medicines
    ]
