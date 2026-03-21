from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import List
from app.database import get_db
from app.schemas.schemas import OrderOut, RequestCreate, ProductStatus, RequestStatus, UserOut, UserRole, DeliveryStatus
from app.services.auth_service import get_current_user, require_role
from app.services.email_service import send_new_order_notifications

router = APIRouter()

@router.get("/check/{product_id}")
def check_request_status(
    product_id: str,
    db: Client = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    # Check if user has an active/pending order for this product
    # Logic: delivery_status NOT in ['rejected', 'delivered']
    response = db.table("orders").select("*")\
        .eq("product_id", product_id)\
        .eq("buyer_id", str(current_user.id))\
        .not_.in_("delivery_status", [DeliveryStatus.rejected.value, DeliveryStatus.delivered.value])\
        .execute()
    
    return {"has_active_request": len(response.data) > 0, "request": response.data[0] if response.data else None}

@router.post("/{product_id}", status_code=210)
def create_request(
    product_id: str,
    data: RequestCreate,
    db: Client = Depends(get_db),
    current_user: UserOut = Depends(require_role(UserRole.user, UserRole.admin))
):
    product_response = db.table("products").select("*").eq("id", product_id).execute()
    if not product_response.data:
        raise HTTPException(status_code=404, detail="Product not found or unavailable")
        
    p_data = product_response.data[0]
    p_data["id"] = str(p_data["id"])
    if p_data.get("status") != ProductStatus.active.value:
        raise HTTPException(status_code=404, detail="Product not found or unavailable")

    existing_response = db.table("orders")\
        .select("*")\
        .eq("product_id", product_id)\
        .eq("buyer_id", str(current_user.id))\
        .not_.in_("delivery_status", [DeliveryStatus.rejected.value, DeliveryStatus.delivered.value])\
        .execute()
        
    if existing_response.data:
        raise HTTPException(status_code=400, detail="You already have an active order for this product")

    order_data = {
        "product_id": product_id,
        "seller_id": str(p_data.get("seller_id")),
        "buyer_id": str(current_user.id),
        "delivery_status": DeliveryStatus.pending_admin.value,
        "quantity": data.quantity,
        "shipping_address": data.shipping_address or current_user.address,
        "message": data.message,
        "tracking_notes": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    insert_response = db.table("orders").insert(order_data).execute()
    new_order = insert_response.data[0]
    new_order["id"] = str(new_order["id"])

    try:
        send_new_order_notifications(
            order_id=new_order["id"],
            buyer_name=current_user.name,
            buyer_email=current_user.email,
            product_title=p_data.get("title", "Unknown product"),
            quantity=new_order.get("quantity") or 1,
            shipping_address=new_order.get("shipping_address") or "Not provided",
            item_cost=float(p_data.get("price") or 0),
        )
    except Exception:
        pass
    
    new_order["buyer"] = current_user.model_dump()
    new_order["product"] = p_data
    
    return new_order

@router.get("/my")
def my_orders(
    db: Client = Depends(get_db),
    current_user: UserOut = Depends(require_role(UserRole.user, UserRole.admin))
):
    response = db.table("orders").select("*").eq("buyer_id", str(current_user.id))\
             .order("created_at", desc=True).execute()
             
    results = []
    buyer_dict = current_user.model_dump()
    
    for o_data in response.data:
        o_data["id"] = str(o_data["id"])
        o_data["buyer"] = buyer_dict
        
        product_response = db.table("products").select("*").eq("id", o_data["product_id"]).execute()
        if product_response.data:
            p_data = product_response.data[0]
            p_data["id"] = str(p_data["id"])
            o_data["product"] = p_data
            
        results.append(o_data)
        
    return results
