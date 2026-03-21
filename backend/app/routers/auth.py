from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from app.database import get_db
from app.schemas.schemas import RegisterRequest, LoginRequest, TokenResponse, UserOut, ProfileUpdate
from app.services.auth_service import hash_password, verify_password, create_access_token, get_current_user
from app.services.email_service import send_welcome_email

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=201)
def register(data: RegisterRequest, db: Client = Depends(get_db)):
    # Check if user exists
    existing_user = db.table("users").select("*").eq("email", data.email).execute()
    if existing_user.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_data = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "role": data.role.value,
        "phone": data.phone,
        "phone2": data.phone2,
        "address": data.address,
        "bank_name": data.bank_name,
        "bank_branch": data.bank_branch,
        "account_number": data.account_number,
        "account_name": data.account_name,
        "earnings": 0.0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    insert_response = db.table("users").insert(user_data).execute()
    new_user = insert_response.data[0]
    
    new_user["id"] = str(new_user["id"])
    try:
        send_welcome_email(user_email=new_user["email"], user_name=new_user["name"])
    except Exception:
        pass
    return UserOut(**new_user)

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Client = Depends(get_db)):
    users_query = db.table("users").select("*").eq("email", data.email).execute()
    if not users_query.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_data = users_query.data[0]
    
    if not verify_password(data.password, user_data.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": str(user_data["id"])})
    return TokenResponse(
        access_token=token, 
        **user_data
    )

@router.get("/me", response_model=UserOut)
def me(current_user: UserOut = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_profile(
    data: ProfileUpdate, 
    db: Client = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        return current_user
        
    res = db.table("users").update(update_data).eq("id", current_user.id).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Update failed")
    return res.data[0]
