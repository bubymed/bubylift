#!/usr/bin/env python3
"""Generate the Bubylift icons (dumbbell on dark). Run: python3 tools/make_icons.py
Genera los íconos de Bubylift (mancuerna sobre fondo oscuro)."""
from PIL import Image, ImageDraw
import os, sys

ACCENT = (255, 107, 44, 255)
BG_TOP, BG_BOT = (28, 28, 36), (11, 11, 15)
S = 1024

def background():
    img = Image.new("RGBA", (S, S))
    px = img.load()
    for y in range(S):
        t = y / (S - 1)
        c = tuple(int(BG_TOP[i] * (1 - t) + BG_BOT[i] * t) for i in range(3)) + (255,)
        for x in range(S):
            px[x, y] = c
    return img

def glyph(scale):
    """Dumbbell drawn on a transparent 1024 canvas, scaled around the centre."""
    g = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(g)
    def rr(x0, y0, x1, y1, r):
        d.rounded_rectangle((x0, y0, x1, y1), radius=r, fill=ACCENT)
    rr(150, 482, 874, 542, 30)          # bar
    rr(270, 340, 346, 684, 34)          # inner plates
    rr(678, 340, 754, 684, 34)
    rr(188, 392, 252, 632, 30)          # outer plates
    rr(772, 392, 836, 632, 30)
    if scale != 1:
        n = int(S * scale)
        small = g.resize((n, n), Image.LANCZOS)
        g = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        g.paste(small, ((S - n) // 2, (S - n) // 2), small)
    return g

def full_bleed(scale):
    img = background()
    img.alpha_composite(glyph(scale))
    return img

def rounded(img, radius_frac=0.22):
    m = Image.new("L", img.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, img.size[0] - 1, img.size[1] - 1), radius=int(img.size[0] * radius_frac), fill=255)
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.paste(img, (0, 0), m)
    return out

def save(img, name, size):
    img.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, name), optimize=True)

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "icons")
os.makedirs(OUT, exist_ok=True)
a = full_bleed(0.86)
save(rounded(a), "icon-512.png", 512)
save(rounded(a), "icon-192.png", 192)
save(rounded(full_bleed(0.9)), "favicon-32.png", 32)
save(full_bleed(0.82), "apple-touch-icon.png", 180)
save(full_bleed(0.62), "maskable-512.png", 512)   # glyph inside the safe zone
print("icons written to", os.path.normpath(OUT))
