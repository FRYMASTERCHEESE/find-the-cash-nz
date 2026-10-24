#!/usr/bin/env python3
"""Generate Google Play listing artwork from Find The Cash NZ's existing logo."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "play-assets"
OUT.mkdir(exist_ok=True)
with Image.open(ROOT / "site/assets/icon-512.png") as original:
    assert original.size == (512, 512)
    icon = original.convert("RGBA")
    icon.save(OUT / "icon-512.png", "PNG", optimize=True)

W, H = 1024, 500
banner = Image.new("RGB", (W, H), "#073e2e")
pixels = banner.load()
for y in range(H):
    for x in range(W):
        t = min(1, (x / W) * 0.16 + (y / H) * 0.22)
        pixels[x, y] = (int(4 + t * 20), int(40 + t * 54), int(29 + t * 35))
draw = ImageDraw.Draw(banner)
draw.ellipse((625, -162, 1150, 365), outline="#3e936d", width=4)
draw.ellipse((680, -105, 1080, 295), outline="#b1ad5c", width=2)
draw.ellipse((-138, 330, 195, 660), outline="#237259", width=3)
logo = icon.resize((320, 320), Image.Resampling.LANCZOS)
banner.paste(logo, (674, 99), logo)
bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
font = ImageFont.truetype(bold, 73)
tagline = ImageFont.truetype(bold, 26)
footer = ImageFont.truetype(bold, 15)
GOLD, LIGHT = "#f3d176", "#fff3d5"
draw.text((63, 83), "FIND THE", font=font, fill=GOLD)
draw.text((63, 177), "CASH NZ", font=font, fill=GOLD)
draw.rounded_rectangle((63, 283, 540, 288), radius=2, fill=GOLD)
draw.text((63, 317), "GOOD THINGS ARE OUT THERE", font=tagline, fill=LIGHT)
draw.text((63, 402), "NEW ZEALAND  •  HUNTS  •  KINDNESS", font=footer, fill=LIGHT)
banner.save(OUT / "feature-graphic.png", "PNG", optimize=True)
assert Image.open(OUT / "feature-graphic.png").mode == "RGB"
print("Created 512 x 512 Play icon and 1024 x 500 RGB feature graphic.")
