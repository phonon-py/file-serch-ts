#!/usr/bin/env python3
# GLACIAL INDEX — Plate I.  Monochrome systems / the architecture of search.
import os, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

random.seed(73)
HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "..", "..", ".claude", "skills", "canvas-design", "canvas-fonts")
def F(name, size): return ImageFont.truetype(os.path.join(FONTS, name), size)

# ---- super-sample for crispness ----
SS = 2
W, H = 2400, 3200
cw, ch = W*SS, H*SS

# ---- palette : cool blue-tinted greys, monotone by law ----
PAPER   = (235, 237, 238)
INK     = (26, 29, 33)
GRAPHITE= (56, 61, 68)
ASH     = (116, 123, 131)
FOG     = (170, 177, 185)
FAINT   = (203, 209, 215)
HAIR     = (150, 158, 166)
ACCENT  = (171, 196, 212)   # the one permitted hairline of cold light (used sparingly)

def s(v): return int(v*SS)

img = Image.new("RGB", (cw, ch), PAPER)
d = ImageDraw.Draw(img)

# ============================================================ utilities
def text(draw, xy, t, font, fill, ls=0, anchor=None, align="left"):
    if ls == 0:
        draw.text(xy, t, font=font, fill=fill, anchor=anchor, align=align)
        return draw.textlength(t, font=font)
    x, y = xy
    total = sum(draw.textlength(c, font=font) + ls for c in t) - ls
    if anchor and 'm' in anchor[0:1] or anchor in ('mm','ma','ms'):
        x -= total/2
    for c in t:
        draw.text((x, y), c, font=font, fill=fill)
        x += draw.textlength(c, font=font) + ls
    return total

def tracked_width(draw, t, font, ls):
    return sum(draw.textlength(c, font=font) + ls for c in t) - ls

def hline(draw, x0, x1, y, fill, w=1):
    draw.line([(x0, y), (x1, y)], fill=fill, width=s(w))
def vline(draw, x, y0, y1, fill, w=1):
    draw.line([(x, y0), (x, y1)], fill=fill, width=s(w))

# ============================================================ 1. ground texture
# faint global grid (felt, not seen)
grid = s(60)
for gx in range(s(170), s(2230)+1, grid):
    vline(d, gx, s(170), s(3030), (228,231,233), 1)
for gy in range(s(170), s(3030)+1, grid):
    hline(d, s(170), s(2230), gy, (228,231,233), 1)

# ============================================================ 2. monumental wildcard  ✶  (the glob star, cold sun)
# A single precise geometric asterisk of hairlines — the watermark sun the index orbits.
# Kept deliberate, not muddy: one measured ring, clean spokes, degree graticule.
star_cx, star_cy = s(1200), s(1600)
star_R = s(740)
COLD = (216, 221, 226)
spokes = 6
for k in range(spokes):
    a = math.pi/2 + k*math.pi/spokes
    dx, dy = math.cos(a), math.sin(a)
    d.line([(star_cx-dx*star_R, star_cy-dy*star_R),
            (star_cx+dx*star_R, star_cy+dy*star_R)], fill=COLD, width=s(1))
# single measured ring + a faint inner ring for orbit
d.ellipse([star_cx-star_R, star_cy-star_R, star_cx+star_R, star_cy+star_R], outline=COLD, width=s(1))
d.ellipse([star_cx-s(150), star_cy-s(150), star_cx+s(150), star_cy+s(150)], outline=COLD, width=s(1))
# degree graticule on the outer ring
for deg in range(0, 360, 5):
    a = math.radians(deg)
    r0 = star_R; r1 = star_R - (s(18) if deg%45==0 else s(9))
    d.line([(star_cx+math.cos(a)*r0, star_cy+math.sin(a)*r0),
            (star_cx+math.cos(a)*r1, star_cy+math.sin(a)*r1)], fill=COLD, width=s(1))
# the exact centre of the field — a small crosshair where the match resolves
d.line([(star_cx-s(26), star_cy),(star_cx+s(26), star_cy)], fill=(206,212,218), width=s(1))
d.line([(star_cx, star_cy-s(26)),(star_cx, star_cy+s(26))], fill=(206,212,218), width=s(1))

# ============================================================ 3. outer frame + registration
MX0, MY0, MX1, MY1 = s(170), s(170), s(2230), s(3030)
d.rectangle([MX0, MY0, MX1, MY1], outline=HAIR, width=s(1))
# inner hairline
d.rectangle([MX0+s(14), MY0+s(14), MX1-s(14), MY1-s(14)], outline=(214,219,224), width=s(1))

def reg_cross(cx, cy, r):
    d.line([(cx-r, cy),(cx+r, cy)], fill=GRAPHITE, width=s(1))
    d.line([(cx, cy-r),(cx, cy+r)], fill=GRAPHITE, width=s(1))
    d.ellipse([cx-s(8), cy-s(8), cx+s(8), cy+s(8)], outline=GRAPHITE, width=s(1))
