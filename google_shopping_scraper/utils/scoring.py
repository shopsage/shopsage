"""Scoring and evaluation utilities"""

import numpy as np
from typing import List, Dict, Any, Optional


class ProductScorer:
    """Scores and ranks products based on multiple criteria"""

    # Known trusted retailers (add more as needed)
    TRUSTED_STORES = {
        "shopee.com",
        "shopee",
        "lazada.com",
        "Lazada Singapore",
        "challenger",
        "gaincity",
        "courts",
        "Harvey Norman Singapore",
        "bestdenki",
        "amazon.com",
        "amazon",
        "Amazon.sg - Seller",
        "qoo10",
        "qoo10.sg",
        "walmart.com",
        "walmart",
        "target.com",
        "target",
        "bestbuy.com",
        "best buy",
        "newegg.com",
        "newegg",
        "NTUC FairPrice",
        "Cold Storage",
        "Giant",
    }

    PREMIUM_STORES = {
        "amazon.com",
        "amazon",
        "bestbuy.com",
        "best buy",
        "gaincity",
        "courts",
        "Harvey Norman Singapore",
        "bestdenki",
    }

    def __init__(
        self,
        price_weight: float = 0.40,
        rating_weight: float = 0.30,
        reputation_weight: float = 0.20,
        review_count_weight: float = 0.10,
    ):
        """
        Initialize scorer with weights

        Args:
            price_weight: Weight for price component (default 40%)
            rating_weight: Weight for rating component (default 30%)
            reputation_weight: Weight for store reputation (default 20%)
            review_count_weight: Weight for review count (default 10%)
        """
        total = price_weight + rating_weight + reputation_weight + review_count_weight
        if not np.isclose(total, 1.0):
            raise ValueError(f"Weights must sum to 1.0, got {total}")

        self.weights = {
            "price": price_weight,
            "rating": rating_weight,
            "reputation": reputation_weight,
            "review_count": review_count_weight,
        }

    def score_price(self, price: float, all_prices: List[float]) -> float:
        """
        Score a product's price (lower price = higher score)

        Uses min-max normalization with inversion (lower price = higher score)

        Args:
            price: Product price
            all_prices: All valid prices for normalization

        Returns:
            Score from 0-10
        """
        if not all_prices or len(all_prices) < 2:
            return 5.0  # Neutral score if no comparison available

        min_price = min(all_prices)
        max_price = max(all_prices)

        if max_price == min_price:
            return 10.0  # All prices the same

        # Normalize (0-1) then invert and scale to 0-10
        normalized = (price - min_price) / (max_price - min_price)
        inverted = 1 - normalized  # Lower price = higher score
        return inverted * 10

    def score_rating(self, rating: Optional[float]) -> float:
        """
        Score a product's rating

        Args:
            rating: Star rating (typically 0-5)

        Returns:
            Score from 0-10
        """
        if rating is None or rating <= 0:
            return 0.0

        # Assume rating is on 5-star scale, convert to 10-point scale
        return (rating / 5.0) * 10

    def score_reputation(self, source: str) -> float:
        """
        Score store reputation

        Args:
            source: Store/source name

        Returns:
            Score from 0-10
        """
        source_lower = source.lower().strip()

        # Check if premium store
        for store in self.PREMIUM_STORES:
            if store in source_lower:
                return 10.0

        # Check if trusted store
        for store in self.TRUSTED_STORES:
            if store in source_lower:
                return 9.0

        # Unknown store gets neutral-low score
        return 5.0

    def score_review_count(self, review_count: Optional[int], all_counts: List[int]) -> float:
        """
        Score based on number of reviews (log scale)

        More reviews = higher confidence in rating

        Args:
            review_count: Number of reviews
            all_counts: All review counts for normalization

        Returns:
            Score from 0-10
        """
        if review_count is None or review_count <= 0:
            return 0.0

        # Use log scale to handle wide range of review counts
        log_count = np.log1p(review_count)

        if not all_counts:
            return 5.0

        # Get log of all counts
        log_counts = [np.log1p(c) for c in all_counts if c > 0]

        if not log_counts:
            return 5.0

        max_log = max(log_counts)
        min_log = min(log_counts)

        if max_log == min_log:
            return 10.0

        # Normalize to 0-10
        normalized = (log_count - min_log) / (max_log - min_log)
        return normalized * 10

    def calculate_composite_score(
        self,
        price_score: float,
        rating_score: float,
        reputation_score: float,
        review_count_score: float,
    ) -> float:
        """
        Calculate weighted composite score

        Args:
            price_score: Price component score
            rating_score: Rating component score
            reputation_score: Reputation component score
            review_count_score: Review count component score

        Returns:
            Composite score from 0-10
        """
        composite = (
            price_score * self.weights["price"]
            + rating_score * self.weights["rating"]
            + reputation_score * self.weights["reputation"]
            + review_count_score * self.weights["review_count"]
        )
        return round(composite, 2)

    def get_store_info(self, source: str) -> Dict[str, Any]:
        """
        Get detailed store information

        Args:
            source: Store name

        Returns:
            Dictionary with store info
        """
        source_lower = source.lower().strip()

        is_premium = any(store in source_lower for store in self.PREMIUM_STORES)
        is_trusted = any(store in source_lower for store in self.TRUSTED_STORES)

        if is_premium:
            tier = "A+"
            notes = "Premium retailer with excellent reputation"
        elif is_trusted:
            tier = "A"
            notes = "Trusted retailer"
        else:
            tier = "B"
            notes = "Unknown or less common retailer"

        return {"is_known": is_trusted or is_premium, "reputation_tier": tier, "notes": notes}


def calculate_price_analysis(products: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate comprehensive price analysis

    Args:
        products: List of product dictionaries

    Returns:
        Dictionary with price statistics and insights
    """
    prices = [p.get("extracted_price") for p in products if p.get("extracted_price")]

    if not prices:
        return {
            "lowest_price": None,
            "highest_price": None,
            "median_price": None,
            "average_price": None,
            "price_range": None,
            "std_deviation": None,
            "recommended_price_range": None,
        }

    prices_array = np.array(prices)

    lowest = float(np.min(prices_array))
    highest = float(np.max(prices_array))
    median = float(np.median(prices_array))
    average = float(np.mean(prices_array))
    std_dev = float(np.std(prices_array))

    # Recommended price range: median ± 0.5 std dev
    recommended_min = max(lowest, median - 0.5 * std_dev)
    recommended_max = min(highest, median + 0.5 * std_dev)

    return {
        "lowest_price": round(lowest, 2),
        "highest_price": round(highest, 2),
        "median_price": round(median, 2),
        "average_price": round(average, 2),
        "price_range": round(highest - lowest, 2),
        "std_deviation": round(std_dev, 2),
        "recommended_price_range": [
            round(recommended_min, 2),
            round(recommended_max, 2),
        ],
    }


def calculate_price_percentile(price: float, all_prices: List[float]) -> float:
    """
    Calculate price percentile (0-100)

    Args:
        price: Target price
        all_prices: All prices for comparison

    Returns:
        Percentile (0-100)
    """
    if not all_prices:
        return 50.0

    percentile = (sum(1 for p in all_prices if p <= price) / len(all_prices)) * 100
    return round(percentile, 1)


def calculate_price_vs_median(price: float, median_price: float) -> float:
    """
    Calculate percentage difference from median

    Args:
        price: Target price
        median_price: Median price

    Returns:
        Percentage difference (negative = below median)
    """
    if median_price == 0:
        return 0.0

    diff = ((price - median_price) / median_price) * 100
    return round(diff, 1)
