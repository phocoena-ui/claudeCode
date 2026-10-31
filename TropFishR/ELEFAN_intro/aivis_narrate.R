# ============================================================
# はじめての ELEFAN：ナレーションを AivisSpeech の声に差し替える
#
# 使い方
#   1. AivisSpeech を起動しておく（起動すると音声エンジンも動く）
#   2. このスクリプト全体を RStudio の Console に貼り付けて Enter
#   3. ファイル選択の窓で ELEFAN_intro_narrated.pptx を選ぶ
#   → 同じフォルダに ELEFAN_intro_narrated_aivis.pptx ができる
# ============================================================

voice_name <- "阿井田"         # 話者の名前（一部だけでもよい。阿井田 茂）
style_name <- "ノーマル"       # スタイル名（なければ最初のスタイルを使う）
speed      <- 1.0              # 話す速さ（1.0 が標準、0.9 でゆっくり）
pause_sec  <- 0.7              # 段落の間の無音（秒）
host       <- "http://127.0.0.1:10101"   # AivisSpeech の音声エンジン

for (p in c("httr2", "jsonlite", "zip"))
  if (!requireNamespace(p, quietly = TRUE)) install.packages(p)
library(httr2)

# ---- 1. 話者を探す ------------------------------------------------
speakers <- request(host) |> req_url_path("/speakers") |> req_perform() |> resp_body_json()
tab <- do.call(rbind, lapply(speakers, function(s) data.frame(
  speaker = s$name,
  style   = vapply(s$styles, function(x) x$name, ""),
  id      = vapply(s$styles, function(x) as.numeric(x$id), 0))))
hit <- tab[grepl(gsub("\\s", "", voice_name), gsub("\\s", "", tab$speaker)), ]
if (nrow(hit) == 0) {
  print(tab)
  stop("「", voice_name, "」が見つかりません。上の一覧の speaker の名前を voice_name に入れて、やり直してください。")
}
if (style_name %in% hit$style) hit <- hit[hit$style == style_name, ]
sid <- format(hit$id[1], scientific = FALSE)
message("話者：", hit$speaker[1], "（", hit$style[1], "）")

# ---- 2. 音声合成と WAV の処理 ---------------------------------------
synth <- function(text) {
  q <- request(host) |> req_url_path("/audio_query") |>
    req_url_query(text = text, speaker = sid) |> req_method("POST") |>
    req_perform() |> resp_body_string()
  q <- jsonlite::fromJSON(q, simplifyVector = FALSE)
  q$speedScale <- speed
  body <- jsonlite::toJSON(q, auto_unbox = TRUE, null = "null", digits = NA)
  request(host) |> req_url_path("/synthesis") |> req_url_query(speaker = sid) |>
    req_body_raw(body, type = "application/json") |>
    req_perform() |> resp_body_raw()
}

int_le <- function(b, n) {
  if (n == 2) readBin(b, "integer", size = 2, endian = "little", signed = FALSE)
  else readBin(b, "integer", size = 4, endian = "little")
}
wav_parse <- function(b) {
  pos <- 13; fmt <- NULL; data <- NULL
  while (pos + 7 <= length(b)) {
    id   <- rawToChar(b[pos:(pos + 3)])
    size <- int_le(b[(pos + 4):(pos + 7)], 4)
    if (size > 0) {
      body <- b[(pos + 8):min(length(b), pos + 7 + size)]
      if (id == "fmt ") fmt <- body
      if (id == "data") data <- body
    }
    pos <- pos + 8 + size + (size %% 2)
  }
  list(channels = int_le(fmt[3:4], 2), rate = int_le(fmt[5:8], 4),
       bits = int_le(fmt[15:16], 2), data = data)
}
le <- function(x, n) writeBin(as.integer(x), raw(), size = n, endian = "little")
wav_write <- function(pcm, rate, channels, bits) {
  ba <- channels * bits / 8
  c(charToRaw("RIFF"), le(36 + length(pcm), 4), charToRaw("WAVE"),
    charToRaw("fmt "), le(16, 4), le(1, 2), le(channels, 2), le(rate, 4),
    le(rate * ba, 4), le(ba, 2), le(bits, 2),
    charToRaw("data"), le(length(pcm), 4), pcm)
}

