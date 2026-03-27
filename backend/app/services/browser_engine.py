import asyncio
import time
import tracemalloc
from dataclasses import dataclass, field
from typing import Optional
from urllib.parse import urljoin, urlparse

import httpx
from selectolax.parser import HTMLParser


@dataclass
class InteractiveElement:
    id: str
    type: str  # button, input, link, select, textarea
    text: str
    href: Optional[str] = None
    placeholder: Optional[str] = None
    name: Optional[str] = None
    value: Optional[str] = None
    disabled: bool = False


@dataclass
class PageObservation:
    url: str
    title: str
    status_code: int
    text_content: str
    interactive_elements: list[InteractiveElement]
    links: list[dict]
    load_time_ms: float
    memory_mb: float
    content_length: int
    error: Optional[str] = None
    metadata: dict = field(default_factory=dict)


class BrowserEngine:
    """
    Lightweight AI-native browser engine.
    Uses httpx for async HTTP + selectolax for fast HTML parsing.
    No Chromium, no Puppeteer overhead.
    Memory footprint: ~15-25MB vs Chrome's ~200MB+
    """

    def __init__(self, timeout: float = 15.0, max_redirects: int = 5):
        self.timeout = timeout
        self.max_redirects = max_redirects
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(self.timeout),
                follow_redirects=True,
                max_redirects=self.max_redirects,
                headers={
                    "User-Agent": "LightCrocodileBot/1.0 (AI-native lightweight browser)",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Accept-Encoding": "gzip, deflate",
                },
            )
        return self._client

    async def fetch(self, url: str) -> PageObservation:
        start = time.perf_counter()
        tracemalloc.start()

        try:
            client = await self._get_client()
            response = await client.get(url)
            html = response.text
            status_code = response.status_code

            elapsed = (time.perf_counter() - start) * 1000
            current, peak = tracemalloc.get_traced_memory()
            tracemalloc.stop()
            memory_mb = peak / 1024 / 1024

            observation = self._parse(html, str(response.url), status_code, elapsed, memory_mb)
            return observation

        except httpx.TimeoutException:
            tracemalloc.stop()
            return PageObservation(
                url=url, title="", status_code=0, text_content="",
                interactive_elements=[], links=[],
                load_time_ms=(time.perf_counter() - start) * 1000,
                memory_mb=0, content_length=0,
                error="Request timed out",
            )
        except Exception as e:
            tracemalloc.stop()
            return PageObservation(
                url=url, title="", status_code=0, text_content="",
                interactive_elements=[], links=[],
                load_time_ms=(time.perf_counter() - start) * 1000,
                memory_mb=0, content_length=0,
                error=str(e),
            )

    def _parse(self, html: str, url: str, status_code: int, load_time_ms: float, memory_mb: float) -> PageObservation:
        tree = HTMLParser(html)

        # Remove noise nodes
        for tag in tree.css("script, style, noscript, head > *:not(title)"):
            tag.decompose()

        title = ""
        title_node = tree.css_first("title")
        if title_node:
            title = title_node.text(strip=True)

        # Extract clean text
        body = tree.css_first("body")
        text_content = body.text(separator=" ", strip=True)[:5000] if body else ""

        # Extract interactive elements
        elements = []
        idx = 0

        for a in tree.css("a[href]"):
            href = a.attributes.get("href", "")
            if href:
                full_url = urljoin(url, href) if not href.startswith("http") else href
                elements.append(InteractiveElement(
                    id=f"lnk_{idx}", type="link",
                    text=(a.text(strip=True) or href)[:100],
                    href=full_url,
                ))
                idx += 1

        for btn in tree.css("button, input[type=button], input[type=submit]"):
            elements.append(InteractiveElement(
                id=f"btn_{idx}", type="button",
                text=(btn.text(strip=True) or btn.attributes.get("value", "button"))[:100],
                disabled="disabled" in btn.attributes,
            ))
            idx += 1

        for inp in tree.css("input:not([type=button]):not([type=submit]):not([type=hidden])"):
            elements.append(InteractiveElement(
                id=f"inp_{idx}", type="input",
                text=inp.attributes.get("aria-label", "") or inp.attributes.get("id", ""),
                placeholder=inp.attributes.get("placeholder"),
                name=inp.attributes.get("name"),
            ))
            idx += 1

        for sel in tree.css("select"):
            elements.append(InteractiveElement(
                id=f"sel_{idx}", type="select",
                text=sel.attributes.get("name", "select"),
                name=sel.attributes.get("name"),
            ))
            idx += 1

        # Extract all links for navigation
        links = []
        for a in tree.css("a[href]"):
            href = a.attributes.get("href", "")
            if href and not href.startswith("#") and not href.startswith("javascript"):
                links.append({
                    "text": a.text(strip=True)[:80],
                    "href": urljoin(url, href),
                })

        return PageObservation(
            url=url,
            title=title,
            status_code=status_code,
            text_content=text_content,
            interactive_elements=elements[:50],
            links=links[:30],
            load_time_ms=round(load_time_ms, 2),
            memory_mb=round(memory_mb, 3),
            content_length=len(html),
        )

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()


# Module-level singleton
_engine = BrowserEngine()


async def get_browser_engine() -> BrowserEngine:
    return _engine
