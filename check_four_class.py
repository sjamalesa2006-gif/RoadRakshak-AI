from pathlib import Path
from PIL import Image

DATASET = Path("FOUR_CLASS_DATASET")

classes = [
    "NORMAL_ROAD",
    "ACTUAL_POTHOLES",
    "ROAD_CRACKS",
    "ROAD_SHADOWS"
]

extensions = {".jpg", ".jpeg", ".png"}

total_valid = 0
total_invalid = 0

for class_name in classes:
    folder = DATASET / class_name
    valid = 0
    invalid = 0

    for file in folder.rglob("*"):
        if file.is_file() and file.suffix.lower() in extensions:
            try:
                with Image.open(file) as image:
                    image.verify()
                valid += 1
            except Exception:
                invalid += 1

    total_valid += valid
    total_invalid += invalid

    print(f"{class_name}: {valid} valid, {invalid} corrupted")

print("\nIMAGE CHECK COMPLETE")
print(f"Total valid: {total_valid}")
print(f"Total corrupted: {total_invalid}")
