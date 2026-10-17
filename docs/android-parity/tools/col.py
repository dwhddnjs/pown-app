"""특정 색(임시 배경색) 영역의 세로 범위를 pt/dp(안전영역 위끝 기준)로. usage: col.py ios.png and.png x_pt [colors...]
colors: r g b y m c (순수색)"""
import sys
from PIL import Image

C = {"r": (255, 0, 0), "g": (0, 255, 0), "b": (0, 0, 255), "y": (255, 255, 0), "m": (255, 0, 255), "c": (0, 255, 255)}
ios, andr, x = sys.argv[1], sys.argv[2], float(sys.argv[3])
names = sys.argv[4:] or list(C)


def runs(path, sc, top, col):
    im = Image.open(path).convert("RGB")
    px = im.load()
    X = round(x * sc)
    out, start = [], None
    for Y in range(im.size[1] + 1):
        hit = Y < im.size[1] and sum(abs(a - b) for a, b in zip(px[X, Y], col)) < 60
        if hit and start is None:
            start = Y
        elif not hit and start is not None:
            out.append((start / sc - top, Y / sc - top))
            start = None
    return out


for n in names:
    a = runs(ios, 3.0, 62.0, C[n])
    b = runs(andr, 2.625, 48.76, C[n])
    for i in range(max(len(a), len(b))):
        s = f"{a[i][0]:8.2f}-{a[i][1]:8.2f} ({a[i][1]-a[i][0]:6.2f})" if i < len(a) else " " * 26
        t = f"{b[i][0]:8.2f}-{b[i][1]:8.2f} ({b[i][1]-b[i][0]:6.2f})" if i < len(b) else " " * 26
        print(n, s, "|", t)
