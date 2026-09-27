"""表紙の「水産資源学」をマキナス 4 Square で透過 PNG にする（フォントを持たない PC でも同じ見た目にするため）。

使い方:
  python3 make_title_png.py <Makinas-4-Square.otf> <出力先 assets フォルダ>
必要なもの: Pillow
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

font_path, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
text = "水産資源学"
font = ImageFont.truetype(font_path, 600)  # 高解像度で描いて縮小表示する
l, t, r, b = font.getbbox(text)
pad = 20
im = Image.new("RGBA", (r - l + 2 * pad, b - t + 2 * pad), (255, 255, 255, 0))
ImageDraw.Draw(im).text((pad - l, pad - t), text, font=font, fill=(255, 255, 255, 255))
im.save(os.path.join(dst, "title_makinas.png"))
print("title_makinas.png", im.size)
