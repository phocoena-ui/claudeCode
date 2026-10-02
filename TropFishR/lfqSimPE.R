# lfqSimPE: 過程誤差つき個体ベースモデル（IBM）で体長組成データを作る
#   - 全個体が同じ成長パラメータ（Linf, K）を使う
#   - 毎月の体長増分 = von Bertalanffy の 1 か月分の増分 × 誤差 eps
#     eps は平均 1, CV = cv_inc の対数正規分布（個体ごと・月ごとに独立）
#     cv_inc が大きい（> 0.7 程度）と eps > 1/(1-exp(-K/12)) で Linf を超える個体が出る
#   - 加入は年 R 尾を repro_wt（12 か月分の重み）で配分。体長 0 で加入
#   - 死亡は Z = M + F × 選択率(L)（ロジスティック，L50 と wqs）
#   - 漁獲で死んだ個体から毎月 n_samp 尾を無作為抽出して体長組成にする
# 返り値: list(lfq = TropFishR の lfq オブジェクト, pop = 月ごとの個体数,
#              cv_at_age = 最終月の年齢（月）別の平均体長と CV)

lfqSimPE <- function(Linf = 25, K = 1.2, cv_inc = 0.2,
                     repro_wt = c(0, 0.5, 1, 0.5, 0, 0, 0, 0.25, 0.5, 0.25, 0, 0),
                     R = 80000, M = 2.0, F = 3.0, L50 = 14, wqs = 2,
                     years = 10, sample_years = 2, n_samp = 500,
                     bin.size = 0.5, start.date = as.Date("2010-01-01"),
                     seed = NULL) {
  if (!is.null(seed)) set.seed(seed)
  dt <- 1/12
  nstep <- years * 12
  rw <- repro_wt / sum(repro_wt)
  sdlog <- sqrt(log(1 + cv_inc^2))          # CV から対数正規の sdlog へ
  g <- 1 - exp(-K * dt)                     # 1 か月の成長割合
  s <- wqs / (2 * log(3))                   # ロジスティック選択性の尺度

  L <- numeric(0); A <- numeric(0)          # 個体ごとの体長と年齢（月）
  dates <- seq(start.date, by = "month", length.out = nstep)
  first_samp <- nstep - sample_years * 12 + 1
  catch_L <- vector("list", nstep)
  N <- numeric(nstep)

  for (j in 1:nstep) {
    # 1. 成長（過程誤差つき）
    if (length(L) > 0) {
      eps <- rlnorm(length(L), meanlog = -sdlog^2 / 2, sdlog = sdlog)
      L <- L + pmax((Linf - L) * g * eps, 0)  # 縮まない（L > Linf なら成長 0）
      A <- A + 1
    }
    # 2. 加入（体長 0）
    m <- (j - 1) %% 12 + 1
    nrec <- round(R * rw[m])
    if (nrec > 0) { L <- c(L, rep(0, nrec)); A <- c(A, rep(0, nrec)) }
    # 3. 死亡（自然死亡と漁獲死亡）
    Fi <- F / (1 + exp(-(L - L50) / s))
    Zi <- M + Fi
    dead <- runif(length(L)) < 1 - exp(-Zi * dt)
    fished <- dead & (runif(length(L)) < Fi / Zi)
    catch_L[[j]] <- L[fished]
    L <- L[!dead]; A <- A[!dead]
    N[j] <- length(L)
  }

  # 4. 最後の sample_years 年分から毎月 n_samp 尾を抽出して階級に分ける
  idx <- first_samp:nstep
  maxL <- max(unlist(catch_L[idx]))
  breaks <- seq(0, ceiling(maxL / bin.size) * bin.size + bin.size, by = bin.size)
  catch <- sapply(idx, function(j) {
    x <- catch_L[[j]]
    if (length(x) < n_samp) warning(format(dates[j]), ": 漁獲が ", length(x), " 尾しかない")
    x <- if (length(x) > n_samp) sample(x, n_samp) else x
    hist(x, breaks = breaks, plot = FALSE)$counts
  })
  keep <- which(rowSums(catch) > 0)
  keep <- min(keep):max(keep)
  lfq <- list(midLengths = (breaks[-1] - bin.size / 2)[keep],
              dates = dates[idx], catch = catch[keep, ])
  class(lfq) <- "lfq"

  # 最終月の年齢別の体長（実際の CV の確認用）
  cv_at_age <- do.call(rbind, lapply(split(L, A), function(x)
    data.frame(n = length(x), meanL = mean(x), CV = sd(x) / mean(x))))
  cv_at_age <- cbind(age_month = as.numeric(rownames(cv_at_age)), cv_at_age)

  list(lfq = lfq, pop = data.frame(dates = dates, N = N), cv_at_age = cv_at_age)
}
