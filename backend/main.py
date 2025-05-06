from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas
from database import SessionLocal, engine 
from typing import List
from schemas import SupplierResponse, CustomerResponse, InvoiceResponse, InvoiceItemResponse
from auth import hash_password, verify_password, create_access_token, get_current_user
from dotenv import load_dotenv
import os
from models import Customer, Supplier, Invoice, InvoiceItem, Medicine
from sqlalchemy import func
from datetime import datetime, date



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
def create_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
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
        return {"message": "Customer added successfully", "CUID": db_customer.CUID}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/suppliers", response_model=List[SupplierResponse])
def get_suppliers(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    return db.query(Supplier).all()


@app.get("/customers", response_model=List[CustomerResponse])
def get_customers(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    return db.query(Customer).all()

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
        return {"message": f"{len(medicines)} medicines and purchases added successfully under P_ID {new_p_id}."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error adding medicines: {str(e)}")


@app.delete("/medicine/{medicine_id}", status_code=200)
def delete_medicine(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)  # Ensure user is authenticated
):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    db.delete(medicine)
    db.commit()
    return {"detail": "Medicine deleted successfully"}


@app.get("/medicines")
def get_medicines(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    medicines = db.query(models.Medicine).all()
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
        }
        for m in medicines
    ]


@app.post("/invoice/create")
def create_invoice(invoice_data: schemas.InvoiceCreate, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
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
        medicine.quantity -= item.quantity  # Decrease the quantity in stock

    db.commit()
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
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")

        query = db.query(Medicine).filter(
            Medicine.entry_date >= start_dt,
            Medicine.entry_date <= end_dt
        )

        if suid:
            query = query.filter(Medicine.SUID == suid)

        medicines = query.all()

        total_qty = sum(m.quantity for m in medicines)
        total_amount = sum(m.quantity * m.cost_price for m in medicines)

        report_data = []
        for m in medicines:
            report_data.append({
                "id": m.id,
                "medicine_name": m.name,
                "supplier_name": m.supplier.name if m.supplier else "Unknown",
                "quantity": m.quantity,
                "unit_price": float(m.cost_price),
                "total_cost": float(m.quantity * m.cost_price),
                "entry_date": m.entry_date.strftime("%Y-%m-%d")
            })

        return {
            "total_quantity": total_qty,
            "total_amount": total_amount,
            "data": report_data
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

    invoices = query.all()

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
