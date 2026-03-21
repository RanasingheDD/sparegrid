from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import List, Optional
from app.database import get_db
from app.schemas.schemas import ProductCreate, ProductUpdate, ProductOut, ProductStatus, UserOut, UserRole
from app.services.auth_service import get_current_user, require_role
from app.services.cloudinary_service import cloudinary_service
from app.services.email_service import send_new_product_notifications
from fastapi import UploadFile, File
import json

from app.utils import ensure_list

router = APIRouter()

def get_seller_dict(db: Client, seller_id: str) -> Optional[dict]:
    response = db.table("users").select("*").eq("id", seller_id).execute()
    if response.data:
        s_data = response.data[0]
        s_data["id"] = str(s_data["id"])
        return s_data
    return None

@router.get("/", response_model=List[ProductOut])
def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Client = Depends(get_db)
):
    query = db.table("products").select("*").eq("status", ProductStatus.active.value)
    if category:
        query = query.eq("category", category)
    
    response = query.order("created_at", desc=True).execute()
    docs = response.data
    
    results = []
    for p_data in docs:
        p_data["id"] = str(p_data["id"])
        
        if search and search.lower() not in p_data.get("title", "").lower():
            continue
            
        p_data["images"] = ensure_list(p_data.get("images"))
        p_data.pop("seller_id", None)
            
        results.append(p_data)
        
    return results

@router.post("/upload")
async def upload_images(
    files: List[UploadFile] = File(...),
    current_user: UserOut = Depends(require_role(UserRole.user, UserRole.admin))
):
    if len(files) > 3:
        raise HTTPException(status_code=400, detail="Maximum 3 images allowed")
    
    res_list = []
    for file in files:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
        
        content = await file.read()
        res = cloudinary_service.upload_file(content, file.filename)
        res_list.append(res)
    
    return {"results": res_list}

@router.delete("/upload")
async def delete_upload(
    public_id: str,
    current_user: UserOut = Depends(require_role(UserRole.user, UserRole.admin))
):
    success = cloudinary_service.delete_image(public_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete image from storage")
    return {"message": "Image deleted successfully"}

@router.post("/", response_model=ProductOut, status_code=201)
def create_product(
    data: ProductCreate,
    db: Client = Depends(get_db),
    current_user: UserOut = Depends(require_role(UserRole.user, UserRole.admin))
):
    product_data = data.model_dump()
    product_data["seller_id"] = str(current_user.id)
    product_data["stock_count"] = data.stock_count
    product_data["status"] = ProductStatus.pending.value
    product_data["created_at"] = datetime.now(timezone.utc).isoformat()
    
    insert_response = db.table("products").insert(product_data).execute()
    new_product = insert_response.data[0]
    
    new_product["id"] = str(new_product["id"])
    new_product["images"] = ensure_list(new_product.get("images"))
    try:
        send_new_product_notifications(
            seller_email=current_user.email,
            seller_name=current_user.name,
            product_id=new_product["id"],
            title=new_product.get("title", "Untitled product"),
            price=float(new_product.get("price") or 0),
            category=new_product.get("category", "Uncategorized"),
        )
    except Exception:
        pass
    new_product.pop("seller_id", None)
    return new_product

@router.get("/seller/my", response_model=List[ProductOut])
def my_products(
    db: Client = Depends(get_db),
    current_user: UserOut = Depends(require_role(UserRole.user, UserRole.admin))
):
    response = db.table("products").select("*").eq("seller_id", str(current_user.id)).order("created_at", desc=True).execute()
    docs = response.data
    
    results = []
    seller_dict = current_user.model_dump()
    for p_data in docs:
        p_data["id"] = str(p_data["id"])
        p_data["images"] = ensure_list(p_data.get("images"))
        p_data["seller"] = seller_dict
        results.append(p_data)
        
    return results

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: str, db: Client = Depends(get_db)):
    response = db.table("products").select("*").eq("id", product_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")
        
    p_data = response.data[0]
    p_data["id"] = str(p_data["id"])
    p_data["images"] = ensure_list(p_data.get("images"))
    
    p_data.pop("seller_id", None)
        
    return p_data

@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: str,
    data: ProductUpdate,
    db: Client = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    response = db.table("products").select("*").eq("id", product_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")
        
    p_data = response.data[0]
    if str(p_data.get("seller_id")) != str(current_user.id) and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    update_data = data.model_dump(exclude_unset=True)
    if "status" in update_data and isinstance(update_data["status"], ProductStatus):
        update_data["status"] = update_data["status"].value
    
    # If the seller updates price, title, or description, the product should go back to 'pending'
    # EXCEPT for admins
    if current_user.role != UserRole.admin:
        critical_fields = ["title", "description", "price", "images"] # Changed from image_url
        if any(field in update_data for field in critical_fields):
            update_data["status"] = ProductStatus.pending.value

    if update_data:
        update_response = db.table("products").update(update_data).eq("id", product_id).execute()
        if update_response.data:
            p_data.update(update_response.data[0])
        
    p_data["id"] = str(p_data["id"])
    p_data["images"] = ensure_list(p_data.get("images"))
    p_data.pop("seller_id", None)
        
    return p_data

@router.put("/{product_id}/stock", response_model=ProductOut)
def update_product_stock_quick(
    product_id: str,
    stock_count: int,
    status: ProductStatus,
    db: Client = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    # This endpoint allows sellers to update ONLY stock and status (in/out of stock)
    # without needing admin re-approval.
    response = db.table("products").select("*").eq("id", product_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    p_data = response.data[0]
    if str(p_data.get("seller_id")) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your product")

    # Only allow switching between active and out_of_stock here
    if status not in [ProductStatus.active, ProductStatus.out_of_stock]:
         raise HTTPException(status_code=400, detail="Invalid status for quick update")

    update_data = {
        "stock_count": stock_count,
        "status": status.value
    }
    
    update_response = db.table("products").update(update_data).eq("id", product_id).execute()
    result = update_response.data[0]
    result["id"] = str(result["id"])
    result["images"] = ensure_list(result.get("images"))
    result.pop("seller_id", None)
    return result

@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: str,
    db: Client = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    response = db.table("products").select("*").eq("id", product_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")
        
    p_data = response.data[0]
    if str(p_data.get("seller_id")) != str(current_user.id) and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db.table("products").delete().eq("id", product_id).execute()
    return None
