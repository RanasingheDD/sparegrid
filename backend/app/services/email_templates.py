from html import escape

from app.schemas.schemas import DeliveryStatus, ProductStatus
from app.policies import MARKETPLACE_POLICIES, calculate_order_total


SUPPORT_EMAIL = "support.lankaparts@gmail.com"
ORDER_ALERT_EMAIL = "support.lankaparts@gmail.com"
SITE_URL = "https://lankaparts.live"


def _render_email(title: str, intro: str, sections: list[tuple[str, str]], closing: str) -> tuple[str, str]:
    text_parts = [title, "", intro, ""]
    html_sections = []

    for label, value in sections:
        safe_label = escape(label)
        safe_value = escape(value).replace("\n", "<br />")
        text_parts.append(f"{label}: {value}")
        html_sections.append(
            f"""
            <tr>
              <td style="padding: 0 0 12px 0;">
                <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #8b98a9; margin-bottom: 6px;">{safe_label}</div>
                <div style="font-size: 15px; line-height: 1.6; color: #122033;">{safe_value}</div>
              </td>
            </tr>
            """
        )

    text_parts.extend(["", closing, "", f"Support: {SUPPORT_EMAIL}", "LankaParts Team"])
    text_body = "\n".join(text_parts)

    html_body = f"""
    <!DOCTYPE html>
    <html>
      <body style="margin:0; padding:0; background:#f4f7fb; font-family: Arial, Helvetica, sans-serif; color:#122033;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb; padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; background:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 16px 48px rgba(18, 32, 51, 0.08);">
                <tr>
                  <td style="padding:28px 32px; background:linear-gradient(135deg, #f2551f 0%, #ff8a3d 100%); color:#ffffff;">
                    <div style="font-size:12px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; opacity:0.9; margin-bottom:10px;">LankaParts</div>
                    <div style="font-size:32px; font-weight:800; line-height:1;"></div>
                    <div style="font-size:14px; opacity:0.92; margin-top:10px;">Professional marketplace updates from the LankaParts team</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <h1 style="margin:0 0 16px 0; font-size:28px; line-height:1.2; color:#122033;">{escape(title)}</h1>
                    <p style="margin:0 0 24px 0; font-size:15px; line-height:1.7; color:#425066;">{escape(intro)}</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      {''.join(html_sections)}
                    </table>
                    <div style="margin-top:24px; padding:18px 20px; border-radius:18px; background:#f7f9fc; font-size:14px; line-height:1.7; color:#425066;">
                      {escape(closing).replace("\n", "<br />")}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px; border-top:1px solid #e7edf5; background:#fbfcfe;">
                    <div style="font-size:14px; font-weight:700; color:#122033; margin-bottom:6px;">LankaParts Support</div>
                    <div style="font-size:13px; line-height:1.6; color:#6a7787;">Email: {escape(SUPPORT_EMAIL)}</div>
                    <div style="font-size:13px; line-height:1.6; color:#6a7787;">Website: {escape(SITE_URL)}</div>
                    <div style="font-size:12px; line-height:1.6; color:#95a0af; margin-top:12px;">
                      This is an automated LankaParts notification. Please contact support if you need assistance.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """
    return text_body, html_body


def welcome_email(name: str) -> tuple[str, str, str]:
    subject = "Welcome to LankaParts"
    text, html = _render_email(
        title="Welcome to LankaParts",
        intro=f"Hello {name}, your account has been created successfully.",
        sections=[
            ("What you can do next", "Browse products, place orders, and manage your marketplace activity."),
            ("Account status", "Your LankaParts account is now active."),
        ],
        closing="If you need any assistance, our support team will be happy to help.",
    )
    return subject, text, html


def new_order_admin_email(
    order_id: str,
    buyer_name: str,
    buyer_email: str,
    product_title: str,
    model_number: str | None,
    quantity: int,
    shipping_address: str,
    item_cost: float,
    buyer_phone: str | None = None,
    order_message: str | None = None,
) -> tuple[str, str, str]:
    subject = f"New LankaParts Order: {order_id}"
    text, html = _render_email(
        title="A new order has been placed",
        intro="A customer has submitted a new order that requires LankaParts review.",
        sections=[
            ("Order ID", order_id),
            ("Buyer", buyer_name),
            ("Buyer Email", buyer_email),
            ("Product", product_title),
            ("Model Number", model_number or "Not provided"),
            ("Item Cost", f"LKR {item_cost:,.2f}"),
            ("Quantity", str(quantity)),
            ("Shipping Address", shipping_address),
            ("Buyer Phone", buyer_phone or "Not provided"),
            ("Order Message", order_message or "No message provided"),
        ],
        closing="Please review the order and continue the next fulfillment steps in the admin dashboard.",
    )
    return subject, text, html


def new_order_buyer_email(
    name: str,
    order_id: str,
    product_title: str,
    model_number: str | None,
    quantity: int,
    shipping_address: str,
    item_cost: float,
    order_message: str | None = None,
) -> tuple[str, str, str]:
    subject = f"Your LankaParts Order Has Been Received: {order_id}"
    text, html = _render_email(
        title="Your order has been received",
        intro=f"Hello {name}, thank you for placing your order with LankaParts.",
        sections=[
            ("Order ID", order_id),
            ("Product", product_title),
            ("Model Number", model_number or "Not provided"),
            ("Item Cost", f"LKR {item_cost:,.2f}"),
            ("Quantity", str(quantity)),
            ("Shipping Address", shipping_address),
            ("Order Message", order_message or "No message provided"),
            ("Shipping Charge", f"LKR {MARKETPLACE_POLICIES['buyer_shipping_cost']:,.2f}"),
            ("Total Cost", f"LKR {calculate_order_total(item_cost, quantity):,.2f}"),
        ],
        closing="Our team will review your order shortly and keep you informed about the next update.",
    )
    return subject, text, html


