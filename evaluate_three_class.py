import tensorflow as tf
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix

CLASSES = ["NORMAL_ROAD", "ACTUAL_POTHOLES", "ROAD_CRACKS"]

val_ds = tf.keras.utils.image_dataset_from_directory(
    "VALIDATION_DATASET_3CLASS",
    class_names=CLASSES,
    image_size=(224, 224),
    batch_size=8,
    label_mode="int",
    shuffle=False
)

model = tf.keras.models.load_model("road_model_3class.keras")

y_true = np.concatenate([labels.numpy() for _, labels in val_ds])
predictions = model.predict(val_ds)
y_pred = np.argmax(predictions, axis=1)

print("\nCLASSIFICATION REPORT:\n")
print(classification_report(
    y_true,
    y_pred,
    target_names=CLASSES,
    zero_division=0
))

print("\nCONFUSION MATRIX:\n")
print(confusion_matrix(y_true, y_pred))

print("\nTHREE-CLASS MODEL EVALUATION COMPLETE!")
