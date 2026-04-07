from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import List, Optional
from app.database import get_db
from app.schemas.schemas import RequestOut, RequestStatusUpdate, OrderOut, OrderStatusUpdate, RequestStatus, UserRole, UserOut, ProductOut, ProductStatus, DeliveryStatus, UserEarningsUpdate
from app.schemas.schemas import UserRestrictionUpdate
from app.services.auth_service import require_role
from app.services.email_service import send_order_status_email, send_product_review_email, send_seller_restriction_email
from app.utils import ensure_list
from app.policies import MARKETPLACE_POLICIES, calculate_order_total

router = APIRouter()
admin_only = require_role(UserRole.admin)


def _maybe_send_restriction_email(user: dict) -> None:
    try:
        send_seller_restriction_email(
            seller_email=user.get("email", ""),
            seller_name=user.get("name", "Seller"),
            reason=user.get("restriction_reason") or "Seller account restricted by LankaParts",
            failed_orders_count=int(user.get("failed_orders_count") or 0),
        )
    except Exception:
        pass

@router.get("/products", response_model=List[ProductOut])
def get_all_products(
    status: Optional[ProductStatus] = None,
    db: Client = Depends(get_db),
    _: UserOut = Depends(admin_only)
):
    query = db.table("products").select("*")
    if status is not None:
        query = query.eq("status", status.value)
        
    response = query.order("created_at", desc=True).execute()
    docs = response.data
    
    results = []
    for p_data in docs:
        p_data["id"] = str(p_data["id"])
        
        seller_response = db.table("users").select("*").eq("id", p_data.get("seller_id")).execute()
        if seller_response.data:
            s_data = seller_response.data[0]
            s_data["id"] = str(s_data["id"])
            p_data["seller"] = s_data
            
        p_data["images"] = ensure_list(p_data.get("images"))
        results.append(p_data)
        
    return results

