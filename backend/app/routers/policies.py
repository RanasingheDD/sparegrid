from fastapi import APIRouter

from app.policies import get_public_policies

router = APIRouter()


@router.get("/public")
def public_policies():
    return get_public_policies()
