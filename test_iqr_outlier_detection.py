"""Test script to demonstrate MAD outlier detection with real data"""

import numpy as np
from google_shopping_scraper.tools.filters import ProductFilter

# Your actual prices from the scraper
prices = [
    549.0, 649.0, 599.0, 649.0, 555.0, 504.96, 589.0, 511.0,
    366.02,  # * outlier
    599.0,
    393.0,   # * outlier
    60.95,   # * outlier
    599.0, 569.0, 569.0, 535.0, 559.0,
    732.8,   # * outlier
    391.0,   # * outlier
    646.86,
    38.82,   # * outlier
    165.43,  # * outlier
    63.0,    # * outlier
    36.5,    # * outlier
    17.7,    # * outlier
    33.88    # * outlier
]

# Expected outliers marked by user
expected_outliers = {366.02, 393.0, 60.95, 732.8, 391.0, 38.82, 165.43, 63.0, 36.5, 17.7, 33.88}

# Create mock products
products = [{"extracted_price": price, "title": f"Product ${price:.2f}"} for price in prices]

# Initialize filter
product_filter = ProductFilter()

# Run MAD detection
results = product_filter.detect_price_outliers_by_iqr(products, mad_threshold=3.5)

print("=" * 100)
print("MAD (MEDIAN ABSOLUTE DEVIATION) OUTLIER DETECTION TEST - YOUR ACTUAL DATA")
print("=" * 100)

# Calculate statistics
prices_array = np.array(prices)
median = np.median(prices_array)
absolute_deviations = np.abs(prices_array - median)
mad = np.median(absolute_deviations)
lower_bound = median - (3.5 * mad / 0.6745)
upper_bound = median + (3.5 * mad / 0.6745)

print(f"\nStatistics:")
print(f"  Median: ${median:.2f}")
print(f"  MAD (Median Absolute Deviation): ${mad:.2f}")
print(f"  Lower Bound (Median - 3.5*MAD): ${lower_bound:.2f}")
print(f"  Upper Bound (Median + 3.5*MAD): ${upper_bound:.2f}")

print(f"\n{'='*100}")
print("RESULTS:")
print("=" * 100)

outliers_detected = []
valid_prices = []
correctly_flagged = 0
incorrectly_flagged = 0
missed_outliers = 0

for i, (price, (is_outlier, distance, reasons)) in enumerate(zip(prices, results.values())):
    if is_outlier:
        outliers_detected.append(price)
        status = "[OUTLIER]"

        # Check if this was correctly identified
        if price in expected_outliers:
            status += " (CORRECT)"
            correctly_flagged += 1
        else:
            status += " (FALSE POSITIVE)"
            incorrectly_flagged += 1

        print(f"\n{status} ${price:.2f}")
        for reason in reasons:
            print(f"  - {reason}")
    else:
        valid_prices.append(price)

        # Check if we missed an outlier
        if price in expected_outliers:
            missed_outliers += 1
            print(f"\n[MISSED OUTLIER] ${price:.2f} - Should have been flagged!")

print(f"\n{'='*100}")
print("ACCURACY METRICS:")
print("=" * 100)
print(f"Expected outliers (marked by you): {len(expected_outliers)}")
print(f"Outliers detected by MAD: {len(outliers_detected)}")
print(f"Correctly identified: {correctly_flagged}")
print(f"False positives: {incorrectly_flagged}")
print(f"Missed outliers: {missed_outliers}")
print(f"Accuracy: {(correctly_flagged / len(expected_outliers) * 100):.1f}%")

print(f"\n{'='*100}")
print("SUMMARY:")
print("=" * 100)
print(f"Total prices: {len(prices)}")
print(f"Outliers detected: {len(outliers_detected)}")
print(f"Valid prices kept: {len(valid_prices)}")
print(f"\nDetected outlier prices: {sorted(outliers_detected)}")
if valid_prices:
    print(f"\nValid price range: ${min(valid_prices):.2f} - ${max(valid_prices):.2f}")
    print(f"Valid price median: ${np.median(valid_prices):.2f}")
    print(f"Valid price mean: ${np.mean(valid_prices):.2f}")
print("=" * 100)