for (cx, cy) in [(MX0, MY0),(MX1, MY0),(MX0, MY1),(MX1, MY1)]:
    reg_cross(cx, cy, s(22))

# edge tick ladder + coordinate numbers (top & left)
fcoord = F("GeistMono-Regular.ttf", s(15))
tickN = 20
for i in range(tickN+1):
    tx = MX0 + (MX1-MX0)*i/tickN
    L = s(14) if i%5==0 else s(7)
    d.line([(tx, MY0),(tx, MY0+L)], fill=ASH, width=s(1))
    d.line([(tx, MY1),(tx, MY1-L)], fill=ASH, width=s(1))
for j in range(tickN+1):
    ty = MY0 + (MY1-MY0)*j/tickN
    L = s(14) if j%5==0 else s(7)
    d.line([(MX0, ty),(MX0+L, ty)], fill=ASH, width=s(1))
    d.line([(MX1, ty),(MX1-L, ty)], fill=ASH, width=s(1))

# ============================================================ 4. header band
fmark   = F("GeistMono-Regular.ttf", s(26))
fmarkS  = F("GeistMono-Regular.ttf", s(17))
hy = s(250)
text(d, (MX0+s(40), hy), "GLACIAL  INDEX", fmark, INK, ls=s(8))
# right plate id
rt = "Nº 01"
text(d, (MX1-s(40)-tracked_width(d,rt,fmark,s(6)), hy), rt, fmark, INK, ls=s(6))
hline(d, MX0+s(40), MX1-s(40), hy+s(46), HAIR, 1)
text(d, (MX0+s(40), hy+s(60)), "AN  ATLAS  OF  MONOCHROME  SYSTEMS", fmarkS, ASH, ls=s(6))
sub2 = "PLATE I — THE ARCHITECTURE OF SEARCH"
text(d, (MX1-s(40)-tracked_width(d,sub2,fmarkS,s(4)), hy+s(60)), sub2, fmarkS, ASH, ls=s(4))

# ============================================================ 5. QUERY field  ( /検索 )
qy0 = s(470)
flabel = F("GeistMono-Regular.ttf", s(18))
text(d, (MX0+s(40), qy0), "QUERY / 検索", flabel, ASH, ls=s(5))
# ruled field
fx0, fx1 = MX0+s(40), MX1-s(40)
fy0, fy1 = qy0+s(40), qy0+s(150)
d.rectangle([fx0, fy0, fx1, fy1], outline=GRAPHITE, width=s(1))
# corner ticks on the field
for (ax,ay,bx,by) in [(fx0,fy0,fx0+s(18),fy0),(fx0,fy0,fx0,fy0+s(18)),
                      (fx1,fy1,fx1-s(18),fy1),(fx1,fy1,fx1,fy1-s(18))]:
    d.line([(ax,ay),(bx,by)], fill=INK, width=s(2))
fquery = F("JetBrainsMono-Bold.ttf", s(58))
qx = fx0+s(44); qcy = (fy0+fy1)//2
text(d, (qx, qcy), "find  /vol  —name  '*'", fquery, INK, anchor="lm")
qw = d.textlength("find  /vol  —name  '*'", font=fquery)
# solid block cursor
cur_x = qx+qw+s(22)
d.rectangle([cur_x, qcy-s(30), cur_x+s(30), qcy+s(30)], fill=INK)

# ============================================================ 6. RESULTS LADDER — haystack → needle
# faint file paths, one exact match resolved.
ly0 = s(740)
fpath = F("IBMPlexMono-Regular.ttf", s(30))
fidx  = F("GeistMono-Regular.ttf", s(20))
paths = [
 "/vol/docs/2019/ledger_q3.pdf",
 "/vol/img/scan_0098.tiff",
 "/vol/docs/notes/draft.md",
 "/vol/cache/.tmp/4f8a2c.bin",
 "/vol/index/manifest.json",
 "/vol/docs/2021/contract.pdf",
 "/vol/media/aurora_07.raw",
 "/vol/index/shard_002.idx",
 "/vol/docs/readme.txt",
 "/vol/img/plate_i.tiff",
 "/vol/index/glacial.idx",          # << needle
 "/vol/docs/2023/summary.pdf",
 "/vol/cache/.tmp/9b1e7d.bin",
 "/vol/media/field_recording.wav",
 "/vol/docs/archive/old.zip",
 "/vol/index/shard_017.idx",
 "/vol/img/scan_0099.tiff",
 "/vol/docs/2024/report_final.pdf",
 "/vol/index/manifest.lock",
 "/vol/media/north_light.raw",
 "/vol/docs/notes/quiet.md",
 "/vol/cache/.tmp/c3d50a.bin",
]
NEEDLE = 10
row_h = s(86)
greys = [FAINT, FOG, FAINT, (212,216,221), FOG, FAINT, FOG, FOG, FAINT, FOG]
# deterministic metadata (size · modified) — the log-like density on the right
sizes = ["1.2M","940K","18K","4.1M","220K","2.4M","31M","8.7M","2K","12M",
         "640K","1.8M","4.1M","54M","9.0M","8.6M","946K","3.3M","48B","61M","11K","4.0M"]
