from pathlib import Path
from PIL import Image

FOLDERS = [
    Path("TRAINING_DATASET_4CLASS"),
    Path("VALIDATION_DATASET_4CLASS")
]

SIZE = (224, 224)
EXTENSIONS = {".jpg", ".jpeg", ".png"}

for root in FOLDERS:
    processed = 0

    for file in root.rglob("*"):
        if file.is_file() and file.suffix.lower() in EXTENSIONS:
            with Image.open(file) as image:
                image = image.convert("RGB")
                image = image.resize(SIZE)
                image.save(file.with_suffix(".jpg"), "JPEG", quality=95)

                if file.suffix.lower() != ".jpg":
                    file.unlink()

            processed += 1

    print(f"{root}: {processed} images resized")

print("\nIMAGE RESIZING COMPLETE!")
