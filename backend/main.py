from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
import models, schemas
from database import SessionLocal, engine 
from typing import List
from schemas import SupplierResponse, CustomerResponse, InvoiceResponse, InvoiceItemResponse, CustomerUpdate, SupplierUpdate, MedicineOut, ActivityLogSchema
from auth import hash_password, verify_password, create_access_token, get_current_user
from dotenv import load_dotenv
import os
from models import Customer, Supplier, Invoice, InvoiceItem, Medicine, Purchase, ActivityLog
from sqlalchemy import func, extract
from datetime import datetime, date, timedelta
from pytz import timezone

load_dotenv()

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

frontend_url = os.getenv("FRONTEND_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/create_user")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed_pw = hash_password(user.password)
    db_user = models.User(username=user.username, email=user.email, password=hashed_pw)
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return {"message": "User created successfully", "user_id": db_user.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(data={"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/supplier/create")
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


@app.post("/customer/create")
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
            message=f"Customer added: {db_customer.name} (SUID: {db_customer.SUID})"
        )

        return {"message": "Customer added successfully", "CUID": db_customer.CUID}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    
@app.get("/suppliers", response_model=List[SupplierResponse])
def get_suppliers(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    return db.query(Supplier).all()

@app.put("/supplier/update/{suid}")
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


@app.get("/customers", response_model=List[CustomerResponse])
def get_customers(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    return db.query(Customer).all()

@app.put("/customer/{cuid}/update")
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



@app.get("/dashboard")
def get_dashboard(user: str = Depends(get_current_user)):
    return {"message": f"Welcome, {user}!"}


@app.post("/medicine/create")
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


@app.patch("/medicine/{medicine_id}/archive", response_model=MedicineOut, status_code=200)
def archive_medicine(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    medicine.is_active = False
    db.commit()
    db.refresh(medicine)

    # Log the archiving action
    log_activity(
        db=db,
        type="archiving",
        message=f"Medicine Deleted: {medicine.name} (ID: {medicine.id})"
    )

    return MedicineOut.from_orm_with_archived(medicine)


@app.get("/medicines")
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


@app.post("/invoice/create")
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



@app.get("/invoices", response_model=List[InvoiceResponse])
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


@app.get("/purchase-report")
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


@app.get("/sales-report")
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
    

@app.get("/dashboard/totals")
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
@app.get("/medicines/low-quantity")
def get_medicines_low_quantity(db: Session = Depends(get_db)):
    medicines = db.query(models.Medicine).filter(models.Medicine.quantity <= 20).all()
    return medicines

# Endpoint to get medicines near expiry (within the next month)
@app.get("/medicines/near-expiry")
def get_medicines_near_expiry(db: Session = Depends(get_db)):
    one_month_later = datetime.now() + timedelta(days=30)
    medicines = db.query(models.Medicine).filter(models.Medicine.expiry_date <= one_month_later).all()
    return medicines

@app.get("/dashboard/monthly-sales")
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
    
    
@app.get("/dashboard/purchase-summary")
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

@app.get("/dashboard/recent-logs", response_model=list[ActivityLogSchema])
def get_recent_logs(db: Session = Depends(get_db)):
    return db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(4).all()


def log_activity(db: Session, type: str, message: str):
    ist = timezone("Asia/Kolkata")
    log = ActivityLog(type=type, message=message, timestamp=datetime.now(ist))
    db.add(log)
    db.commit()



@app.get("/api/logs", response_model=list[ActivityLogSchema])
def get_logs(db: Session = Depends(get_db)):
    return db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).all()