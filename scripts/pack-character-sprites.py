"""Pack generated 4-character/four-direction originals into 180x240 game frames.

Usage: python3 scripts/pack-character-sprites.py
Sources are lossless WebP originals; source rows are front/right/back/left.
The walking frames articulate the legs and body, keeping the head and costume consistent.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
GROUPS = [
 ['player', 'guide', 'owner', 'ren'],
 ['aozoraOwner', 'hinataOwner', 'wakabaOwner', 'yuunagiOwner'],
 ['akatsukiOwner', 'atelierOwner', 'venueStaff', 'rival'],
 ['mechanic', 'sou', 'momo', 'offroader'],
 ['starter', 'rei', 'gaku', 'towa'],
 ['koya', 'go', 'senior', 'doctor'],
]


def row_bands(image):
    # Locate actual transparent gutters; generated atlases can have uneven margins.
    alpha = image.getchannel('A')
    occupied = []
    for y in range(image.height):
        if sum(v > 160 for v in alpha.crop((0, y, image.width, y + 1)).get_flattened_data()) > 10:
            occupied.append(y)
    gaps = [(b-a, (a+b)//2) for a,b in zip(occupied, occupied[1:]) if b-a > image.height*.008]
    boundaries = [0] + sorted(mid for _,mid in sorted(gaps, reverse=True)[:3]) + [image.height]
    if len(boundaries) != 5:
        raise ValueError('Expected four separated character rows')
    return list(zip(boundaries, boundaries[1:]))


def normalize(cell):
    bounds = cell.getchannel('A').point(lambda a: 255 if a > 100 else 0).getbbox()
    if not bounds:
        raise ValueError('Empty character cell')
    sprite = cell.crop(bounds)
    # Keep the detailed large head, shorten the lower body to the reference's chibi proportions.
    split = round(sprite.height * .40)
    lower = sprite.crop((0, split, sprite.width, sprite.height))
    lower = lower.resize((sprite.width, round(lower.height * .80)), Image.Resampling.NEAREST)
    compact = Image.new('RGBA', (sprite.width, split + lower.height))
    compact.alpha_composite(sprite.crop((0, 0, sprite.width, split)), (0, 0))
    compact.alpha_composite(lower, (0, split))
    scale = min(156 / compact.width, 222 / compact.height)
    compact = compact.resize((round(compact.width*scale), round(compact.height*scale)), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (180, 240))
    canvas.alpha_composite(compact, ((180-compact.width)//2, 234-compact.height))
    canvas.putalpha(canvas.getchannel('A').point(lambda a: 255 if a >= 128 else 0))
    return canvas


def walk(sprite, frame, row):
    if frame in (0, 2):
        return sprite.copy()
    phase = 1 if frame == 1 else -1
    canvas = Image.new('RGBA', sprite.size)
    # Bend each leg independently below the hips; upper body bobs by one source pixel.
    canvas.alpha_composite(sprite.crop((0, 0, 180, 184)), (0, 1))
    for leg in range(2):
        left, right = (0, 90) if leg == 0 else (90, 180)
        shift = phase * (1 if leg else -1)
        thigh = sprite.crop((left, 184, right, 196)).resize((right-left, 12+shift*4), Image.Resampling.NEAREST)
        canvas.alpha_composite(thigh, (left, 184))
        canvas.alpha_composite(sprite.crop((left, 196, right, 240)), (left, 196+shift*4))
    return canvas


def main():
    output = ROOT / 'public/assets/characters'
    output.mkdir(parents=True, exist_ok=True)
    for index, ids in enumerate(GROUPS, 1):
        image = Image.open(ROOT / f'src/assets/characters/source-atlas-{index}.webp').convert('RGBA')
        bands = row_bands(image)
        for col, character in enumerate(ids):
            sheet = Image.new('RGBA', (720, 960))
            for row, (top, bottom) in enumerate(bands):
                cell = image.crop((round(col*image.width/4), top, round((col+1)*image.width/4), bottom))
                sprite = normalize(cell)
                for frame in range(4):
                    sheet.alpha_composite(walk(sprite, frame, row), (frame*180, row*240))
            sheet.save(output / f'{character}.webp', quality=90, method=4, exact=True)
            print(character, flush=True)


if __name__ == '__main__':
    main()
