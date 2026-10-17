"""Encode capture output into public/projects/<id>/.

  python -I scripts/capture/encode.py <out_dir> <public_dir> [speed]

*.png         -> <name>.webp        (1280 wide, quality lowered until <= 150 KB)
<clip>/       -> <clip>.webp        (animated, 960 wide, timing from frames.json, <= 2 MB)
                 <clip>-poster.webp (first frame)
speed (default 1) plays clips faster, e.g. 1.5 = 1.5x.
"""
import json
import sys
from pathlib import Path

from PIL import Image

STILL_MAX = 150_000
CLIP_MAX = 2_000_000


def fit(image, width):
    if image.width <= width:
        return image
    return image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)


def save_still(image, path, width=1280):
    image = fit(image.convert('RGB'), width)
    for quality in (82, 75, 68, 60, 52):
        image.save(path, 'WEBP', quality=quality, method=6)
        if path.stat().st_size <= STILL_MAX:
            return
    print(f'warning: {path.name} is {path.stat().st_size} bytes')


def save_clip(folder, out, speed=1.0):
    meta = json.loads((folder / 'frames.json').read_text())
    frames = [fit(Image.open(folder / f['file']).convert('RGB'), 960) for f in meta]
    stamps = [f['ms'] for f in meta]
    durations = [max(40, round((b - a) / speed)) for a, b in zip(stamps, stamps[1:])] + [1200]
    save_still(frames[0], out.with_name(out.stem + '-poster.webp'), 960)
    for quality in (60, 50, 42, 35, 28):
        frames[0].save(out, 'WEBP', save_all=True, append_images=frames[1:], duration=durations,
                       loop=0, quality=quality, method=4)
        if out.stat().st_size <= CLIP_MAX:
            break
    print(f'{out.name}: {len(frames)} frames, {out.stat().st_size // 1024} KB, {sum(durations) / 1000:.1f}s')


def main(src, dst, speed=1.0):
    src, dst = Path(src), Path(dst)
    dst.mkdir(parents=True, exist_ok=True)
    for png in sorted(src.glob('*.png')):
        target = dst / f'{png.stem}.webp'
        save_still(Image.open(png), target)
        print(f'{target.name}: {target.stat().st_size // 1024} KB')
    for folder in sorted(p for p in src.iterdir() if p.is_dir()):
        save_clip(folder, dst / f'{folder.name}.webp', speed)


if __name__ == '__main__':
    if len(sys.argv) not in (3, 4):
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv) == 4 else 1.0)
