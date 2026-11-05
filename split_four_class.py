from pathlib import Path
import random
import shutil

SOURCE = Path("FOUR_CLASS_DATASET")
TRAIN = Path("TRAINING_DATASET_4CLASS")
VALIDATION = Path("VALIDATION_DATASET_4CLASS")

CLASSES = [
    "NORMAL_ROAD",
    "ACTUAL_POTHOLES",
    "ROAD_CRACKS",
    "ROAD_SHADOWS"
]

EXTENSIONS = {".jpg", ".jpeg", ".png"}
random.seed(42)

for class_name in CLASSES:
    images = [
        file for file in (SOURCE / class_name).rglob("*")
        if file.is_file() and file.suffix.lower() in EXTENSIONS
    ]

    random.shuffle(images)
    split_index = int(len(images) * 0.8)

    train_images = images[:split_index]
    validation_images = images[split_index:]

    for folder, selected_images in [
        (TRAIN / class_name, train_images),
        (VALIDATION / class_name, validation_images)
    ]:
        folder.mkdir(parents=True, exist_ok=True)

        for index, image in enumerate(selected_images):
            destination = folder / f"{class_name}_{index:04d}{image.suffix.lower()}"
            shutil.copy2(image, destination)

    print(
        f"{class_name}: "
        f"{len(train_images)} training, "
        f"{len(validation_images)} validation"
    )

print("\nFOUR-CLASS DATASET SPLIT COMPLETE!")
