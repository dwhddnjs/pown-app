"""여러 쌍을 한 장으로. usage: mont.py out.png i1 a1 i2 a2 ... (shots/ 이름, 안전영역 위끝 맞춤, pt 1:1 → 폭 W)"""
import sys
from PIL import Image
out, names = sys.argv[1], sys.argv[2:]
S = 0.75  # pt당 픽셀
tiles = []
for i in range(0, len(names), 2):
    a = Image.open(f"shots/{names[i]}.png").convert("RGB"); b = Image.open(f"shots/{names[i+1]}.png").convert("RGB")
    a = a.resize((round(a.width / 3 * S), round(a.height / 3 * S)))
    b = b.resize((round(b.width / 2.625 * S), round(b.height / 2.625 * S)))
    off = round((62 - 48.76) * S)
    t = Image.new("RGB", (a.width + b.width + 4, max(a.height, b.height + off)), "red")
    t.paste(a, (0, 0)); t.paste(b, (a.width + 4, off)); tiles.append(t)
W = sum(t.width for t in tiles) + 8 * (len(tiles) - 1); H = max(t.height for t in tiles)
m = Image.new("RGB", (W, H), "blue"); x = 0
for t in tiles: m.paste(t, (x, 0)); x += t.width + 8
m.save(out)
print(m.size)
