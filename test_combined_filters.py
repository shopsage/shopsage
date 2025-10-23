"""Test combined MAD + Too Good To Be True filters with real data"""

import numpy as np
from google_shopping_scraper.tools.filters import ProductFilter

# Your actual data
prices = [
    549.0, 649.0, 599.0, 649.0, 555.0, 504.96, 589.0, 511.0,
    366.02, 599.0, 393.0, 60.95, 599.0, 569.0, 569.0, 535.0,
    559.0, 732.8, 391.0, 646.86, 38.82, 165.43, 63.0, 36.5, 17.7, 33.88
]

products = [{"extracted_price": p, "title": f"Product ${p:.2f}"} for p in prices]
product_filter = ProductFilter()

print("=" * 80)
print("COMBINED FILTERS TEST - YOUR ACTUAL DATA")
print("=" * 80)

median = np.median(prices)
mad = np.median(np.abs(np.array(prices) - median))
too_good_limit = median * 0.75

print(f"\nMedian: ${median:.2f}")
print(f"MAD: ${mad:.2f}")
print(f"MAD bounds (threshold 0.9): ${median - (0.9 * mad / 0.6745):.2f} - ${median + (0.9 * mad / 0.6745):.2f}")
print(f"Too Good limit (25% below median): ${too_good_limit:.2f}")

# Run with both filters
results = product_filter.detect_price_outliers_by_iqr(
    products,
    mad_threshold=0.9,
    too_good_threshold=0.25
)

print("\n" + "=" * 80)
print("OUTLIERS DETECTED")
print("=" * 80)

mad_outliers = []
too_good_outliers = []
valid_prices = []

for price, (is_outlier, score, reasons) in zip(prices, results.values()):
    if is_outlier:
        if reasons and "Too good to be true" in reasons[0]:
            too_good_outliers.append(price)
            print(f"\n[TOO GOOD] ${price:.2f}")
        else:
            mad_outliers.append(price)
            print(f"\n[MAD OUTLIER] ${price:.2f}")

        for reason in reasons:
            print(f"  - {reason}")
    else:
        valid_prices.append(price)

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Total prices: {len(prices)}")
print(f"MAD outliers: {len(mad_outliers)}")
print(f"  {sorted(mad_outliers)}")
print(f"Too good outliers: {len(too_good_outliers)}")
print(f"  {sorted(too_good_outliers)}")
print(f"Total filtered: {len(mad_outliers) + len(too_good_outliers)}")
print(f"\nValid prices kept: {len(valid_prices)}")
print(f"Valid price range: ${min(valid_prices):.2f} - ${max(valid_prices):.2f}")
print(f"Valid price median: ${np.median(valid_prices):.2f}")
print(f"Valid price mean: ${np.mean(valid_prices):.2f}")
print("=" * 80)
