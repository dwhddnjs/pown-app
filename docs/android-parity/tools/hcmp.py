"""한 줄(안전영역 기준 y 범위)의 가로 잉크 구간을 왼쪽 기준(iOS/안드)과 오른쪽 기준(화면 폭에서 뺀 값)으로 비교.
usage: hcmp.py ios.png and.png y0 y1"""
import sys
from collections import Counter
from PIL import Image
def segs(f, sc, top, W, y0, y1):
    im = Image.open(f).convert("RGB"); px = im.load()
    Y0, Y1 = round((top + y0) * sc), round((top + y1) * sc)
    cols = []
    for X in range(im.size[0]):
        col = [px[X, Y] for Y in range(Y0, Y1)]
        cols.append(col)
    bgc = Counter(px[X, Y] for X in range(0, im.size[0], 3) for Y in range(Y0, Y1, 2)).most_common(1)[0][0]
    ink = [sum(1 for c in col if sum(abs(a - b) for a, b in zip(c, bgc)) > 60) >= 1 for col in cols]
    out, s = [], None
    for X, v in enumerate(ink + [False]):
        if v and s is None: s = X
        elif not v and s is not None:
            out.append((s / sc, X / sc)); s = None
    # 2pt 미만 틈은 합친다
    m = []
    for a, b in out:
        if m and a - m[-1][1] < 2.5: m[-1] = (m[-1][0], b)
        else: m.append((a, b))
    return m
y0, y1 = float(sys.argv[3]), float(sys.argv[4])
a = segs(sys.argv[1], 3, 62, 402, y0, y1); b = segs(sys.argv[2], 2.625, 48.76, 411, y0, y1)
for i in range(max(len(a), len(b))):
    s = f"{a[i][0]:7.2f}-{a[i][1]:7.2f} (R{402-a[i][1]:6.2f})" if i < len(a) else " " * 26
    t = f"{b[i][0]:7.2f}-{b[i][1]:7.2f} (R{411-b[i][1]:6.2f})" if i < len(b) else " " * 26
    d = f"L{b[i][0]-a[i][0]:+5.2f} R{(411-b[i][1])-(402-a[i][1]):+5.2f}" if i < len(a) and i < len(b) else ""
    print(s, "|", t, "|", d)
