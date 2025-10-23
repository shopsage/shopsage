from google_shopping_scraper.tools.filters import ProductFilter

prices = [549.0, 649.0, 599.0, 649.0, 555.0, 504.96, 589.0, 511.0, 366.02, 599.0, 393.0, 60.95, 599.0, 569.0, 569.0, 535.0, 559.0, 732.8, 391.0, 646.86, 38.82, 165.43, 63.0, 36.5, 17.7, 33.88]
products = [{'extracted_price': p} for p in prices]
f = ProductFilter()

borderline_outliers = [366.02, 391.0, 393.0, 732.8]

print("=" * 80)
print("TESTING MAD THRESHOLDS FOR BORDERLINE OUTLIERS ($366, $391, $393, $733)")
print("=" * 80)

for threshold in [2.1, 2.0, 1.9, 1.8]:
    results = f.detect_price_outliers_by_iqr(products, mad_threshold=threshold)
    all_outliers = [p for p, (is_out, _, _) in zip(prices, results.values()) if is_out]
    caught_borderline = [o for o in all_outliers if o in borderline_outliers]
    valid = [p for p in prices if p not in all_outliers]

    print(f"\nThreshold {threshold}:")
    print(f"  Borderline outliers caught: {caught_borderline}")
    print(f"  Total outliers: {len(all_outliers)}")
    print(f"  Valid price range: ${min(valid):.2f} - ${max(valid):.2f}")

print("=" * 80)
