
import tensorflow as tf
import numpy as np
from sklearn.metrics import (
    confusion_matrix,
    classification_report,
    accuracy_score
)

IMG_SIZE = (224, 224)
BATCH_SIZE = 16

# Load validation dataset
dataset = tf.keras.utils.image_dataset_from_directory(
    "VALIDATION_DATASET",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="binary",
    shuffle=False
)

print("Class order:", dataset.class_names)

# Load trained model
model = tf.keras.models.load_model("road_model_improved.keras")

# Get actual labels
y_true = np.concatenate([
    labels.numpy().ravel()
    for images, labels in dataset
]).astype(int)

# Get predictions
predictions = model.predict(dataset, verbose=1).ravel()
y_pred = (predictions >= 0.5).astype(int)

print("\n===== MODEL EVALUATION =====")

print("\nAccuracy:")
print(f"{accuracy_score(y_true, y_pred) * 100:.2f}%")

print("\nClassification Report:")
print(classification_report(
    y_true,
    y_pred,
    target_names=dataset.class_names
))

print("\nConfusion Matrix:")
print(confusion_matrix(y_true, y_pred))
