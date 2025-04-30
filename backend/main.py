from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas
from database import SessionLocal, engine 
from auth import hash_password, verify_password, create_access_token, get_current_user
from dotenv import load_dotenv
import os

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
        return {"message": "customer added successfully", "CUID": db_customer.CUID}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    
    
# Dashboard - Protected
@app.get("/dashboard")
def get_dashboard(user: str = Depends(get_current_user)):
    return {"message": f"Welcome, {user}!"}
