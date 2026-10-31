import json, subprocess, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
K = "/tmp/claude-0/-home-user-claudeCode/65741199-7e19-59ec-96ec-36329c098bc0/scratchpad/kokoro/"
k = Kokoro(K + "kokoro-v1.0.onnx", K + "voices-v1.0.bin")
N = json.load(open("narration.json"))
# 読み方の調整：ELEFAN は「エレファン」、Pauly は「ポーリー」と読ませる
say = lambda t: t.replace("ELEFAN", "Elephan").replace("Pauly", "Paulie")
print(k.tokenizer.phonemize("Paulie", "en-gb"))
durs = []
for i, paras in enumerate(N, 1):
    chunks = []
    for p in paras:
        s, sr = k.create(say(p), voice="bm_george", speed=1.0, lang="en-gb")
        chunks += [s, np.zeros(int(0.6 * sr), np.float32)]
    y = np.concatenate([np.zeros(int(0.8 * sr), np.float32)] + chunks)
    sf.write(f"audio/s{i:02d}.wav", y, sr)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"audio/s{i:02d}.wav", "-ar", "44100", "-b:a", "96k", f"audio/s{i:02d}.mp3"], check=True)
    durs.append(round(len(y) / sr, 2)); print(i, durs[-1])
json.dump(durs, open("audio/durations.json", "w")); print("total", round(sum(durs) / 60, 2), "min")
