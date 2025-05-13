from fastapi import FastAPI, Depends, HTTPException, APIRouter, Query
from datetime import datetime, date
from sqlalchemy.orm import Session
from auth import get_current_user
from database import get_db
from models import Purchase, Invoice, Customer, Medicine, InvoiceItem
import models, schemas


router = APIRouter( tags=["Report"])


@router.get("/purchase-report")
def get_purchase_report(
    start_date: str = Query(...),
    end_date: str = Query(...),
    suid: int = Query(None),
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user)
):
    try:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_dt = datetime.strptime(end_date, "%Y-%m-%d").date()

        # Query the Purchase table, not a variable called "purchases"
        query = db.query(Purchase).filter(
            Purchase.date >= start_dt,
            Purchase.date <= end_dt
        )

        if suid:
            query = query.filter(Purchase.suid == suid)

        purchase_entries = query.order_by(Purchase.date.desc(), Purchase.P_ID.desc()).all()

        grouped = {}
        total_qty = 0
        total_amount = 0.0

        for p in purchase_entries:
            pid = p.P_ID
            if pid not in grouped:
                grouped[pid] = {
                    "purchase_id": pid,
                    "date": p.date.strftime("%Y-%m-%d"),
                    "suid": p.suid,  # Add this
                    "supplier_name": p.supplier_name, 
                    "items": [],
                    "total_amount": 0.0,
                    "total_quantity": 0
                }

            item = {
                "medicine_name": p.medicine_name,
                "supplier_name": p.supplier_name,
                "quantity": p.quantity,
                "unit_price": float(p.unit_price),
                "total_cost": float(p.total_price)
            }

            grouped[pid]["items"].append(item)
            grouped[pid]["total_amount"] += item["total_cost"]
            grouped[pid]["total_quantity"] += item["quantity"]
            total_qty += item["quantity"]
            total_amount += item["total_cost"]

        return {
            "total_quantity": total_qty,
            "total_amount": round(total_amount, 2),
            "data": list(grouped.values())
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sales-report")
def get_sales_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    customer_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(Invoice).filter(Invoice.date.between(start_date, end_date))

    if customer_id:
        query = query.filter(Invoice.CUID == customer_id)

    invoices = query.order_by(Invoice.date.desc(), Invoice.id.desc()).all()

    report = []
    total_amount = 0.0
    total_quantity = 0

    for invoice in invoices:
        customer = db.query(Customer).filter(Customer.CUID == invoice.CUID).first()
        items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).all()

        item_list = []
        amount_before_discount = 0.0

        for item in items:
            medicine = db.query(Medicine).filter(Medicine.id == item.medicine_id).first()
            subtotal = float(item.unit_price) * item.quantity
            amount_before_discount += subtotal
            total_quantity += item.quantity  # ⬅️ accumulate quantity
            item_list.append({
                "medicine_name": medicine.name,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
            })

        total_amount += float(invoice.total_amount)  # ⬅️ accumulate amount

        report.append({
            "id": invoice.id,
            "date": invoice.date,
            "CUID": invoice.CUID,
            "customer_name": customer.name,
            "customer_address": customer.address,
            "discount": float(invoice.discount),
            "total_amount": float(invoice.total_amount),
            "amount_before_discount": round(amount_before_discount, 2),
            "items": item_list
        })

    return {
        "invoices": report,
        "total_amount": round(total_amount, 2),
        "total_quantity": total_quantity
    }