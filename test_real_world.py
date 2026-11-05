
import tensorflow as tf
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix

IMG_SIZE = (224, 224)

# Load unseen real-world images
dataset = tf.keras.utils.image_dataset_from_directory(
    "REAL_WORLD_TEST",
    image_size=IMG_SIZE,
    batch_size=1,
    label_mode="binary",
    shuffle=False
)

print("\nClass order:", dataset.class_names)

# Load trained model
model = tf.keras.models.load_model("road_model_improved.keras")
# Actual labels
y_true = np.concatenate([
    labels.numpy().ravel()
    for images, labels in dataset
]).astype(int)

# AI predictions
predictions = model.predict(dataset, verbose=1).ravel()
y_pred = (predictions >= 0.5).astype(int)

print("\n===== REAL-WORLD TEST RESULTS =====")

for i, (actual, predicted, score) in enumerate(
    zip(y_true, y_pred, predictions), start=1
):
    actual_name = dataset.class_names[actual]
    predicted_name = dataset.class_names[predicted]

    print(f"\nImage {i}")
    print("Actual:", actual_name)
    print("Predicted:", predicted_name)
    print(f"Pothole score: {score * 100:.2f}%")

print("\n===== CLASSIFICATION REPORT =====")

print(classification_report(
    y_true,
    y_pred,
    target_names=dataset.class_names,
    zero_division=0
))

print("\n===== CONFUSION MATRIX =====")
print(confusion_matrix(y_true, y_pred))
