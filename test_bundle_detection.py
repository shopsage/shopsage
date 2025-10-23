"""Test script to demonstrate bundle/combo detection logic"""

from google_shopping_scraper.tools.filters import ProductFilter

# Initialize filter
product_filter = ProductFilter()

# Test cases
test_titles = [
    # Should PASS (same model, different formats)
    "Sony Singapore Wh-1000Xm6 | Wh1000Xm6 | 1000Xm6 Wireless Noise Cancelling Headphones",

    # Should FAIL (different models: XM5 and XM6)
    "Sony Singapore Wh-1000Xm6 | Wh1000Xm5 | 1000Xm6 Wireless Noise Cancelling Headphones",

    # Should FAIL (XM5 and XM6 combo from your example)
    "SONY WH-1000XM6 / WH-1000XM5 Black /Silver",

    # Should PASS (just color options)
    "Sony WH-1000XM6 Black/Silver Wireless Headphones",

    # Should FAIL (different iPhone models)
    "iPhone 14 / iPhone 15 Bundle",

    # Should PASS (single model)
    "Sony WH-1000XM6 Premium Wireless Noise Cancelling Headphones",

    # Should FAIL (keyword "bundle")
    "Sony WH-1000XM6 Bundle with Case",

    # Should FAIL (keyword "pack of")
    "Pack of 2 Sony Headphones",
]

print("=" * 80)
print("BUNDLE/COMBO DETECTION TEST RESULTS")
print("=" * 80)

for i, title in enumerate(test_titles, 1):
    is_bundle, reasons = product_filter.check_bundle_listing(title)

    status = "[REJECTED]" if is_bundle else "[ACCEPTED]"

    print(f"\n{i}. {status}")
    print(f"   Title: {title}")

    if is_bundle:
        print(f"   Reasons:")
        for reason in reasons:
            print(f"     - {reason}")
    else:
        print(f"   Reasons: Clean listing (no bundle indicators)")

print("\n" + "=" * 80)
