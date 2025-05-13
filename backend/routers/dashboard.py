from fastapi import APIRouter, FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import models
from schemas import ActivityLogSchema
from models import Customer, Supplier, Invoice, Medicine, Purchase, ActivityLog
from datetime import datetime, timedelta
from database import get_db
from sqlalchemy import func, extract
from auth import get_current_user


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/totals")
def get_dashboard_totals(db: Session = Depends(get_db)):
    # Count only active medicines
    active_medicines_query = db.query(Medicine).filter(Medicine.is_active == True)
    total_medicines = active_medicines_query.count()

    # Log the active medicines query result
    print(f"Active Medicines Count: {total_medicines}")

    total_suppliers = db.query(Supplier).count()
    total_customers = db.query(Customer).count()
    total_invoices = db.query(Invoice).count()

    return {
        "medicines": total_medicines,
        "suppliers": total_suppliers,
        "customers": total_customers,
        "invoices": total_invoices,
    }


# Endpoint to get medicines with quantity less than or equal to 20
@router.get("/medicines/low-quantity")
def get_medicines_low_quantity(db: Session = Depends(get_db)):
    medicines = db.query(models.Medicine).filter(models.Medicine.quantity <= 20).all()
    return medicines

# Endpoint to get medicines near expiry (within the next month)
@router.get("/medicines/near-expiry")
def get_medicines_near_expiry(db: Session = Depends(get_db)):
    one_month_later = datetime.now() + timedelta(days=30)
    medicines = db.query(models.Medicine).filter(models.Medicine.expiry_date <= one_month_later).all()
    return medicines

@router.get("/monthly-sales")
def get_monthly_sales(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    try:
        sales_data = (
            db.query(
                extract("year", Invoice.date).label("year"),
                extract("month", Invoice.date).label("month"),
                func.sum(Invoice.total_amount).label("total")
            )
            .group_by("year", "month")
            .order_by("year", "month")
            .all()
        )

        result = [
            {
                "month": f"{int(record.month):02d}-{int(record.year)}",  # e.g., "04-2025"
                "total": float(record.total)
            }
            for record in sales_data
        ]

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@router.get("/purchase-summary")
def get_purchase_summary(db: Session = Depends(get_db)):
    now = datetime.now()
    current_month_key = f"{now.month:02d}-{now.year}"

    purchases = db.query(Purchase).all()

    total = sum(p.total_price for p in purchases)
    current_month_total = sum(
        p.total_price for p in purchases
        if p.date.strftime("%m-%Y") == current_month_key
    )

    return {
        "total": total,
        "current_month": current_month_total,
    }

@router.get("/recent-logs", response_model=list[ActivityLogSchema])
def get_recent_logs(db: Session = Depends(get_db)):
    return db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(4).all()
