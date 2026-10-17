"""iOS·안드로이드 스크린샷의 가로 띠(글자·도형이 있는 줄 구간)를 안전영역 위끝 기준 pt/dp로 나란히 출력.
usage: python3 cmp.py ios.png and.png [x0 x1] [--top]  (x는 pt, 기본 전체 폭)
--bottom: 안전영역 아래끝 기준(음수)으로 출력"""
import sys
from collections import Counter
from PIL import Image

args = [a for a in sys.argv[1:] if not a.startswith("--")]
bottom = "--bottom" in sys.argv
ios, andr = args[0], args[1]
x0 = float(args[2]) if len(args) > 2 else 0
x1 = float(args[3]) if len(args) > 3 else 9999
TH = 40


def bands(path, sc, top, bot):
    im = Image.open(path).convert("RGB")
    W, H = im.size
    px = im.load()
    X0, X1 = round(x0 * sc), min(round(x1 * sc), W)
    rows = []
    for Y in range(H):
        cols = [px[X, Y] for X in range(X0, X1, 1)]
        bg = Counter(cols).most_common(1)[0][0]
        ink = sum(1 for c in cols if sum(abs(c[i] - bg[i]) for i in range(3)) > TH) >= 2
        rows.append((ink, bg))
    out = []
    start = None
    for Y, (ink, bg) in enumerate(rows + [(False, None)]):
        if ink and start is None:
            start = Y
        elif not ink and start is not None:
            ref = bot if bottom else top
            out.append(((start / sc) - ref, (Y / sc) - ref))
            start = None
    return out


a = bands(ios, 3.0, 62.0, 840.0)
b = bands(andr, 2.625, 48.76, 890.29)
n = max(len(a), len(b))
print(f"{'iOS':>17} | {'Android':>17} | d_top  d_h")
for i in range(n):
    s = f"{a[i][0]:8.2f}-{a[i][1]:8.2f}" if i < len(a) else " " * 17
    t = f"{b[i][0]:8.2f}-{b[i][1]:8.2f}" if i < len(b) else " " * 17
    d = ""
    if i < len(a) and i < len(b):
        d = f"{b[i][0]-a[i][0]:+6.2f} {(b[i][1]-b[i][0])-(a[i][1]-a[i][0]):+5.2f}"
    print(f"{s} | {t} | {d}")
