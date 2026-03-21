from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import List
from app.database import get_db
from app.schemas.schemas import OrderOut, UserOut
from app.services.auth_service import get_current_user
from app.utils import ensure_list

router = APIRouter()

@router.get("/buying", response_model=List[OrderOut])
def get_my_purchases(
    db: Client = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    # Orders where I am the buyer
    response = db.table("orders").select("*, buyer:users!orders_buyer_id_fkey(*), seller:users!orders_seller_id_fkey(*)").eq("buyer_id", str(current_user.id)).execute()
    
    results = []
    for o in response.data:
        o["id"] = str(o["id"])
        # Privacy check for buyer
        o["seller"] = {
            "name": "Admin Dispatch / Logistic Team",
            "id": "admin",
            "email": "logistics@sparegrid.com",
            "role": "admin",
            "created_at": "2024-01-01T00:00:00Z"
        } 
        
        if o.get("buyer"): o["buyer"]["id"] = str(o["buyer"]["id"])
        
        # Load product directly
        p_resp = db.table("products").select("*, seller:users(*)").eq("id", o["product_id"]).execute()
        if p_resp.data:
            o["product"] = p_resp.data[0]
            o["product"]["id"] = str(o["product"]["id"])
            o["product"]["images"] = ensure_list(o["product"].get("images"))

        results.append(o)
    return results

@router.get("/selling", response_model=List[OrderOut])
def get_my_sales(
    db: Client = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    # Orders where I am the seller
    response = db.table("orders").select("*, buyer:users!orders_buyer_id_fkey(*), seller:users!orders_seller_id_fkey(*)").eq("seller_id", str(current_user.id)).execute()
    
    results = []
    for o in response.data:
        o["id"] = str(o["id"])
        if o.get("buyer"): o["buyer"]["id"] = str(o["buyer"]["id"])
        if o.get("seller"): o["seller"]["id"] = str(o["seller"]["id"])
        
        # Load product directly
        p_resp = db.table("products").select("*").eq("id", o["product_id"]).execute()
        if p_resp.data:
            o["product"] = p_resp.data[0]
            o["product"]["id"] = str(o["product"]["id"])
            o["product"]["images"] = ensure_list(o["product"].get("images"))
                
        results.append(o)
    return results
