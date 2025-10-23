"""Test the 'too good to be true' price filter"""

import numpy as np
from google_shopping_scraper.tools.filters import ProductFilter

# Sample prices - median will be around $569
prices = [549.0, 649.0, 599.0, 649.0, 555.0, 504.96, 589.0, 511.0, 599.0, 599.0, 569.0, 569.0, 535.0, 559.0, 646.86]

# Add some "too good to be true" prices
too_good_prices = [391.0, 393.0, 366.0, 400.0]  # These are >25% below median

all_prices = prices + too_good_prices

# Create mock products
products = [{"extracted_price": p, "title": f"Product ${p:.2f}"} for p in all_prices]

# Initialize filter
product_filter = ProductFilter()

print("=" * 80)
print("TOO GOOD TO BE TRUE FILTER TEST")
print("=" * 80)

# Calculate median
median = np.median(all_prices)
threshold_25_percent = median * 0.75

print(f"\nMedian price: ${median:.2f}")
print(f"25% below median threshold: ${threshold_25_percent:.2f}")
print(f"\nPrices that should be flagged (>25% below ${median:.2f}):")
for p in too_good_prices:
    percent_below = ((median - p) / median) * 100
    print(f"  ${p:.2f} - {percent_below:.1f}% below median")

# Run detection with too_good_threshold enabled
print("\n" + "=" * 80)
print("DETECTION RESULTS (with too_good_threshold=0.25)")
print("=" * 80)

results = product_filter.detect_price_outliers_by_iqr(
    products,
    mad_threshold=0.9,
    too_good_threshold=0.25
)

flagged_as_outliers = []
too_good_flagged = []

for i, (price, (is_outlier, score, reasons)) in enumerate(zip(all_prices, results.values())):
    if is_outlier:
        flagged_as_outliers.append(price)
        if reasons and "Too good to be true" in reasons[0]:
            too_good_flagged.append(price)
            print(f"\n[TOO GOOD] ${price:.2f}")
            for reason in reasons:
                print(f"  - {reason}")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Total prices: {len(all_prices)}")
print(f"Flagged as outliers: {len(flagged_as_outliers)}")
print(f"Flagged as 'too good to be true': {len(too_good_flagged)}")
print(f"\nExpected 'too good' outliers: {too_good_prices}")
print(f"Actually flagged as 'too good': {sorted(too_good_flagged)}")

# Check accuracy
expected_set = set(too_good_prices)
flagged_set = set(too_good_flagged)
correct = expected_set & flagged_set

print(f"\nCorrectly identified: {len(correct)}/{len(expected_set)}")
print("=" * 80)