# ---- 3. 読み上げる原稿（スライドごと） -----------------------------
narration <- list(
  c("こんにちは。今日のテーマは、エレファンです。",
    "エレファンは、さかなの年齢が分からなくても、体長だけから、成長の速さを推定する方法です。",
    "しくみ、使い方、そして落とし穴までを、順に話します。"),
  c("資源評価では、魚がどれくらいの速さで育つか、つまり成長の情報が欠かせません。",
    "ふつうは、耳石の年輪で年齢を読みます。しかし、熱帯の魚や、エビや貝のような無脊椎動物では、年輪がはっきりしないことが多いのです。",
    "一方、体長なら、市場やみずあげばで、安く、たくさん、毎月測れます。",
    "そこで、ポーリーとデイビッドが、千九百八十一年に作ったのが、エレファンです。名前は、エレクトロニック・レングス・フリークエンシー・アナリシス、電子的な体長組成解析の、頭文字です。",
    "東南アジアやアフリカの資源評価で、今でも広く使われています。"),
  c("エレファンの発想は、とても単純です。",
    "同じ年に生まれた群れを、ねんきゅうぐんといいます。ねんきゅうぐんは体長がだいたいそろっているので、体長組成の中で、一つの山になります。",
    "この図は、二か月ごとの標本を、六回、横に並べたものです。縦が体長で、棒の長さが個体数です。左から右へ、山が少しずつ上、つまり大きい体長のほうへ動いています。これが成長です。",
    "山をつなぐと、オレンジの点線になります。この線が、成長曲線です。",
    "エレファンは、どの成長曲線が、いちばんうまく山をつなぐかを、コンピュータで探す方法です。"),
  c("つなぐ線の形は、フォン・ベルタランフィの成長式で決めます。",
    "推定するのは三つです。エル無限大は、極限体長、これ以上は大きくならない体長です。ケーは、成長の速さです。",
    "ティー・アンカーは、教科書のティー・ゼロの代わりで、体長がゼロになる時期、つまり加入の時期を、ねんのしょうすうで表します。ゼロテンニーゴなら、四月一日です。",
    "季節によって成長が変わる魚では、シーとティー・エスという、二つのパラメータを加えることもできます。"),
  c("ここから、手順を三つ説明します。手順一は、再構成です。",
    "上の図は、ある月の体長組成です。くろい線は移動平均、ここでは前後五階級の平均です。",
    "下の図では、各階級のびすうを移動平均で割って、一を引いています。移動平均より多いところは、プラスの山で、オレンジ色です。少ないところは、マイナスの谷で、青です。",
    "左端の、小さなオレンジに注目してください。びすうが少ないところでは、偶然のでこぼこも、山になってしまいます。これが、後で話す落とし穴の元です。"),
  c("手順二は、点数づけです。",
    "成長曲線を一つ決めて、毎年のねんきゅうぐんに当てはめると、このように、何本もの線になります。",
    "線がとおったところの値を足します。山ならプラス、谷ならマイナスです。この合計が、イー・エス・ピーです。取りうる山の合計、つまり満点が、エー・エス・ピーです。",
    "イー・エス・ピーを、エー・エス・ピーで割って変換したものが、点数アール・エヌです。アール・エヌが大きいほど、曲線が山をよくとおっている、という意味です。"),
  c("手順三は、点数がいちばん高くなる、エル無限大、ケー、ティー・アンカーの組み合わせを、探すことです。",
    "この図は、パラメータを一つ動かしたときの点数です。大きな山はありますが、線はギザギザで、小さな山がたくさんあります。坂を登るだけの方法だと、白丸のような、小さな山で止まってしまいます。",
    "そこで、アールのパッケージ、トロップフィッシュアールには、格子状に全部調べる方法のほか、焼きなまし法と、遺伝的アルゴリズムを使う方法が、用意されています。"),
  c("実際にやってみると、アールで数行です。",
    "シン・エル・エフ・キュー・セブンは、しんの成長パラメータが分かっている合成データです。答え合わせができるので、練習に向いています。",
    "遺伝的アルゴリズム版のエレファンに渡すのは、移動平均の幅と、探す範囲の、下限と上限です。数分で計算が終わります。",
    "最後の二行で、推定値と点数を表示します。図を描く設定にすると、山と谷に、成長曲線を重ねた図も出ます。"),
  c("このコードを、実際に動かした結果です。",
    "しんのエル無限大は百二十三、ケーはゼロテンニーです。推定は、ヒャクジューハッテンロクと、ゼロテンイチナナ。ケーが、十五パーセント小さく出ました。",
    "エル無限大とケーは、シーソーのような関係にあります。そこで、成長の良し悪しは、成長パフォーマンス指数、ファイ・プライムで比べるのが定石です。ファイ・プライムは、ケーの常用対数に、エル無限大の常用対数の二倍を足したものです。",
    "ファイ・プライムは、しんのあたいでサンテンヨンハチ、推定値でサンテンサンハチでした。ファイ・プライムも下がったので、シーソーの上を動いただけではなく、成長そのものを、低く見積もったことになります。",
    "そして大事なのは、点数です。しんのあたいで曲線を引くと、アール・エヌはゼロテンニーイチ、推定値では、ゼロテンニーキュー。コンピュータの探し方が足りなかったのではありません。エレファンの点数そのものが、しんのあたいではない組み合わせを、選んでいるのです。"),
  c("ここからは、使うときの落とし穴を、四つ紹介します。",
    "ひとつめ。設定で答えが変わります。移動平均の幅や、体長階級の幅を変えると、推定値が動きます。",
    "ふたつめは、エル無限大とケーのシーソーです。エル無限大が大きくケーが小さい組み合わせと、その逆が、同じくらいよく当てはまってしまいます。",
    "みっっつめ。同じ年齢でも、体長には個体差があります。ばらつきが大きいと、ねんきゅうぐんの山が崩れて、ケーの推定がずれやすくなります。",
    "よっっつめ。エレファンは、成長の情報をまったく含まない、ただのノイズのデータにも、偶然の山を拾って、それらしいケーを返します。答えが出たことは、データに成長の情報があった証拠には、なりません。"),
  c("ここが、今日いちばん伝えたいことです。",
    "エレファンは、どんなデータにも、必ず何かしらの答えを返します。点数が高いからといって、それが正しい成長とは限りません。",
    "エレファンの答えは、仮説として扱い、確かめてから使ってください。"),
  c("では、どう確かめればよいか。表の上から順に説明します。",
    "ひとつめ。エル無限大は、最大体長などから、別に決めます。そうするとシーソーが止まり、ケーだけを、エレファンで推定できます。",
    "ふたつめ。標本は、毎月、数百尾を、一年以上、測ります。山の動きを追うには、回数もびすうも必要です。",
    "みっっつめ。移動平均や階級の幅を変えて、結果を比べます。設定で答えが動くなら、その答えは弱いと考えます。",
    "よっっつめ。ブートストラップで、推定の幅を出します。アールのフィッシュブートが使えます。",
    "いつつめ。耳石や標識放流など、別の方法の結果と照合します。",
    "最後に、ケーの誤差は、死亡係数に響きます。体長換算漁獲曲線の傾きは、ゼットわるケーなので、ケーをさんぶんのいちに見誤ると、ゼットもさんぶんのいちになります。資源を、楽観的に評価してしまうのです。"),
  c("最後に、まとめます。",
    "ひとつめ。エレファンは、体長組成の山の動きから、成長曲線を探す方法です。",
    "ふたつめ。体長組成を山と谷に分け、山をいちばんよくとおる曲線、つまり点数アール・エヌが最大の曲線を、選びます。",
    "みっっつめ。ただし、その答えは仮説です。設定、個体差、ノイズに注意して、確かめてから使ってください。",
    "詳しく知りたい人は、スライドの参考文献を読んでください。以上です。質問があれば、どうぞ。")
)

