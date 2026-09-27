"""pptxgenjs の出力に日本語の禁則処理設定を加える。
- すべてのテキストの言語を ja-JP にする（PowerPoint が日本語の行分割規則を使う）
- presentation.xml に JLREQ に基づく行頭禁則・行末禁則文字（p:kinsoku）を設定
- グラフの空データ点（null）を削除して欠測扱いにする
"""
import re
import sys
import zipfile

src, dst = sys.argv[1], sys.argv[2]

# 行頭禁則（JLREQ cl-02 終わり括弧, cl-03 ハイフン類, cl-04 区切り約物, cl-05 中点類,
#          cl-06 句点類, cl-07 読点類, cl-09 繰返し記号, cl-10 長音記号, cl-11 小書きの仮名, 後置省略記号）
INVAL_ST = (
    "’”）〕］｝〉》」』】〙〗〟｠»)]}"
    "‐〜゠–"
    "？！‼⁇⁈⁉?!"
    "・：；:;"
    "。．."
    "、，,"
    "ヽヾゝゞ々〻"
    "ー"
    "ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ"
    "％‰°′″℃"
)
# 行末禁則（JLREQ cl-01 始め括弧, 前置省略記号）
INVAL_END = "‘“（〔［｛〈《「『【〘〖〝｟«([{￥＄£€＃№"


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


KINSOKU = f'<p:kinsoku lang="ja-JP" invalStChars="{esc(INVAL_ST)}" invalEndChars="{esc(INVAL_END)}"/>'

zin = zipfile.ZipFile(src)
zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
for item in zin.infolist():
    data = zin.read(item.filename)
    name = item.filename
    if name.endswith(".xml") and (name.startswith("ppt/slides/") or name.startswith("ppt/charts/")
                                  or name.startswith("ppt/notesSlides/") or name.startswith("ppt/slideLayouts/")
                                  or name.startswith("ppt/slideMasters/") or name == "ppt/presentation.xml"):
        t = data.decode("utf-8")
        t = t.replace('lang="en-US"', 'lang="ja-JP"')
        if name.startswith("ppt/charts/"):
            t = re.sub(r'<c:pt idx="\d+"><c:v></c:v></c:pt>', "", t)
        if name == "ppt/presentation.xml" and "<p:kinsoku" not in t:
            if "<p:defaultTextStyle" in t:
                t = t.replace("<p:defaultTextStyle", KINSOKU + "<p:defaultTextStyle", 1)
            elif "<p:extLst" in t:
                t = t.replace("<p:extLst", KINSOKU + "<p:extLst", 1)
            else:
                t = t.replace("</p:presentation>", KINSOKU + "</p:presentation>", 1)
        data = t.encode("utf-8")
    zout.writestr(item, data)
zout.close()
print("post-processed ->", dst)
