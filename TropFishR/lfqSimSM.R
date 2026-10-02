# lfqSimSM: Shelton & Mangel (2012) 型の個体ベースモデル（IBM）で体長組成データを作る
#   成長は同化と異化のつり合い  dL/dt = q_i * g(t) - k_i * L
#   - k_i : 異化係数（= VB の K）。個体ごとに対数正規（平均 K, CV = cv_k），一生固定
#   - q_i : 同化係数。q_i = Linf * K * (k_i / K)^q_exp
#           q_exp = 0 : 同化は全個体共通 → k が大きい個体ほど L∞ が小さい（L∞_i = Linf * K / k_i）
#           q_exp = 1 : L∞ は全個体共通で K だけが違う
#   - g(t): 環境（餌など）。全個体に共通。暦年ごと（env_step = "year"）または毎月
#           対数正規（平均 1, CV = cv_env）
#   1 か月の更新（解析解）: L <- L*exp(-k_i/12) + (q_i*g/k_i)*(1 - exp(-k_i/12))
#   体長は縮まない（悪い環境で L∞_i,t < L のときは成長 0）
#   加入・死亡・漁獲・抽出は lfqSimPE と同じ
#   既定値（q_exp = 0, cv_k = 0.6）で 9 か月齢の体長の CV ≈ 0.2（lfqSimPE の cv_inc = 1.0 と同じ）
#   q_exp = 0.5 は k_i * L∞_i^2 が一定（φ' 一定）に相当
# 返り値: list(lfq, pop, env, cv_at_age)

lfqSimSM <- function(Linf = 25, K = 1.2, cv_k = 0.6, q_exp = 0,
                     cv_env = 0.2, env_step = c("year", "month"),
                     repro_wt = c(0, 0.5, 1, 0.5, 0, 0, 0, 0.25, 0.5, 0.25, 0, 0),
                     R = 100000, M = 2.0, F = 3.0, L50 = 14, wqs = 2,
                     years = 10, sample_years = 2, n_samp = 500,
                     bin.size = 0.5, start.date = as.Date("2010-01-01"),
                     seed = NULL) {
  env_step <- match.arg(env_step)
  if (!is.null(seed)) set.seed(seed)
  dt <- 1/12
  nstep <- years * 12
  rw <- repro_wt / sum(repro_wt)
  lnorm1 <- function(n, cv) rlnorm(n, -log(1 + cv^2) / 2, sqrt(log(1 + cv^2)))  # 平均 1
  s <- wqs / (2 * log(3))

  # 環境 g(t)：全個体に共通
  env <- if (env_step == "year") rep(lnorm1(years, cv_env), each = 12) else lnorm1(nstep, cv_env)

  L <- numeric(0); A <- numeric(0); k <- numeric(0); q <- numeric(0)
  dates <- seq(start.date, by = "month", length.out = nstep)
  first_samp <- nstep - sample_years * 12 + 1
  catch_L <- vector("list", nstep)
  N <- numeric(nstep)

  for (j in 1:nstep) {
    # 1. 成長（個体差 k_i, q_i と共通の環境 env[j]）
    if (length(L) > 0) {
      e <- exp(-k * dt)
      L <- pmax(L, L * e + (q * env[j] / k) * (1 - e))
      A <- A + 1
    }
    # 2. 加入（体長 0，k_i と q_i を誕生時に決める）
    m <- (j - 1) %% 12 + 1
    nrec <- round(R * rw[m])
    if (nrec > 0) {
      kn <- K * lnorm1(nrec, cv_k)
      L <- c(L, rep(0, nrec)); A <- c(A, rep(0, nrec))
      k <- c(k, kn); q <- c(q, Linf * K * (kn / K)^q_exp)
    }
    # 3. 死亡
    Fi <- F / (1 + exp(-(L - L50) / s))
    Zi <- M + Fi
    dead <- runif(length(L)) < 1 - exp(-Zi * dt)
    fished <- dead & (runif(length(L)) < Fi / Zi)
    catch_L[[j]] <- L[fished]
    L <- L[!dead]; A <- A[!dead]; k <- k[!dead]; q <- q[!dead]
    N[j] <- length(L)
  }

  # 4. 最後の sample_years 年分から毎月 n_samp 尾を抽出
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

  cv_at_age <- do.call(rbind, lapply(split(L, A), function(x)
    data.frame(n = length(x), meanL = mean(x), CV = sd(x) / mean(x))))
  cv_at_age <- cbind(age_month = as.numeric(rownames(cv_at_age)), cv_at_age)

  list(lfq = lfq, pop = data.frame(dates = dates, N = N),
       env = data.frame(dates = dates, env = env), cv_at_age = cv_at_age)
}
