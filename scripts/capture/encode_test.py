"""Checks encode.py on synthetic input: a still and a 3-frame clip.

  python -I scripts/capture/encode_test.py
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent

with tempfile.TemporaryDirectory() as tmp:
    src, dst = Path(tmp, 'out'), Path(tmp, 'public')
    clip = src / 'demo'
    clip.mkdir(parents=True)
    still = Image.new('RGB', (1280, 800), (20, 20, 20))
    ImageDraw.Draw(still).rectangle((100, 100, 600, 400), fill=(255, 176, 0))
    still.save(src / 'map.png')
    frames = []
    for i in range(3):
        frame = Image.new('RGB', (1280, 800), (10, 10, 10))
        ImageDraw.Draw(frame).ellipse((100 + i * 200, 300, 300 + i * 200, 500), fill=(0, 160, 255))
        name = f'{i:04d}.jpg'
        frame.save(clip / name, quality=85)
        frames.append({'file': name, 'ms': i * 125})
    (clip / 'frames.json').write_text(json.dumps(frames))

    subprocess.run([sys.executable, '-I', str(HERE / 'encode.py'), str(src), str(dst)], check=True)

    with Image.open(dst / 'map.webp') as out_still:
        assert out_still.size == (1280, 800), out_still.size
    assert (dst / 'map.webp').stat().st_size <= 150_000
    with Image.open(dst / 'demo.webp') as out_clip:
        assert out_clip.size == (960, 600), out_clip.size
        assert getattr(out_clip, 'n_frames', 1) == 3, out_clip.n_frames
    assert (dst / 'demo.webp').stat().st_size <= 2_000_000
    with Image.open(dst / 'demo-poster.webp') as poster:
        assert poster.size == (960, 600)

print('encode: ok')
