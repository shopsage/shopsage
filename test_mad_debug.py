import numpy as np

prices = [549.0, 649.0, 599.0, 649.0, 555.0, 504.96, 589.0, 511.0, 366.02, 599.0, 393.0, 60.95, 599.0, 569.0, 569.0, 535.0, 559.0, 732.8, 391.0, 646.86, 38.82, 165.43, 63.0, 36.5, 17.7, 33.88]

prices_array = np.array(prices)
median = np.median(prices_array)
absolute_deviations = np.abs(prices_array - median)
mad = np.median(absolute_deviations)

print("=" * 80)
print("MAD CALCULATION DEBUG")
print("=" * 80)
print(f"Median: ${median:.2f}")
print(f"MAD: ${mad:.2f}")
print(f"\nPrices sorted: {sorted(prices)}")
print(f"\nAbsolute deviations: {sorted(absolute_deviations)}")

for threshold in [1.5, 1.3, 1.0, 0.95, 0.90]:
    lower_bound = median - (threshold * mad / 0.6745)
    upper_bound = median + (threshold * mad / 0.6745)
    print(f"\nThreshold {threshold}:")
    print(f"  Lower bound: ${lower_bound:.2f}")
    print(f"  Upper bound: ${upper_bound:.2f}")

    outliers_low = [p for p in prices if p < lower_bound]
    outliers_high = [p for p in prices if p > upper_bound]

    print(f"  Low outliers: {sorted(outliers_low)}")
    print(f"  High outliers: {sorted(outliers_high)}")

print("=" * 80)
