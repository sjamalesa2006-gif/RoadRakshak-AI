
from pathlib import Path
import random
import shutil

random.seed(42)

source = Path("PROCESSED_DATASET")
train_root = Path("TRAINING_DATASET")
val_root = Path("VALIDATION_DATASET")

classes = ["NORMAL", "potholes"]
train_ratio = 0.80

for class_name in classes:

    images = list((source / class_name).glob("*.jpg"))
    random.shuffle(images)

    split_index = int(len(images) * train_ratio)

    train_images = images[:split_index]
    val_images = images[split_index:]

    train_folder = train_root / class_name
    val_folder = val_root / class_name

    train_folder.mkdir(parents=True, exist_ok=True)
    val_folder.mkdir(parents=True, exist_ok=True)

    for image in train_images:
        shutil.copy2(image, train_folder / image.name)

    for image in val_images:
        shutil.copy2(image, val_folder / image.name)

    print(f"\n{class_name}")
    print("Training:", len(train_images))
    print("Validation:", len(val_images))

print("\nDataset splitting completed!")
