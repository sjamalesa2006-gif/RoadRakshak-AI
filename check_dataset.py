
from pathlib import Path
from PIL import Image

folders = [
    Path("DATASET/NORMAL"),
    Path("DATASET/potholes")
]

total = 0
valid = 0
corrupted = 0
formats = {}

for folder in folders:
    print(f"\nChecking: {folder}")
    
    for file in folder.iterdir():
        if not file.is_file():
            continue

        total += 1

        try:
            with Image.open(file) as img:
                img.verify()

            with Image.open(file) as img:
                image_format = img.format
                formats[image_format] = formats.get(image_format, 0) + 1

            valid += 1

        except Exception:
            corrupted += 1
            print("Corrupted:", file.name)

print("\n===== DATASET REPORT =====")
print("Total files:", total)
print("Valid images:", valid)
print("Corrupted images:", corrupted)
print("Image formats:", formats)
