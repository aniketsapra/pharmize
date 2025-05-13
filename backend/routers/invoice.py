from fastapi import FastAPI, Depends, HTTPException, APIRouter
from database import get_db
from auth import get_current_user
from utils import log_activity
from sqlalchemy.orm import Session
import schemas, models
from typing import List
from schemas import InvoiceCreate, InvoiceItemCreate, InvoiceItemResponse, InvoiceResponse
from models import Customer, Medicine, Invoice, InvoiceItem

router = APIRouter( tags=["Invoice"])

@router.post("/invoice/create")
def create_invoice(
    invoice_data: schemas.InvoiceCreate,
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user)
):
    # Step 1: Validate customer
    customer = db.query(models.Customer).filter(models.Customer.CUID == invoice_data.CUID).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Step 2: Validate medicines & stock
    for item in invoice_data.items:
        medicine = db.query(models.Medicine).filter(models.Medicine.id == item.medicineId).first()
        if not medicine:
            raise HTTPException(status_code=404, detail=f"Medicine ID {item.medicineId} not found")
        if medicine.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {medicine.name}")
    
    # Step 3: Create Invoice
    invoice = models.Invoice(
        CUID=invoice_data.CUID,
        date=invoice_data.date,
        discount=invoice_data.discount,
        total_amount=invoice_data.finalTotal
    )
    db.add(invoice)
    db.flush()  # Get invoice.id

    # Step 4: Add Invoice Items and update stock
    for item in invoice_data.items:
        invoice_item = models.InvoiceItem(
            invoice_id=invoice.id,
            medicine_id=item.medicineId,
            quantity=item.quantity,
            unit_price=item.unitPrice
        )
        db.add(invoice_item)

        # Update medicine stock
        medicine = db.query(models.Medicine).filter(models.Medicine.id == item.medicineId).first()
        medicine.quantity -= item.quantity
        if medicine.quantity <= 0:
            medicine.quantity = 0
            medicine.is_active = False

    db.commit()

    # ✅ Log the activity
    log_activity(
        db=db,
        type="invoice",
        message=f"Invoice created (ID: {invoice.id}) for customer: {customer.name}, Total: ₹{invoice.total_amount}"
    )

    return {"message": "Invoice created successfully", "invoice_id": invoice.id}



@router.get("/invoices", response_model=List[InvoiceResponse])
def get_invoices(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    invoices = db.query(Invoice).all()
    response = []

    for invoice in invoices:
        customer = db.query(Customer).filter(Customer.CUID == invoice.CUID).first()
        items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).all()
        
        item_data = []
        for item in items:
            medicine = db.query(Medicine).filter(Medicine.id == item.medicine_id).first()
            item_data.append(InvoiceItemResponse(
                id=item.id,
                medicine_name=medicine.name if medicine else "Unknown",
                quantity=item.quantity,
                unit_price=float(item.unit_price)
            ))

        response.append(InvoiceResponse(
            id=invoice.id,
            CUID=invoice.CUID,
            customer_name=customer.name if customer else "Unknown",
            date=invoice.date,
            discount=float(invoice.discount),
            total_amount=float(invoice.total_amount),
            items=item_data
        ))

    return response