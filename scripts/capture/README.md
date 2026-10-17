# Project screenshots and demo clips

Each project's page uses real screenshots and a short animated WebP demo,
captured from the app **running locally on fake or demo data**. Nothing here
talks to a live database.

```
node scripts/capture/<id>.mjs                       # writes scripts/capture/out/<id>/
python -I scripts/capture/encode.py scripts/capture/out/<id> public/projects/<id>
python -I scripts/capture/encode_test.py            # checks the encoder
```

- `lib.mjs`: `openBrowser`, `still` (PNG), `clip` (timed JPEG frames +
  `frames.json`), `glide` / `tap` (visible mouse moves for clips).
- `encode.py`: PNG → WebP still (≤ 150 KB); clip folder → animated WebP
  (960 px wide, ≤ 2 MB) plus `<clip>-poster.webp`.
- `out/` is git-ignored scratch.

Each `<id>.mjs` starts with how to start the app it captures, and what to
stop and delete afterwards. Temporary accounts are always deleted and every
server or emulator started for a capture is stopped.