# ---- 4. PowerPoint の音声を差し替える -------------------------------
pptx_in  <- file.choose()                     # ELEFAN_intro_narrated.pptx を選ぶ
pptx_out <- sub("\\.pptx$", "_aivis.pptx", pptx_in)
tmp <- file.path(tempdir(), "pptx_aivis")
unlink(tmp, recursive = TRUE); dir.create(tmp)
utils::unzip(pptx_in, exdir = tmp)

total <- 0
for (i in seq_along(narration)) {
  message("スライド ", i, " / ", length(narration), " を合成中…")
  parts <- lapply(narration[[i]], function(t) wav_parse(synth(t)))
  w  <- parts[[1]]
  ba <- w$channels * w$bits / 8
  sil <- function(sec) raw(round(sec * w$rate) * ba)
  pcm <- c(sil(0.8), unlist(lapply(parts, function(p) c(p$data, sil(pause_sec)))))
  dur_ms <- round(length(pcm) / (w$rate * ba) * 1000)
  total <- total + dur_ms

  rels_f <- file.path(tmp, "ppt", "slides", "_rels", paste0("slide", i, ".xml.rels"))
  rels <- paste(readLines(rels_f, warn = FALSE, encoding = "UTF-8"), collapse = "\n")
  old <- regmatches(rels, regexpr("media/[^\"]+\\.(mp3|wav)", rels))
  new <- sub("\\.(mp3|wav)$", ".wav", old)
  writeBin(wav_write(pcm, w$rate, w$channels, w$bits), file.path(tmp, "ppt", new))
  if (old != new) file.remove(file.path(tmp, "ppt", old))
  writeLines(gsub(old, new, rels, fixed = TRUE), rels_f, useBytes = TRUE)

  sl_f <- file.path(tmp, "ppt", "slides", paste0("slide", i, ".xml"))
  sl <- paste(readLines(sl_f, warn = FALSE, encoding = "UTF-8"), collapse = "\n")
  sl <- sub('advTm="[0-9]+"', paste0('advTm="', dur_ms + 1500, '"'), sl)
  sl <- sub('<p:cTn id="6" dur="[0-9]+"', paste0('<p:cTn id="6" dur="', dur_ms, '"'), sl)
  writeLines(sl, sl_f, useBytes = TRUE)
}

ct_f <- file.path(tmp, "[Content_Types].xml")
ct <- paste(readLines(ct_f, warn = FALSE, encoding = "UTF-8"), collapse = "\n")
if (!grepl('Extension="wav"', ct))
  ct <- sub("<Default ", '<Default Extension="wav" ContentType="audio/wav"/><Default ', ct, fixed = TRUE)
writeLines(ct, ct_f, useBytes = TRUE)

files <- list.files(tmp, recursive = TRUE, all.files = TRUE, no.. = TRUE)
files <- c("[Content_Types].xml", setdiff(files, "[Content_Types].xml"))
if (file.exists(pptx_out)) file.remove(pptx_out)
zip::zip(pptx_out, files = files, root = tmp, include_directories = FALSE)
message("できました：", pptx_out)
message("ナレーションの合計：", round(total / 60000, 1), " 分")
