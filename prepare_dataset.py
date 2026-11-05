
from pathlib import Path
from PIL import Image, ImageOps

source_folders = {
    "NORMAL": Path("DATASET/NORMAL"),
    "potholes": Path("DATASET/potholes")
}

output_root = Path("PROCESSED_DATASET")
image_size = (224, 224)

total_saved = 0
failed = 0

for class_name, source_folder in source_folders.items():

    output_folder = output_root / class_name
    output_folder.mkdir(parents=True, exist_ok=True)

    print(f"\nPreparing {class_name}...")

    for file in source_folder.iterdir():

        if not file.is_file():
            continue

        try:
            with Image.open(file) as img:

                # Use the first frame for animated images
                img.seek(0)

                # Correct image orientation
                img = ImageOps.exif_transpose(img)

                # Convert to RGB
                img = img.convert("RGB")

                # Resize to 224 x 224
                img = ImageOps.fit(img, image_size)

                # Save as JPEG
                output_path = output_folder / f"{file.stem}.jpg"

                # Avoid overwriting files with the same name
                counter = 1
                while output_path.exists():
                    output_path = output_folder / f"{file.stem}_{counter}.jpg"
                    counter += 1

                img.save(output_path, "JPEG", quality=95)

                total_saved += 1

        except Exception as error:
            failed += 1
            print("Failed:", file.name, error)

    print("Completed:", class_name)

print("\n===== PREPARATION REPORT =====")
print("Images saved:", total_saved)
print("Images failed:", failed)
print("Output folder:", output_root)
