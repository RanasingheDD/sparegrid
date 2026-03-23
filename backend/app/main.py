from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, products, requests, admin, orders, policies

app = FastAPI(title="LankaParts API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://sparegrid.vercel.app","http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/auth",    tags=["Auth"])
app.include_router(products.router, prefix="/products",tags=["Products"])
app.include_router(requests.router, prefix="/requests",tags=["Requests"])
app.include_router(admin.router,    prefix="/admin",   tags=["Admin"])
app.include_router(orders.router,   prefix="/orders",  tags=["Orders"])
app.include_router(policies.router, prefix="/policies", tags=["Policies"])

@app.get("/")
def root():
    return {"message": "LankaParts API is running"}
