from pathlib import Path
from PIL import Image

root = Path("public")

def compress_png(src: Path, dest: Path, max_width: int, quality: int = 80):
    img = Image.open(src).convert("RGBA")
    if img.width > max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, int(img.height * ratio)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", img.size, (11, 11, 16))
    canvas.paste(img, mask=img.split()[-1])
    dest.write_bytes(b"")
    canvas.save(dest, "WEBP", quality=quality, method=6)
    print(f"{src.name} {src.stat().st_size} -> {dest.name} {dest.stat().st_size}")

compress_png(root / "Rocket.png", root / "rocket.webp", 900, 78)
compress_png(root / "clouds.png", root / "clouds.webp", 2200, 72)
