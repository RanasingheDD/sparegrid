from app.schemas.schemas import DeliveryStatus, ProductStatus


def welcome_email(name: str) -> tuple[str, str]:
    return (
        "Welcome to SpareGrid",
        (
            f"Hello {name},\n\n"
            "Welcome to SpareGrid.\n"
            "Your account has been created successfully and you can now browse products, place orders, and manage your activity on the platform.\n\n"
            "If you need any help, contact us at suport.sparegrid@gmail.com.\n\n"
            "SpareGrid Team"
        ),
    )


def new_order_admin_email(order_id: str, buyer_name: str, buyer_email: str, product_title: str, quantity: int, shipping_address: str, item_cost: float) -> tuple[str, str]:
    return (
        f"New SpareGrid Order: {order_id}",
        (
            "A new order was created on SpareGrid.\n\n"
            f"Order ID: {order_id}\n"
            f"Buyer: {buyer_name}\n"
            f"Buyer Email: {buyer_email}\n"
            f"Product: {product_title}\n"
            f"Item Cost: LKR {item_cost:,.2f}\n"
            f"Quantity: {quantity}\n"
            f"Shipping Address: {shipping_address}\n"
        ),
    )


def new_order_buyer_email(name: str, order_id: str, product_title: str, quantity: int, shipping_address: str, item_cost: float) -> tuple[str, str]:
    return (
        f"Your SpareGrid Order Was Created: {order_id}",
        (
            f"Hello {name},\n\n"
            "Your order has been created successfully on SpareGrid.\n\n"
            f"Order ID: {order_id}\n"
            f"Product: {product_title}\n"
            f"Item Cost: LKR {item_cost:,.2f}\n"
            f"Quantity: {quantity}\n"
            f"Shipping Address: {shipping_address}\n\n"
            "Our team will review your order shortly.\n"
            "If you have any concern, contact us at suport.sparegrid@gmail.com.\n\n"
            "SpareGrid Team"
        ),
    )


def new_product_admin_email(product_id: str, seller_name: str, seller_email: str, title: str, price: float, category: str) -> tuple[str, str]:
    return (
        f"New SpareGrid Product Submitted: {title}",
        (
            "A new product was submitted to SpareGrid.\n\n"
            f"Product ID: {product_id}\n"
            f"Title: {title}\n"
            f"Category: {category}\n"
            f"Price: LKR {price:,.2f}\n"
            f"Seller: {seller_name}\n"
            f"Seller Email: {seller_email}\n"
        ),
    )


def new_product_seller_email(name: str, title: str, price: float, category: str) -> tuple[str, str]:
    return (
        f"Your SpareGrid Listing Was Submitted: {title}",
        (
            f"Hello {name},\n\n"
            "Your product was added to SpareGrid successfully and is now waiting for admin review.\n\n"
            f"Title: {title}\n"
            f"Category: {category}\n"
            f"Price: LKR {price:,.2f}\n\n"
            "We will notify you once the listing is approved or rejected.\n\n"
            "SpareGrid Team"
        ),
    )


def product_review_email(name: str, title: str, status: ProductStatus, item_cost: float) -> tuple[str, str]:
    approved = status == ProductStatus.active
    return (
        f"Your SpareGrid Listing Was {'Approved' if approved else 'Rejected'}: {title}",
        (
            f"Hello {name},\n\n"
            f"Your product listing \"{title}\" was {'approved' if approved else 'rejected'} by the SpareGrid admin team.\n\n"
            f"Item Cost: LKR {item_cost:,.2f}\n\n"
            + (
                "It is now live on the marketplace.\n"
                if approved
                else "Please review the listing details and update the product if needed before resubmitting.\n"
            )
            + "\nIf you need help, contact suport.sparegrid@gmail.com.\n\n"
            "SpareGrid Team"
        ),
    )


def order_status_email(name: str, order_id: str, product_title: str, item_cost: float, status: DeliveryStatus, tracking_notes: str | None = None) -> tuple[str, str]:
    status_label = status.value.replace("_", " ").title()
    status_line = {
        DeliveryStatus.pending: "Your order has been approved by admin and is now being prepared.",
        DeliveryStatus.rejected: "Your order was rejected by admin.",
        DeliveryStatus.picked_from_seller: "Your order has been picked up from the seller.",
        DeliveryStatus.in_delivery: "Your order is on the way.",
        DeliveryStatus.delivered: "Your order has been marked as delivered.",
        DeliveryStatus.pending_admin: "Your order is waiting for admin review.",
    }.get(status, f"Your order status changed to {status_label}.")

    extra = ""
    if status == DeliveryStatus.pending:
      extra = "\nDelivery time is 3-5 working days."
    if tracking_notes:
      extra += f"\nAdmin Notes: {tracking_notes}"

    return (
        f"Order Update from SpareGrid: {order_id}",
        (
            f"Hello {name},\n\n"
            f"{status_line}\n\n"
            f"Order ID: {order_id}\n"
            f"Product: {product_title}\n"
            f"Item Cost: LKR {item_cost:,.2f}\n"
        f"Delivery charges: LKR {480:,.2f}\n"
        f"Total Cost: LKR {item_cost + 480:,.2f}\n"
            f"Status: {status_label}\n"
            f"{extra}\n\n"
            "For any concern, contact us at suport.sparegrid@gmail.com.\n\n"
            "SpareGrid Team"
        ).replace("\n\n\n", "\n\n"),
    )
