MARKETPLACE_POLICIES = {
    "currency": "LKR",
    "minimum_item_price": 1000,
    "listing_service_charge": 200,
    "buyer_shipping_cost": 450,
    "failed_order_return_service_charge": 480,
    "seller_ship_within_hours": 48,
    "seller_payout_day": "Friday",
    "seller_restriction_after_failed_orders": 2,
    "seller_payment_release_rule": "Sellers are paid only after LankaParts verifies the part.",
    "seller_agreement": [
        "A non-refundable LankaParts service charge of LKR 200 applies to each approved listing.",
        "Seller must ship the item to LankaParts within 48 hours after order confirmation.",
        "LankaParts releases seller payments only after the part is verified by the LankaParts team.",
        "All seller payment handling is processed on Fridays.",
        "If a buyer rejects the part after review, LankaParts returns the item and charges delivery cost.", 
        #" After 2 failed orders, the seller account will be restricted.",
    ],
    "buyer_checkout_notice": "Shipping cost of LKR 450 will be charged on each order. Cash on delivery is available.",
    "terms_sections": [
        {
            "title": "Seller Rules",
            "items": [
                "Only items priced above LKR 1,000 are accepted on the platform.",
                "LankaParts charges a service fee of LKR 200 for each listing.",
                "Listings are reviewed by LankaParts before they go live.",
                "Seller must ship within 48 hours after LankaParts confirms the order.",
                #"After 2 failed orders, the seller account can be restricted.",
            ],
        },
        {
            "title": "Buyer Rules",
            "items": [
                "The total payable amount is item price plus the shipping charge.",
                "Cash on delivery is available for eligible orders.",
                "Buyers should provide a correct shipping address before placing the order.",
                "LankaParts reviews and coordinates delivery for each order.",
            ],
        },
    ],
}


def get_public_policies() -> dict:
    return MARKETPLACE_POLICIES


def calculate_order_total(item_price: float, quantity: int = 1) -> float:
    item_total = max(float(item_price or 0), 0) * max(int(quantity or 1), 1)
    return item_total + MARKETPLACE_POLICIES["buyer_shipping_cost"]
