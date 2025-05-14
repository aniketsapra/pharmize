from fastapi import APIRouter, Depends
from auth import get_current_user 

router = APIRouter()

@router.get("/protected")
def protected_endpoint(current_user: str = Depends(get_current_user)):
    return {"message": f"Hello, {current_user}. You are authorized!"}
