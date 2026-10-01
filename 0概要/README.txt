水産資源学2026「ガイダンス・はじめに」スライド（v4）の作り直し手順
デザインは第1章 v5（make2.js）と共通（配色・フォント BIZ UDPGothic／Arial・レイアウト関数）

■ 中身
 make0.js            スライド本体の生成スクリプト（pptxgenjs，16枚，16:9）
 post.py             後処理：日本語の禁則（JLREQ）設定，言語 ja-JP（第1章と同じもの）
 make_title_png.py   表紙の「水産資源学」をマキナスで透過PNG（title_makinas.png）にする
 prepare_assets0.py  旧スライド 0概要.pptx から表紙・QRコード・写真を assets/ に取り出す
 水産資源学_0_概要_2026_v4.pptx  完成版
 2026授業計画.docx   第6章の名前を教科書に合わせた版（漁業管理 → 水産資源管理）

■ Drive の置き場所
 このフォルダ「2026/0概要/0概要スライド作業用（Claude）」… make0.js，post.py，make_title_png.py，prepare_assets0.py，この README
 「2026/0概要」直下 … 元の 0概要.pptx（素材），完成版 pptx
 「2026」直下 … 2026授業計画.docx
 「フォント/makinas4」… Makinas-4-Square.otf
 GitHub phocoena-ui/claudeCode のブランチ claude/nifty-carson-gacb4u の 0概要/ にも同じもの一式（title_makinas.png を含む）

■ 手順
 1. python3 prepare_assets0.py 0概要.pptx work/assets
    python3 make_title_png.py Makinas-4-Square.otf work/assets
 2. make0.js と post.py を work/build/ に置く
 3. cd work/build
    npm install pptxgenjs react-icons react react-dom sharp
 4. node make0.js            → raw0.pptx
 5. python3 post.py raw0.pptx deck0.pptx   → 完成版

■ 内容の出どころ
 旧スライド 0概要.pptx（自己紹介，到達目標，授業のやりかた，評価，勉強法，教科書・指定図書）
 2026授業計画.docx（2026/10/2版）… 授業計画の表
 教科書『水産資源学［二訂版］』緒言・目次 … 水産資源学とは，日本発の学問，章立て

■ フォント
 表紙の「水産資源学」は マキナス 4 Square（Drive「フォント/makinas4」）。
 再配布不可のライセンスなので，フォント本体はここに置かない。
 v3 から画像（title_makinas.png）にして貼っているので，フォントがない PC でも同じ見た目になる。

■ v2 の変更点
 表紙（「水産資源学」マキナス）を先頭に追加
 「日本発の学問」から教科書刊行の年（1941）と Beverton & Holt（1957）を削除（第1章 Q3 の答えになるため）
 授業計画：Reading Week を「各自」，本試験を「対面」に（授業計画 改定版に合わせた）
 最後の写真に「函館山からの夜景」
 
■ v3 の変更点
 表紙の「水産資源学」（マキナス）を画像に変換

■ v4 の変更点（2026-10-01，授業計画の日程変更に合わせた）
 11/10 鯨類資源について（松田純佳），11/13 Reading Week，11/17 第6章，11/20 プレ試験，11/24 Reading Week，12/1 本試験
 「授業の構成」の試験カードと「授業のやりかた」の試験日（プレ 11/20 金2限，本 12/1 火1限）も更新
