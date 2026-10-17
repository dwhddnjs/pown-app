"""한 x 열의 색 바뀜을 pt/dp(안전영역 위끝 기준)로. usage: vscan.py img ios|and x y0 y1"""
import sys
from PIL import Image
f, kind, x, y0, y1 = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
sc, top = (3.0, 62.0) if kind == "ios" else (2.625, 48.76)
im = Image.open(f).convert("RGB"); px = im.load(); X = round(x * sc)
prev = None
for Y in range(max(0, round((top + y0) * sc)), min(im.size[1], round((top + y1) * sc))):
    c = px[X, Y]
    if prev is None or sum(abs(a - b) for a, b in zip(c, prev)) > 12:
        print(f"{Y / sc - top:8.2f} {c}")
    prev = c