def new_product_admin_email(
    product_id: str,
    seller_name: str,
    seller_email: str,
    title: str,
    price: float,
    category: str,
) -> tuple[str, str, str]:
    subject = f"New LankaParts Product Submitted: {title}"
    text, html = _render_email(
        title="A new product needs review",
        intro="A seller has submitted a product listing for marketplace approval.",
        sections=[
            ("Product ID", product_id),
            ("Title", title),
            ("Category", category),
            ("Price", f"LKR {price:,.2f}"),
            ("Seller", seller_name),
            ("Seller Email", seller_email),
        ],
        closing="Please review the listing details and approve or reject the submission from the admin panel.",
    )
    return subject, text, html


def new_product_seller_email(name: str, title: str, price: float, category: str) -> tuple[str, str, str]:
    subject = f"Your LankaParts Listing Has Been Submitted: {title}"
    agreement_lines = "\n".join(f"- {line}" for line in MARKETPLACE_POLICIES["seller_agreement"])
    text, html = _render_email(
        title="Your listing is pending review",
        intro=f"Hello {name}, your product listing has been submitted successfully and is now waiting for review.",
        sections=[
            ("Title", title),
            ("Category", category),
            ("Price", f"LKR {price:,.2f}"),
            ("Seller Service Agreement", agreement_lines),
        ],
        closing="We will notify you as soon as the LankaParts team approves or rejects the listing.",
    )
    return subject, text, html


def product_review_email(name: str, title: str, status: ProductStatus, item_cost: float) -> tuple[str, str, str]:
    approved = status == ProductStatus.active
    subject = f"Your LankaParts Listing Was {'Approved' if approved else 'Rejected'}: {title}"
    text, html = _render_email(
        title=f"Listing {'approved' if approved else 'rejected'}",
        intro=f"Hello {name}, the LankaParts team has completed the review of your listing.",
        sections=[
            ("Listing", title),
            ("Status", "Approved" if approved else "Rejected"),
            ("Item Cost", f"LKR {item_cost:,.2f}"),
        ],
        closing=(
            "Your listing is now live on the marketplace."
            if approved
            else "Please review the listing details, make the required changes, and submit it again when ready."
        ),
    )
    return subject, text, html


def order_status_email(
    name: str,
    order_id: str,
    product_title: str,
    item_cost: float,
    status: DeliveryStatus,
    quantity: int = 1,
    model_number: str | None = None,
    shipping_address: str | None = None,
    buyer_email: str | None = None,
    tracking_notes: str | None = None,
    order_message: str | None = None,
) -> tuple[str, str, str]:
    status_label = status.value.replace("_", " ").title()
    status_line = {
        DeliveryStatus.pending: "Your order has been approved and is now being prepared.",
        DeliveryStatus.rejected: "Your order could not be approved.",
        DeliveryStatus.picked_from_seller: "Your order has been picked up from the seller.",
        DeliveryStatus.in_delivery: "Your order is currently in transit.",
        DeliveryStatus.delivered: "Your order has been marked as delivered.",
        DeliveryStatus.pending_admin: "Your order is currently waiting for admin review.",
    }.get(status, f"Your order status has changed to {status_label}.")

    additional_note = "Delivery time is usually 3-5 working days." if status == DeliveryStatus.pending else ""
    if tracking_notes:
        additional_note = f"{additional_note}\nAdmin Notes: {tracking_notes}".strip()

    subject = f"LankaParts Order Update: {order_id}"
    text, html = _render_email(
        title="Order status update",
        intro=f"Hello {name}, {status_line}",
        sections=[
            ("Order ID", order_id),
            ("Product", product_title),
            ("Model Number", model_number or "Not provided"),
            ("Item Cost", f"LKR {item_cost:,.2f}"),
            ("Quantity", str(quantity)),
            ("Shipping Charge", f"LKR {MARKETPLACE_POLICIES['buyer_shipping_cost']:,.2f}"),
            ("Total Cost", f"LKR {calculate_order_total(item_cost, quantity):,.2f}"),
            ("Buyer Name", name),
            ("Buyer Email", buyer_email or "Not provided"),
            ("Buyer Address", shipping_address or "Not provided"),
            ("Order Message", order_message or "No message provided"),
            ("Status", status_label),
            ("Additional Information", additional_note or "No additional notes at this time."),
        ],
        closing="Please contact LankaParts support if you need any assistance regarding this order.",
    )
    return subject, text, html


def seller_restriction_email(name: str, reason: str, failed_orders_count: int) -> tuple[str, str, str]:
    subject = "Your LankaParts Seller Account Has Been Restricted"
    text, html = _render_email(
        title="Seller account restricted",
        intro=f"Hello {name}, your seller account has been restricted on LankaParts.",
        sections=[
            ("Failed Orders Recorded", str(failed_orders_count)),
            ("Reason", reason),
            ("Account Impact", "You cannot add new items to the platform while this restriction is active."),
        ],
        closing="Please contact LankaParts support if you would like assistance or a review of this restriction.",
    )
    return subject, text, html
