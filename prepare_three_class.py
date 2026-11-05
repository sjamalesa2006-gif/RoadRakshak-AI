from pathlib import Path
import shutil

CLASSES = [
    "NORMAL_ROAD",
    "ACTUAL_POTHOLES",
    "ROAD_CRACKS"
]

SPLITS = [
    ("TRAINING_DATASET_4CLASS", "TRAINING_DATASET_3CLASS"),
    ("VALIDATION_DATASET_4CLASS", "VALIDATION_DATASET_3CLASS")
]

for source_name, destination_name in SPLITS:
    source_root = Path(source_name)
    destination_root = Path(destination_name)

    for class_name in CLASSES:
        source = source_root / class_name
        destination = destination_root / class_name

        if destination.exists():
            shutil.rmtree(destination)

        shutil.copytree(source, destination)

        count = len(list(destination.glob("*.jpg")))
        print(f"{destination_name}/{class_name}: {count} images")

print("\nTHREE-CLASS DATASET READY!")
