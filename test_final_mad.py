from google_shopping_scraper.tools.filters import ProductFilter

prices = [549.0, 649.0, 599.0, 649.0, 555.0, 504.96, 589.0, 511.0, 366.02, 599.0, 393.0, 60.95, 599.0, 569.0, 569.0, 535.0, 559.0, 732.8, 391.0, 646.86, 38.82, 165.43, 63.0, 36.5, 17.7, 33.88]
products = [{'extracted_price': p} for p in prices]
f = ProductFilter()
results = f.detect_price_outliers_by_iqr(products, mad_threshold=2.2)
outliers = [p for p, (is_out, _, _) in zip(prices, results.values()) if is_out]
expected = {366.02, 393.0, 60.95, 732.8, 391.0, 38.82, 165.43, 63.0, 36.5, 17.7, 33.88}
correctly_flagged = set(outliers) & expected
false_positives = set(outliers) - expected
missed = expected - set(outliers)
valid = [p for p in prices if p not in outliers]

print("=" * 80)
print("MAD OUTLIER DETECTION - THRESHOLD 2.2 (DEFAULT)")
print("=" * 80)
print(f"\nOutliers detected: {sorted(outliers)}")
print(f"\nExpected outliers: {sorted(expected)}")
print(f"\nCorrectly flagged: {sorted(correctly_flagged)}")
print(f"Missed: {sorted(missed)}")
print(f"False positives: {sorted(false_positives)}")
print(f"\nAccuracy: {len(correctly_flagged)}/{len(expected)} = {len(correctly_flagged)/len(expected)*100:.1f}%")
print(f"Precision: {len(correctly_flagged)}/{len(outliers)} = {len(correctly_flagged)/len(outliers)*100:.1f}%")
print(f"\nValid prices kept: {len(valid)}")
print(f"Valid price range: ${min(valid):.2f} - ${max(valid):.2f}")
print("=" * 80)