@router.put("/products/{product_id}/approve", response_model=ProductOut)
def approve_product(
    product_id: str,
    status: ProductStatus,
    db: Client = Depends(get_db),
    _: UserOut = Depends(admin_only)
):
    if status not in [ProductStatus.active, ProductStatus.rejected]:
        raise HTTPException(status_code=400, detail="Invalid status for approval")
        
    response = db.table("products").select("*").eq("id", product_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")
        
    update_response = db.table("products").update({"status": status.value}).eq("id", product_id).execute()
    p_data = update_response.data[0]
    p_data["id"] = str(p_data["id"])
    
    seller_response = db.table("users").select("*").eq("id", p_data.get("seller_id")).execute()
    if seller_response.data:
        s_data = seller_response.data[0]
        s_data["id"] = str(s_data["id"])
        p_data["seller"] = s_data
        try:
            send_product_review_email(
                seller_email=s_data.get("email", ""),
                seller_name=s_data.get("name", "Seller"),
                title=p_data.get("title", "Your listing"),
                status=status,
                item_cost=float(p_data.get("price") or 0),
            )
        except Exception:
            pass
        
    p_data["images"] = ensure_list(p_data.get("images"))
    return p_data

@router.delete("/products/{product_id}")
def delete_product(product_id: str, db: Client = Depends(get_db), _: UserOut = Depends(admin_only)):
    response = db.table("products").delete().eq("id", product_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

@router.get("/requests")
def get_all_requests(
    status: Optional[RequestStatus] = None,
    db: Client = Depends(get_db),
    _: UserOut = Depends(admin_only)
):
    query = db.table("requests").select("*")
    if status is not None:
        query = query.eq("status", status.value)
        
    response = query.order("created_at", desc=True).execute()
    docs = response.data
    
    results = []
    for r_data in docs:
        r_data["id"] = str(r_data["id"])
        
        product_response = db.table("products").select("*").eq("id", r_data.get("product_id")).execute()
        if product_response.data:
            p_data = product_response.data[0]
            p_data["id"] = str(p_data["id"])
            
            seller_response = db.table("users").select("*").eq("id", p_data.get("seller_id")).execute()
            if seller_response.data:
                s_data = seller_response.data[0]
                s_data["id"] = str(s_data["id"])
                p_data["seller"] = s_data
                
            p_data["images"] = ensure_list(p_data.get("images"))
            r_data["product"] = p_data
            
        buyer_response = db.table("users").select("*").eq("id", r_data.get("buyer_id")).execute()
        if buyer_response.data:
            b_data = buyer_response.data[0]
            b_data["id"] = str(b_data["id"])
            r_data["buyer"] = b_data
            
        results.append(r_data)
        
    return results

@router.put("/requests/{request_id}")
def update_request_status(
    request_id: str,
    data: RequestStatusUpdate,
    db: Client = Depends(get_db),
    _: UserOut = Depends(admin_only)
):
    response = db.table("requests").select("*").eq("id", request_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Request not found")

    r_data = response.data[0]
    update_dict = {"status": data.status.value}
    if data.admin_notes:
        update_dict["admin_notes"] = data.admin_notes
        
    update_response = db.table("requests").update(update_dict).eq("id", request_id).execute()
    if update_response.data:
        r_data.update(update_response.data[0])
    r_data["id"] = str(r_data["id"])

    if data.status == RequestStatus.approved:
        existing_orders = db.table("orders").select("*").eq("request_id", request_id).execute()
        if not existing_orders.data:
            product_response = db.table("products").select("*").eq("id", r_data.get("product_id")).execute()
            seller_id = str(product_response.data[0].get("seller_id")) if product_response.data else ""
            
            order_data = {
                "request_id": request_id,
                "seller_id": seller_id,
                "buyer_id": str(r_data.get("buyer_id")),
                "delivery_status": "pending",
                "tracking_notes": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            db.table("orders").insert(order_data).execute()

    product_response = db.table("products").select("*").eq("id", r_data.get("product_id")).execute()
    if product_response.data:
        p_data = product_response.data[0]
        p_data["id"] = str(p_data["id"])
        p_data["images"] = ensure_list(p_data.get("images"))
        r_data["product"] = p_data
        
    buyer_response = db.table("users").select("*").eq("id", r_data.get("buyer_id")).execute()
    if buyer_response.data:
        b_data = buyer_response.data[0]
        b_data["id"] = str(b_data["id"])
        r_data["buyer"] = b_data

    return r_data

@router.get("/orders", response_model=List[OrderOut])
def get_all_orders(
    db: Client = Depends(get_db),
    _: UserOut = Depends(admin_only)
):
    response = db.table("orders").select("*").order("created_at", desc=True).execute()
    docs = response.data
    
    results = []
    for o_data in docs:
        o_data["id"] = str(o_data["id"])
        
        # Attach Buyer
        buyer_response = db.table("users").select("*").eq("id", o_data.get("buyer_id")).execute()
        if buyer_response.data:
            b_data = buyer_response.data[0]
            b_data["id"] = str(b_data["id"])
            if b_data.get("role") in ["buyer", "seller"]: b_data["role"] = "user"
            o_data["buyer"] = b_data
            
        # Attach Seller
        seller_response = db.table("users").select("*").eq("id", o_data.get("seller_id")).execute()
        if seller_response.data:
            s_data = seller_response.data[0]
            s_data["id"] = str(s_data["id"])
            if s_data.get("role") in ["buyer", "seller"]: s_data["role"] = "user"
            o_data["seller"] = s_data
            
        # Attach Product
        product_response = db.table("products").select("*").eq("id", o_data.get("product_id")).execute()
        if product_response.data:
            p_data = product_response.data[0]
            p_data["id"] = str(p_data["id"])
            p_data["images"] = ensure_list(p_data.get("images"))
            o_data["product"] = p_data
            o_data["shipping_cost"] = MARKETPLACE_POLICIES["buyer_shipping_cost"]
            o_data["total_cost"] = calculate_order_total(float(p_data.get("price") or 0), int(o_data.get("quantity") or 1))
            
        results.append(o_data)
        
    return results

@router.put("/orders/{order_id}", response_model=OrderOut)
def update_order_status(
    order_id: str,
    data: OrderStatusUpdate,
    db: Client = Depends(get_db),
    _: UserOut = Depends(admin_only)
):
    response = db.table("orders").select("*").eq("id", order_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Order not found")
    previous_order = response.data[0]
        
    update_dict = {"delivery_status": data.delivery_status.value}
    if data.tracking_notes:
        update_dict["tracking_notes"] = data.tracking_notes
        
    update_response = db.table("orders").update(update_dict).eq("id", order_id).execute()
    
    o_data = update_response.data[0] if update_response.data else previous_order
    o_data["id"] = str(o_data["id"])

    # Stock Reduction Cascade
    if data.delivery_status == DeliveryStatus.delivered:
        pid = o_data.get("product_id")
        qty = o_data.get("quantity", 1)
        
        p_resp = db.table("products").select("stock_count").eq("id", pid).execute()
        if p_resp.data:
            curr_stock = p_resp.data[0].get("stock_count", 0)
            new_stock = max(0, curr_stock - qty)
            
            p_upd = {"stock_count": new_stock}
            if new_stock <= 0:
                p_upd["status"] = ProductStatus.out_of_stock.value
            
            db.table("products").update(p_upd).eq("id", pid).execute()
    
    # Attach Product to updated order for immediate UI update
    p_resp = db.table("products").select("*").eq("id", o_data.get("product_id")).execute()
    if p_resp.data:
        p_data = p_resp.data[0]
        p_data["id"] = str(p_data["id"])
        p_data["images"] = ensure_list(p_data.get("images"))
        o_data["product"] = p_data

    buyer_response = db.table("users").select("*").eq("id", o_data.get("buyer_id")).execute()
    if buyer_response.data:
        b_data = buyer_response.data[0]
        b_data["id"] = str(b_data["id"])
        o_data["buyer"] = b_data
        try:
            send_order_status_email(
                buyer_email=b_data.get("email", ""),
                buyer_name=b_data.get("name", "Customer"),
                order_id=o_data["id"],
                product_title=o_data.get("product", {}).get("title", "Your order"),
                item_cost=float(o_data.get("product", {}).get("price") or 0),
                status=data.delivery_status,
                quantity=int(o_data.get("quantity") or 1),
                model_number=o_data.get("product", {}).get("model_number"),
                shipping_address=o_data.get("shipping_address"),
                order_message=o_data.get("message"),
                tracking_notes=o_data.get("tracking_notes"),
            )
        except Exception:
            pass

    seller_response = db.table("users").select("*").eq("id", o_data.get("seller_id")).execute()
    if seller_response.data:
        s_data = seller_response.data[0]
        s_data["id"] = str(s_data["id"])
        if s_data.get("role") in ["buyer", "seller"]:
            s_data["role"] = "user"
        o_data["seller"] = s_data

    if previous_order.get("delivery_status") != DeliveryStatus.rejected.value and data.delivery_status == DeliveryStatus.rejected:
        if seller_response.data:
            seller_data = seller_response.data[0]
            failed_count = int(seller_data.get("failed_orders_count") or 0) + 1
            seller_update = {"failed_orders_count": failed_count}
            if failed_count >= MARKETPLACE_POLICIES["seller_restriction_after_failed_orders"]:
                seller_update["is_restricted"] = True
                seller_update["restriction_reason"] = (
                    f"Restricted after {failed_count} failed orders. Seller cannot add new items until reviewed by LankaParts."
                )
            seller_update_response = db.table("users").update(seller_update).eq("id", o_data.get("seller_id")).execute()
            if seller_update_response.data and seller_update_response.data[0].get("is_restricted"):
                _maybe_send_restriction_email(seller_update_response.data[0])

    return o_data

@router.delete("/orders/{order_id}")
def delete_order(order_id: str, db: Client = Depends(get_db), _: UserOut = Depends(admin_only)):
    response = db.table("orders").delete().eq("id", order_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted"}

@router.get("/users", response_model=List[UserOut])
def get_all_users(db: Client = Depends(get_db), _: UserOut = Depends(admin_only)):
    response = db.table("users").select("*").order("created_at", desc=True).execute()
    docs = response.data
    results = []
    for u_data in docs:
        u_data["id"] = str(u_data["id"])
        if u_data.get("role") in ["buyer", "seller"]:
            u_data["role"] = "user"
        results.append(u_data)
    return results

@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Client = Depends(get_db), _: UserOut = Depends(admin_only)):
    response = db.table("users").delete().eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

@router.put("/users/{user_id}/earnings", response_model=UserOut)
def update_user_earnings(
    user_id: str,
    data: UserEarningsUpdate,
    db: Client = Depends(get_db),
    _: UserOut = Depends(admin_only)
):
    response = db.table("users").update({"earnings": data.earnings}).eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    u_data = response.data[0]
    u_data["id"] = str(u_data["id"])
    return UserOut(**u_data)


@router.put("/users/{user_id}/restriction", response_model=UserOut)
def update_user_restriction(
    user_id: str,
    data: UserRestrictionUpdate,
    db: Client = Depends(get_db),
    _: UserOut = Depends(admin_only)
):
    update_dict = {
        "is_restricted": data.is_restricted,
        "restriction_reason": data.reason if data.is_restricted else None,
    }
    response = db.table("users").update(update_dict).eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    u_data = response.data[0]
    u_data["id"] = str(u_data["id"])
    if u_data.get("is_restricted"):
        _maybe_send_restriction_email(u_data)
    return UserOut(**u_data)

@router.get("/stats")
def get_stats(db: Client = Depends(get_db), _: UserOut = Depends(admin_only)):
    requests_count_resp = db.table("requests").select("id", count="exact").execute()
    orders_count_resp = db.table("orders").select("id", count="exact").execute()
    products_count_resp = db.table("products").select("id", count="exact").execute()
    users_count_resp = db.table("users").select("id", count="exact").execute()
    
    pending_count_resp = db.table("orders").select("id", count="exact").eq("delivery_status", DeliveryStatus.pending_admin.value).execute()
    active_count_resp = db.table("orders").select("id", count="exact").eq("delivery_status", DeliveryStatus.in_delivery.value).execute()
    delivered_count_resp = db.table("orders").select("id", count="exact").eq("delivery_status", DeliveryStatus.delivered.value).execute()
    
    return {
        "total_orders": orders_count_resp.count if orders_count_resp.count is not None else len(orders_count_resp.data),
        "pending_orders": pending_count_resp.count if pending_count_resp.count is not None else len(pending_count_resp.data),
        "active_orders": active_count_resp.count if active_count_resp.count is not None else len(active_count_resp.data),
        "delivered_orders": delivered_count_resp.count if delivered_count_resp.count is not None else len(delivered_count_resp.data),
        "total_products": products_count_resp.count if products_count_resp.count is not None else len(products_count_resp.data),
        "total_users": users_count_resp.count if users_count_resp.count is not None else len(users_count_resp.data),
    }
