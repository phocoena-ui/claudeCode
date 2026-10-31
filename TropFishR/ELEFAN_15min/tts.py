import json, numpy as np, pyopenjtalk, subprocess, wave
N = json.load(open("narration_yomi.json"))
durs = []
for i, paras in enumerate(N, 1):
    chunks = []; sr = 48000
    lead = np.zeros(int(0.8 * sr))
    chunks.append(lead)
    for p in paras:
        x, sr = pyopenjtalk.tts(p, speed=0.92)
        chunks.append(x); chunks.append(np.zeros(int(0.7 * sr)))
    y = np.concatenate(chunks)
    y = y / max(1, np.abs(y).max()) * 26000
    wav = f"audio/s{i:02d}.wav"
    w = wave.open(wav, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes(y.astype(np.int16).tobytes()); w.close()
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-ac", "1", "-ar", "44100", "-b:a", "96k", f"audio/s{i:02d}.mp3"], check=True)
    durs.append(round(len(y) / sr, 2))
    print(i, durs[-1])
json.dump(durs, open("audio/durations.json", "w"))
print("total", round(sum(durs) / 60, 2), "min")
