"""
Bloomberg Scraper
=================
Scrapes forex headlines from Bloomberg FX Center.

Uses multiple methods to fetch headlines:
1. DuckDuckGo search for Bloomberg FX news (primary - most reliable)
2. Direct scraping with enhanced headers (fallback)
"""

import logging
from typing import Dict, List, Optional

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


def _get_article(data) -> Dict[str, str]:
    """
    Extract article headline and link from BeautifulSoup element.

    Args:
        data: BeautifulSoup element containing article data

    Returns:
        Dictionary with headline and link
    """
    href = data.get("href", "")
    if href.startswith("/"):
        href = "https://www.bloomberg.com" + href
    return {"headline": data.get_text().strip(), "link": href}


def _get_headlines_via_rss() -> Optional[List[Dict[str, str]]]:
    """
    Fetch forex headlines from Google News RSS feed for forex/FX news.

    Returns:
        List of article dictionaries or None on error
    """
    try:
        import urllib.parse

        # Google News RSS feed for forex news - use better search terms
        query = urllib.parse.quote("forex trading EUR USD GBP JPY currency market news")
        rss_url = f"https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"

        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml, */*",
        }

        resp = requests.get(rss_url, headers=headers, timeout=10)

        if resp.status_code != 200:
            logger.warning(f"Google News RSS returned status {resp.status_code}")
            return None

        soup = BeautifulSoup(resp.content, "xml")

        all_links = []
        items = soup.find_all("item")

        for item in items[:20]:  # Get more items to filter
            title = item.find("title")
            link = item.find("link")
            source = item.find("source")

            if title and link:
                headline = title.get_text().strip()
                url = link.get_text().strip()
                source_name = source.get_text().strip() if source else ""
                source_url = source.get("url") if source else None

                # Skip non-news content (converters, calculators, etc.)
                skip_keywords = [
                    "converter",
                    "calculator",
                    "exchange rate calculator",
                    "currency converter",
                ]
                if any(kw in headline.lower() for kw in skip_keywords):
                    continue

                # Clean headline - remove source suffix if present
                if source_name and headline.endswith(f" - {source_name}"):
                    headline = headline[: -len(f" - {source_name}")].strip()

                # Use source URL if available, otherwise use Google News link
                actual_url = source_url if source_url else url

                # Add source attribution to headline for context
                display_headline = f"{headline}"
                if source_name and source_name not in headline:
                    display_headline = f"{headline} ({source_name})"

                if headline and len(all_links) < 15:
                    all_links.append({"headline": display_headline, "link": actual_url})

        if all_links:
            logger.info(f"Fetched {len(all_links)} headlines via Google News RSS")
            return all_links

        return None

    except Exception as e:
        logger.error(f"Error fetching headlines via RSS: {e}")
        return None


def _get_forex_news_fallback() -> Optional[List[Dict[str, str]]]:
    """
    Fetch forex headlines from Investing.com as a fallback source.

    Returns:
        List of article dictionaries or None on error
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }

        resp = requests.get(
            "https://www.investing.com/news/forex-news", headers=headers, timeout=10
        )

        if resp.status_code != 200:
            logger.warning(f"Investing.com returned status {resp.status_code}")
            return None

        soup = BeautifulSoup(resp.content, "html.parser")

        all_links = []

        # Try multiple selectors for Investing.com
        selectors = [
            "a.title",
            ".articleItem a",
            "[data-test='article-title-link']",
            ".js-article-title",
        ]

        for selector in selectors:
            articles = soup.select(selector)
            for article in articles[:15]:
                headline = article.get_text().strip()
                link = article.get("href", "")

                if headline and link:
                    # Make absolute URL if relative
                    if link.startswith("/"):
                        link = "https://www.investing.com" + link

                    # Avoid duplicates
                    if not any(a["headline"] == headline for a in all_links):
                        all_links.append({"headline": headline, "link": link})

            if len(all_links) >= 10:
                break

        if all_links:
            logger.info(f"Fetched {len(all_links)} headlines from Investing.com")
            return all_links

        return None

    except Exception as e:
        logger.error(f"Error fetching from Investing.com: {e}")
        return None


def _get_headlines_direct() -> Optional[List[Dict[str, str]]]:
    """
    Fetch forex headlines directly from Bloomberg FX Center.

    Returns:
        List of article dictionaries or None on error
    """
    # Enhanced headers to mimic a real browser
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    }

    try:
        resp = requests.get("https://www.bloomberg.com/fx-center", headers=headers, timeout=15)

        if resp.status_code == 403:
            logger.warning("Bloomberg returned 403 Forbidden - site is blocking scraping")
            return None

        soup = BeautifulSoup(resp.content, "html.parser")

        all_links = []

        # Try multiple selectors as Bloomberg's HTML structure may vary
        selectors = [
            ".single-story-module__headline-link",
            ".grid-module-story__headline-link",
            ".story-list-story__info__headline-link",
            "a[href*='/news/articles/']",
            "[data-component='headline'] a",
            ".story-package-module__story__headline a",
        ]

        for selector in selectors:
            elements = soup.select(selector)
            for element in elements:
                try:
                    article = _get_article(element)
                    if article["headline"] and article["link"]:
                        # Avoid duplicates
                        if not any(a["link"] == article["link"] for a in all_links):
                            all_links.append(article)
                except Exception:
                    continue

        if all_links:
            logger.info(f"Fetched {len(all_links)} headlines from Bloomberg directly")

        return all_links if all_links else None

    except requests.exceptions.Timeout:
        logger.error("Timeout while fetching Bloomberg headlines")
        return None
    except Exception as e:
        logger.error(f"Error fetching Bloomberg headlines: {e}")
        return None


def get_headlines() -> Optional[List[Dict[str, str]]]:
    """
    Fetch forex headlines from various sources.

    Uses multiple methods in order of reliability:
    1. Google News RSS (most reliable)
    2. Investing.com forex news
    3. Direct Bloomberg scraping (often blocked)

    Returns:
        List of article dictionaries or empty list on error
    """
    # Try Google News RSS first (most reliable)
    headlines = _get_headlines_via_rss()

    if headlines and len(headlines) > 0:
        return headlines

    # Try Investing.com as fallback
    logger.info("RSS method failed, trying Investing.com...")
    headlines = _get_forex_news_fallback()

    if headlines and len(headlines) > 0:
        return headlines

    # Last resort: direct Bloomberg scraping
    logger.info("Fallback failed, trying direct Bloomberg scraping...")
    headlines = _get_headlines_direct()

    if headlines and len(headlines) > 0:
        return headlines

    # Return empty list instead of None to prevent frontend errors
    logger.warning("All headline fetch methods failed, returning empty list")
    return []
