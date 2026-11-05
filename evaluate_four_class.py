import tensorflow as tf
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix

CLASSES = [
    "NORMAL_ROAD",
    "ACTUAL_POTHOLES",
    "ROAD_CRACKS",
    "ROAD_SHADOWS"
]

dataset = tf.keras.utils.image_dataset_from_directory(
    "VALIDATION_DATASET_4CLASS",
    class_names=CLASSES,
    image_size=(224, 224),
    batch_size=16,
    label_mode="int",
    shuffle=False
)

model = tf.keras.models.load_model("road_model_4class.keras")

y_true = np.concatenate([
    labels.numpy() for _, labels in dataset
])

predictions = model.predict(dataset)
y_pred = np.argmax(predictions, axis=1)

print("\nCLASSIFICATION REPORT\n")
print(classification_report(
    y_true,
    y_pred,
    labels=[0, 1, 2, 3],
    target_names=CLASSES,
    zero_division=0
))

print("\nCONFUSION MATRIX\n")
print(confusion_matrix(
    y_true,
    y_pred,
    labels=[0, 1, 2, 3]
))
