"""Filtering utilities for product listings"""

import re
from typing import List, Dict, Any, Tuple
import numpy as np

try:
    from Levenshtein import ratio as levenshtein_ratio
except ImportError:
    # Fallback to basic string similarity if Levenshtein not available
    def levenshtein_ratio(s1: str, s2: str) -> float:
        s1, s2 = s1.lower(), s2.lower()
        if s1 == s2:
            return 1.0
        if s1 in s2 or s2 in s1:
            return 0.8
        return 0.0


class ProductFilter:
    """Filters for product listings with enrichment metadata"""

    def __init__(
        self,
        brand_threshold: float = 0.7,
        model_threshold: float = 0.7,
        price_outlier_std: float = 3.0,
    ):
        """
        Initialize filter with thresholds

        Args:
            brand_threshold: Minimum similarity score for brand matching (0-1)
            model_threshold: Minimum similarity score for model matching (0-1)
            price_outlier_std: Number of standard deviations for outlier detection
        """
        self.brand_threshold = brand_threshold
        self.model_threshold = model_threshold
        self.price_outlier_std = price_outlier_std

        # Bundle/grouped listing indicators (keyword-based)
        self.bundle_keywords = [
            r"\bpack of\b",
            r"\bpack\b.*\d+",
            r"\d+\s*pack",
            r"\bbundle\b",
            r"\bset of\b",
            r"\d+\s*piece",
            r"\blot of\b",
            r"\bmulti.*pack\b",
            r"\bcombo\b",
        ]

    def calculate_string_similarity(self, str1: str, str2: str) -> float:
        """
        Calculate similarity between two strings

        Args:
            str1: First string
            str2: Second string

        Returns:
            Similarity score (0-1)
        """
        if not str1 or not str2:
            return 0.0

        return levenshtein_ratio(str1.lower(), str2.lower())

    def check_brand_match(
        self, product_title: str, target_brand: str
    ) -> Tuple[bool, float, List[str]]:
        """
        Check if product matches target brand

        Args:
            product_title: Product title to check
            target_brand: Expected brand name

        Returns:
            Tuple of (matches, score, reasons)
        """
        if not target_brand:
            return True, 1.0, ["No brand filter specified"]

        title_lower = product_title.lower()
        brand_lower = target_brand.lower()

        # Direct substring match (strongest indicator)
        if brand_lower in title_lower:
            return True, 1.0, [f"Exact brand match: '{target_brand}'"]

        # Fuzzy match
        score = self.calculate_string_similarity(product_title, target_brand)
        if score >= self.brand_threshold:
            return True, score, [f"Brand similarity: {score:.2f}"]

        # Check if brand appears as separate word
        words = title_lower.split()
        for word in words:
            word_score = self.calculate_string_similarity(word, brand_lower)
            if word_score >= self.brand_threshold:
                return True, word_score, [f"Brand word match: {word_score:.2f}"]

        return False, score, [f"Brand mismatch (score: {score:.2f} < {self.brand_threshold})"]

    def check_model_match(
        self, product_title: str, target_model: str
    ) -> Tuple[bool, float, List[str]]:
        """
        Check if product matches target model

        Args:
            product_title: Product title to check
            target_model: Expected model identifier

        Returns:
            Tuple of (matches, score, reasons)
        """
        if not target_model:
            return True, 1.0, ["No model filter specified"]

        title_lower = product_title.lower()
        model_lower = target_model.lower()

        # Remove common separators for better matching
        normalized_title = re.sub(r"[-_\s]+", "", title_lower)
        normalized_model = re.sub(r"[-_\s]+", "", model_lower)

        # Direct match in normalized form
        if normalized_model in normalized_title:
            return True, 1.0, [f"Exact model match: '{target_model}'"]

        # Fuzzy match
        score = self.calculate_string_similarity(product_title, target_model)
        if score >= self.model_threshold:
            return True, score, [f"Model similarity: {score:.2f}"]

        return False, score, [f"Model mismatch (score: {score:.2f} < {self.model_threshold})"]

    def detect_model_variants(self, product_title: str) -> Tuple[bool, List[str]]:
        """
        Detect if title contains multiple DIFFERENT model identifiers

        Examples:
        - "WH-1000XM6 | WH1000XM6 | 1000XM6" → False (same model, just different formats)
        - "WH-1000XM6 | WH-1000XM5" → True (different models: XM6 vs XM5)
        - "iPhone 14 / iPhone 15" → True (different models: 14 vs 15)
        - "Black/Silver" → False (no model identifiers)

        Args:
            product_title: Product title to check

        Returns:
            Tuple of (has_multiple_models, reasons)
        """
        # Pattern to extract model-like identifiers
        # Matches: WH-1000XM6, WH1000XM6, 1000XM6, XM6, iPhone14, etc.
        model_pattern = r'\b(?:[A-Z]{2,}[-\s]?\d{3,4}[A-Z]*\d+|[A-Z]+\d{3,4}[A-Z]*\d+|\d{3,4}[A-Z]+\d+|[A-Z]+\d+)\b'

        matches = re.findall(model_pattern, product_title, re.IGNORECASE)

        if len(matches) < 2:
            # Need at least 2 model-like patterns to compare
            return False, []

        # Normalize model identifiers to extract version/generation suffix
        normalized_models = set()

        for match in matches:
            # Remove spaces and hyphens for comparison
            cleaned = re.sub(r'[-\s]', '', match.upper())

            # Extract the version identifier (last alphanumeric sequence)
            # Examples:
            # "WH1000XM6" → extract "XM6"
            # "1000XM6" → extract "XM6"
            # "XM6" → extract "XM6"
            # "IPHONE14" → extract "14"

            # Look for pattern: letters followed by digits at the end (e.g., "XM6")
            version_match = re.search(r'([A-Z]+\d+)$', cleaned)
            if version_match:
                normalized_models.add(version_match.group(1))
            else:
                # If no letter+digit suffix, use last 2-4 digits
                digit_match = re.search(r'(\d{1,4})$', cleaned)
                if digit_match:
                    normalized_models.add(digit_match.group(1))
                else:
                    # Fallback: use the whole cleaned string
                    normalized_models.add(cleaned)

        # If we have 2+ unique normalized models, it's a combo listing
        if len(normalized_models) >= 2:
            reasons = [
                f"Multiple model variants detected: {', '.join(sorted(normalized_models))}",
                f"Found in: {' | '.join(matches[:3])}"  # Show first 3 matches
            ]
            return True, reasons

        return False, []

    def check_bundle_listing(self, product_title: str) -> Tuple[bool, List[str]]:
        """
        Check if product is a bundle or grouped listing

        Combines two detection methods:
        1. Keyword-based: Looks for "pack of", "bundle", "combo", etc.
        2. Model variant detection: Detects multiple different model identifiers

        Args:
            product_title: Product title to check

        Returns:
            Tuple of (is_bundle, reasons)
        """
        title_lower = product_title.lower()
        reasons = []

        # Check 1: Keyword-based bundle detection
        for pattern in self.bundle_keywords:
            if re.search(pattern, title_lower):
                reasons.append(f"Bundle keyword: '{pattern}'")

        # Check 2: Model variant detection (multiple different models in title)
        # has_variants, variant_reasons = self.detect_model_variants(product_title)
        # if has_variants:
        #     reasons.extend(variant_reasons)

        return len(reasons) > 0, reasons

    def detect_price_outliers(
        self, products: List[Dict[str, Any]]
    ) -> Dict[int, Tuple[bool, float, List[str]]]:
        """
        Detect price outliers using z-score method

        Args:
            products: List of product dictionaries with 'extracted_price' field

        Returns:
            Dictionary mapping product index to (is_outlier, z_score, reasons)
        """
        prices = []
        valid_indices = []

        for i, product in enumerate(products):
            price = product.get("extracted_price")
            if price is not None and price > 0:
                prices.append(price)
                valid_indices.append(i)

        if len(prices) < 3:
            # Not enough data for outlier detection
            return {
                i: (False, 0.0, ["Insufficient data for outlier detection"])
                for i in range(len(products))
            }

        prices_array = np.array(prices)
        mean_price = np.mean(prices_array)
        std_price = np.std(prices_array)

        results = {}

        for i, product in enumerate(products):
            price = product.get("extracted_price")

            if price is None or price <= 0:
                results[i] = (False, 0.0, ["No valid price"])
                continue

            if std_price == 0:
                results[i] = (False, 0.0, ["No price variation"])
                continue

            z_score = (price - mean_price) / std_price

            if abs(z_score) > self.price_outlier_std:
                direction = "low" if z_score < 0 else "high"
                reasons = [
                    f"Price outlier ({direction}): ${price:.2f}",
                    f"Z-score: {z_score:.2f} (threshold: ±{self.price_outlier_std})",
                    f"Mean: ${mean_price:.2f}, StdDev: ${std_price:.2f}",
                ]
                results[i] = (True, z_score, reasons)
            else:
                results[i] = (False, z_score, [])

        return results

    def detect_price_outliers_by_iqr(
        self, products: List[Dict[str, Any]], mad_threshold: float = 0.9, too_good_threshold: float = 0.25
    ) -> Dict[int, Tuple[bool, float, List[str]]]:
        """
        Detect price outliers using MAD (Median Absolute Deviation) method
        with additional "too good to be true" check

        MAD is the MOST robust outlier detection method. Unlike IQR or mean/std,
        it's not affected even when 40-50% of data are outliers. Perfect for
        noisy e-commerce data.

        Args:
            products: List of product dictionaries with 'extracted_price' field
            mad_threshold: Threshold in MAD units (default: 0.9)
                          - 0.9 = very aggressive (recommended for heavily contaminated data)
                          - 2.0 = aggressive
                          - 3.5 = moderate
                          - 5.0 = conservative
            too_good_threshold: Percentage below median to flag as "too good to be true" (default: 0.25 = 25%)
                               Set to 0 to disable this check

        Returns:
            Dictionary mapping product index to (is_outlier, mad_score, reasons)
        """
        prices = []
        valid_indices = []

        for i, product in enumerate(products):
            price = product.get("extracted_price")
            if price is not None and price > 0:
                prices.append(price)
                valid_indices.append(i)

        if len(prices) < 4:
            # Not enough data for outlier detection
            return {
                i: (False, 0.0, ["Insufficient data for outlier detection"])
                for i in range(len(products))
            }

        prices_array = np.array(prices)

        # Calculate median
        median_price = np.median(prices_array)

        # Calculate MAD (Median Absolute Deviation)
        absolute_deviations = np.abs(prices_array - median_price)
        mad = np.median(absolute_deviations)

        # Avoid division by zero
        if mad == 0:
            # If MAD is 0, use a fallback method (IQR)
            q1 = np.percentile(prices_array, 25)
            q3 = np.percentile(prices_array, 75)
            iqr = q3 - q1
            lower_bound = q1 - (1.5 * iqr)
            upper_bound = q3 + (1.5 * iqr)
        else:
            # Calculate bounds using MAD
            # Modified z-score = 0.6745 * (x - median) / MAD
            # Threshold of 3.5 is recommended for outlier detection
            lower_bound = median_price - (mad_threshold * mad / 0.6745)
            upper_bound = median_price + (mad_threshold * mad / 0.6745)

        results = {}

        for i, product in enumerate(products):
            price = product.get("extracted_price")

            if price is None or price <= 0:
                results[i] = (False, 0.0, ["No valid price"])
                continue

            # Calculate modified z-score (more robust than regular z-score)
            if mad > 0:
                modified_z_score = 0.6745 * (price - median_price) / mad
            else:
                modified_z_score = 0

            # Calculate "too good to be true" threshold
            too_good_price_limit = median_price * (1 - too_good_threshold)

            # Check if price is outside bounds or "too good to be true"
            if too_good_threshold > 0 and price < too_good_price_limit:
                # Price is suspiciously low (>25% below median by default)
                percent_below = ((median_price - price) / median_price) * 100
                reasons = [
                    f"Too good to be true: ${price:.2f}",
                    f"{percent_below:.1f}% below median (threshold: {too_good_threshold*100:.0f}%)",
                    f"Median: ${median_price:.2f}",
                ]
                results[i] = (True, percent_below, reasons)
            elif price < lower_bound:
                reasons = [
                    f"Price outlier (too low): ${price:.2f}",
                    f"Below lower bound: ${lower_bound:.2f}",
                    f"Median: ${median_price:.2f}, MAD: ${mad:.2f}",
                    f"Modified Z-score: {abs(modified_z_score):.2f}",
                ]
                results[i] = (True, abs(modified_z_score), reasons)
            elif price > upper_bound:
                reasons = [
                    f"Price outlier (too high): ${price:.2f}",
                    f"Above upper bound: ${upper_bound:.2f}",
                    f"Median: ${median_price:.2f}, MAD: ${mad:.2f}",
                    f"Modified Z-score: {abs(modified_z_score):.2f}",
                ]
                results[i] = (True, abs(modified_z_score), reasons)
            else:
                results[i] = (False, abs(modified_z_score), [])

        return results

    def calculate_filter_confidence(
        self, brand_score: float, model_score: float, checks_passed: int, total_checks: int
    ) -> float:
        """
        Calculate overall confidence score for a filtered product

        Args:
            brand_score: Brand match score
            model_score: Model match score
            checks_passed: Number of filter checks passed
            total_checks: Total number of filter checks

        Returns:
            Confidence score (0-1)
        """
        match_score = (brand_score + model_score) / 2
        pass_rate = checks_passed / total_checks if total_checks > 0 else 1.0
        return (match_score * 0.6) + (pass_rate * 0.4)


def remove_duplicates(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Remove duplicate products based on title and source

    Args:
        products: List of product dictionaries

    Returns:
        List with duplicates removed
    """
    seen = set()
    unique_products = []

    for product in products:
        # Create identifier from title and source
        identifier = (
            product.get("title", "").lower().strip(),
            product.get("source", "").lower().strip(),
        )

        if identifier not in seen:
            seen.add(identifier)
            unique_products.append(product)

    return unique_products
