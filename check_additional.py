
import tensorflow as tf
import numpy as np
from pathlib import Path
from PIL import Image

folder = Path("ADDITIONAL_DATASET/NORMAL")

model = tf.keras.models.load_model("road_model.keras")

image_files = [
    p for p in folder.iterdir()
    if p.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]
]

if not image_files:
    print("No images found in ADDITIONAL_DATASET/NORMAL")
else:
    for file in image_files:
        image = Image.open(file).convert("RGB")
        image = image.resize((224, 224))

        image_array = np.array(image, dtype=np.float32)
        image_array = np.expand_dims(image_array, axis=0)

        score = float(model.predict(image_array, verbose=0)[0][0])

        prediction = "POTHOLES" if score >= 0.5 else "NORMAL"

        print("\nImage:", file.name)
        print("Prediction:", prediction)
        print(f"Pothole score: {score * 100:.2f}%")
