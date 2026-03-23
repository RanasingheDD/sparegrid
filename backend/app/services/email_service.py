import smtplib
from email.message import EmailMessage

from app.config import settings
from app.services import email_templates
from app.schemas.schemas import DeliveryStatus, ProductStatus


def _can_send_email() -> bool:
    return bool(settings.SMTP_USERNAME and settings.SMTP_PASSWORD and settings.SUPPORT_EMAIL)


def send_email(to_email: str, subject: str, text_body: str, html_body: str | None = None) -> None:
    if not _can_send_email() or not to_email:
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.SMTP_USERNAME
    message["To"] = to_email
    message.set_content(text_body)
    if html_body:
        message.add_alternative(html_body, subtype="html")

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(message)


def send_welcome_email(*, user_email: str, user_name: str) -> None:
    subject, text_body, html_body = email_templates.welcome_email(user_name)
    send_email(user_email, subject, text_body, html_body)


def send_new_order_notifications(*, order_id: str, buyer_name: str, buyer_email: str, product_title: str, quantity: int, shipping_address: str, item_cost: float) -> None:
    admin_subject, admin_text, admin_html = email_templates.new_order_admin_email(
        order_id=order_id,
        buyer_name=buyer_name,
        buyer_email=buyer_email,
        product_title=product_title,
        quantity=quantity,
        shipping_address=shipping_address,
        item_cost=item_cost,
    )
    buyer_subject, buyer_text, buyer_html = email_templates.new_order_buyer_email(
        name=buyer_name,
        order_id=order_id,
        product_title=product_title,
        quantity=quantity,
        shipping_address=shipping_address,
        item_cost=item_cost,
    )
    send_email(settings.SUPPORT_EMAIL, admin_subject, admin_text, admin_html)
    send_email(buyer_email, buyer_subject, buyer_text, buyer_html)


def send_new_product_notifications(*, seller_email: str, seller_name: str, product_id: str, title: str, price: float, category: str) -> None:
    admin_subject, admin_text, admin_html = email_templates.new_product_admin_email(
        product_id=product_id,
        seller_name=seller_name,
        seller_email=seller_email,
        title=title,
        price=price,
        category=category,
    )
    seller_subject, seller_text, seller_html = email_templates.new_product_seller_email(
        name=seller_name,
        title=title,
        price=price,
        category=category,
    )
    send_email(settings.SUPPORT_EMAIL, admin_subject, admin_text, admin_html)
    send_email(seller_email, seller_subject, seller_text, seller_html)


def send_product_review_email(*, seller_email: str, seller_name: str, title: str, status: ProductStatus, item_cost: float) -> None:
    subject, text_body, html_body = email_templates.product_review_email(seller_name, title, status, item_cost)
    send_email(seller_email, subject, text_body, html_body)


def send_order_status_email(*, buyer_email: str, buyer_name: str, order_id: str, product_title: str, item_cost: float, status: DeliveryStatus, tracking_notes: str | None = None) -> None:
    subject, text_body, html_body = email_templates.order_status_email(
        name=buyer_name,
        order_id=order_id,
        product_title=product_title,
        item_cost=item_cost,
        status=status,
        tracking_notes=tracking_notes,
    )
    send_email(buyer_email, subject, text_body, html_body)


def send_seller_restriction_email(*, seller_email: str, seller_name: str, reason: str, failed_orders_count: int) -> None:
    subject, text_body, html_body = email_templates.seller_restriction_email(
        seller_name,
        reason,
        failed_orders_count,
    )
    send_email(seller_email, subject, text_body, html_body)