dates = ["2019·08","2022·01","2023·11","2026·06","2024·02","2021·05","2025·09","2024·12",
         "2020·03","2026·05","2026·06","2023·07","2026·06","2018·10","2017·04","2024·12",
         "2022·01","2024·04","2026·06","2025·02","2026·01","2026·06"]
lx = MX0+s(150)
rx = MX1-s(40)
fmeta = F("GeistMono-Regular.ttf", s(22))
meta_x = MX1-s(360)   # right metadata column anchor
for i, p in enumerate(paths):
    ry = ly0 + i*row_h + row_h//2
    # line index in margin
    text(d, (MX0+s(40), ry), f"{i:04d}", fidx, FOG, anchor="lm")
    # thin baseline rule
    hline(d, lx, rx, ry+s(34), (224,228,232), 1)
    meta = f"{sizes[i]:>5}   {dates[i]}"
    if i == NEEDLE:
        # the needle : the one resolved match — single cold-light accent
        d.rectangle([lx-s(28), ry-s(40), rx, ry+s(40)], fill=(223,231,237))
        d.line([(lx-s(28), ry-s(40)),(lx-s(28), ry+s(40))], fill=INK, width=s(4))
        text(d, (lx, ry), p, F("IBMPlexMono-Bold.ttf", s(31)), INK, anchor="lm")
        text(d, (MX0+s(40), ry), f"{i:04d}", fidx, INK, anchor="lm")
        # match marker on right
        mk = "MATCH  1/1263"
        text(d, (rx-tracked_width(d,mk,fidx,s(3)), ry), mk, fidx, INK, ls=s(3), anchor="lm")
    else:
        text(d, (lx, ry), p, fpath, greys[i%len(greys)], anchor="lm")
        # faint metadata column, right-aligned at meta_x..
        mw = d.textlength(meta, font=fmeta)
        text(d, (rx-mw, ry), meta, fmeta, (197,203,210), anchor="lm")
# slim vertical divider between paths and metadata column
vline(d, meta_x, ly0+s(8), ly0+len(paths)*row_h-s(8), (222,226,230), 1)

# ============================================================ 7. footer plate — stats + anchoring phrase
fy = s(2650)
hline(d, MX0+s(40), MX1-s(40), fy, HAIR, 1)
fstat = F("GeistMono-Regular.ttf", s(20))
flab  = F("GeistMono-Regular.ttf", s(15))
cols = [
  ("SCANNED",  "1 263"),
  ("FILTERED", "0 001"),
  ("MATCH",    "00:01.4"),
  ("SCALE",    "1:1"),
]
colw = (MX1-MX0-s(80))/len(cols)
for k,(lab,val) in enumerate(cols):
    cx = MX0+s(40)+colw*k
    text(d, (cx, fy+s(34)), lab, flab, ASH, ls=s(4))
    text(d, (cx, fy+s(64)), val, F("BigShoulders-Bold.ttf", s(64)), INK)
    if k>0:
        vline(d, cx-s(20), fy+s(28), fy+s(132), (214,219,224), 1)

# big anchoring phrase
fphrase = F("BigShoulders-Bold.ttf", s(150))
text(d, (MX0+s(40), s(2840)), "ONE EXACT MATCH", fphrase, INK, ls=s(2))
fsign = F("GeistMono-Regular.ttf", s(17))
sign = "GLACIAL INDEX · MONOCHROME SYSTEMS · 検索"
text(d, (MX1-s(40)-tracked_width(d,sign,fsign,s(3)), s(2985)), sign, fsign, ASH, ls=s(3))

# ============================================================ 8. paper grain
import numpy as np
noise = (np.random.default_rng(7).normal(0, 5.5, (ch, cw, 1))).astype(np.int16)
arr = np.asarray(img).astype(np.int16) + noise
arr = np.clip(arr, 0, 255).astype(np.uint8)
img = Image.fromarray(arr, "RGB")

# ---- downsample ----
out = img.resize((W, H), Image.LANCZOS)
out = out.filter(ImageFilter.UnsharpMask(radius=1.4, percent=70, threshold=2))
png = os.path.join(HERE, "GLACIAL-INDEX-plate-I.png")
out.save(png, "PNG")
out.save(os.path.join(HERE, "GLACIAL-INDEX-plate-I.pdf"), "PDF", resolution=300)
print("saved", png, out.size)
