import cloudinary
import cloudinary.uploader
from app.config import settings
from datetime import datetime

class CloudinaryService:
    def __init__(self):
        if not settings.CLOUDINARY_CLOUD_NAME or not settings.CLOUDINARY_API_KEY or not settings.CLOUDINARY_API_SECRET:
            self.initialized = False
            return

        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )
        self.initialized = True

    def upload_file(self, file_content: bytes, filename: str) -> dict:
        if not self.initialized:
            raise Exception("Cloudinary settings not configured")
        
        try:
            # Upload the file
            result = cloudinary.uploader.upload(
                file_content,
                public_id=f"prod_{int(datetime.now().timestamp())}_{filename.split('.')[0]}",
                folder="sparegrid/products",
                resource_type="auto"
            )
            return {
                "url": result.get("secure_url"),
                "public_id": result.get("public_id")
            }
        except Exception as e:
            print(f"Cloudinary upload error: {e}")
            raise Exception(f"Upload failed: {str(e)}")

    def delete_image(self, public_id: str) -> bool:
        if not self.initialized:
            return False
        try:
            cloudinary.uploader.destroy(public_id)
            return True
        except Exception as e:
            print(f"Cloudinary delete error: {e}")
            return False

cloudinary_service = CloudinaryService()
