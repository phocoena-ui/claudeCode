"""「はじめに」スライド用の素材（assets/）を旧スライド 0概要.pptx から取り出す。

使い方:
  python3 prepare_assets0.py 0概要.pptx <出力先 assets フォルダ>
必要なもの: Pillow
"""
import os
import sys
import zipfile

from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
D = lambda f: os.path.join(dst, f)

with zipfile.ZipFile(src) as z:
    # 表紙・写真
    photos = {
        "ppt/media/image6.jpeg": "tb_cover.jpg",      # 水産資源学［二訂版］
        "ppt/media/image8.jpeg": "engan_cover.jpg",   # 沿岸資源調査法
        "ppt/media/image10.jpeg": "miyabe_cover.jpg", # 釣りがつなぐ希少魚の保全と地域振興
        "ppt/media/image12.jpeg": "kujira_cover.jpg", # 出動！イルカ・クジラ110番
        "ppt/media/image14.jpg": "last.jpg",          # 最後の写真（夜景）
    }
    for m, out in photos.items():
        with z.open(m) as f:
            im = Image.open(f).convert("RGB")
            im.thumbnail((1800, 1800))
            im.save(D(out), quality=90)
    # QRコード（小さい画像なので最近傍法で拡大してぼけを防ぐ）
    qrs = {
        "ppt/media/image7.png": "qr_tb.png",
        "ppt/media/image9.png": "qr_engan.png",
        "ppt/media/image11.png": "qr_miyabe.png",
        "ppt/media/image13.png": "qr_kujira.png",
    }
    for m, out in qrs.items():
        with z.open(m) as f:
            im = Image.open(f).convert("L")
            k = max(1, 600 // im.size[0])
            im.resize((im.size[0] * k, im.size[1] * k), Image.NEAREST).save(D(out))

print("assets ready:", sorted(os.listdir(dst)))
