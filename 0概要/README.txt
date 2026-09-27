水産資源学2026「ガイダンス・はじめに」スライド（v1）の作り直し手順
デザインは第1章 v5（make2.js）と共通（配色・フォント BIZ UDPGothic／Arial・レイアウト関数）

■ 中身
 make0.js            スライド本体の生成スクリプト（pptxgenjs，15枚，16:9）
 post.py             後処理：日本語の禁則（JLREQ）設定，言語 ja-JP（第1章と同じもの）
 prepare_assets0.py  旧スライド 0概要.pptx から表紙・QRコード・写真を assets/ に取り出す
 水産資源学_0_概要_2026_v1.pptx  完成版

■ 手順
 1. python3 prepare_assets0.py 0概要.pptx work/assets
 2. make0.js と post.py を work/build/ に置く
 3. cd work/build
    npm install pptxgenjs react-icons react react-dom sharp
 4. node make0.js            → raw0.pptx
 5. python3 post.py raw0.pptx deck0.pptx   → 完成版

■ 内容の出どころ
 旧スライド 0概要.pptx（自己紹介，到達目標，授業のやりかた，評価，勉強法，教科書・指定図書）
 2026授業計画.docx（2026/10/2版）… 授業計画の表
 教科書『水産資源学［二訂版］』緒言・目次 … 水産資源学とは，日本発の学問，章立て
