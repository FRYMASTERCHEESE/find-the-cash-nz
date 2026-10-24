#!/usr/bin/env python3
"""Validate actual media dimensions and export screenshots as RGB PNG for Play."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent / "play-assets"
icon = Image.open(root / "icon-512.png")
assert icon.size == (512, 512), f"icon: {icon.size}"
banner = Image.open(root / "feature-graphic.png")
assert banner.size == (1024, 500) and banner.mode == "RGB", "bad feature graphic"
screens = sorted((root / "screenshots").glob("*.png"))
assert len(screens) >= 2, f"need at least 2 genuine screenshots, found {len(screens)}"
for item in screens:
    with Image.open(item) as original:
        width, height = original.size
        assert 320 <= min(width,height) and max(width,height) <= 3840
        assert max(width,height) <= 2 * min(width,height)
        original.convert("RGB").save(item, "PNG", optimize=True)
    assert Image.open(item).mode == "RGB", item
print("Verified Play artwork and", len(screens), "real device screenshots")
