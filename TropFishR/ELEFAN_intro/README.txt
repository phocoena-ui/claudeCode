はじめての ELEFAN（ナレーション付き動画教材）

■ 置き場所
 Google Drive「2026/VideoCourse/ELEFAN」
   （松石の PC では M:\.shortcut-targets-by-id\1fhH6OdPZ7RYEjtF7xnFHS6jdCnlEkFoI\2026\VideoCourse\ELEFAN）
 GitHub phocoena-ui/claudeCode のブランチ claude/vibrant-knuth-rb4nw9 の TropFishR/ELEFAN_intro/ にも同じもの一式

■ 中身
 ELEFAN_intro_narrated.pptx   土台の PowerPoint（13 枚、PowerPoint で編集できる文字・表・図形。グラフと数式は画像。
                              合成音声 Open JTalk、ノートに読み原稿）
 aivis_narrate.R              土台の音声を AivisSpeech（阿井田 茂）の声に差し替える R スクリプト
                              → ELEFAN_intro_narrated_aivis.pptx ができる
 narration.json               読み原稿（スライドごと）
 narration_yomi.json          読み原稿の読み上げ用（英語の用語や読み違えやすい語をかなにしたもの）
 build_edit.js / render_head.html / tts.py / post.py   土台の PowerPoint を作るスクリプト（クラウド側で使用）
   build_edit.js：スライドの HTML を Chromium で描いて位置と書式を読み取り、PowerPoint の部品として置き直す
   post.py：音声の自動再生と自動で次へ進む設定を加える（日本語の禁則は 0概要/post.py）

■ 英語版（EN/）
 ELEFAN_intro_narrated_EN.pptx  Getting Started with ELEFAN（13 枚、編集できる版、カナダ英語の文面）
                                音声は Kokoro（bm_george、イギリス英語の男声）でクラウド側で合成済み
 narration_en.json              英語の読み原稿（スライドのノートにも入っている）
 tts_kokoro.py                  英語の音声を作るスクリプト（kokoro-onnx、モデルは GitHub の kokoro-onnx リリースから）
 slides/                        英語版スライドの HTML（build_edit.js の入力）

■ 阿井田 茂の声の版を作る手順（Windows の PC で）
 1. AivisSpeech を起動する（ブラウザで http://127.0.0.1:10101/docs が開けば準備完了）
 2. RStudio で aivis_narrate.R を開き、Source を押す
 3. ファイル選択の窓（RStudio の後ろに隠れることがある）で ELEFAN_intro_narrated.pptx を選ぶ
 4. 同じフォルダに ELEFAN_intro_narrated_aivis.pptx ができる
 話す速さは aivis_narrate.R の speed（1.0 が標準、0.9 でゆっくり）で変える

■ 関連
 オンラインのスライド（元）  https://claude.ai/artifact/BPsA2FETf8uUuLSXXtJPd7
 読み原稿（Claude Docs）    https://claude.ai/artifact/G36c61C9paNp5xhiz19Xt2
