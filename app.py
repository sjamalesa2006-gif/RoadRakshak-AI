

import streamlit as st
import tensorflow as tf
import numpy as np
from PIL import Image

st.set_page_config(
    page_title="RoadRakshak AI",
    page_icon="🚧",
    layout="wide"
)

@st.cache_resource
def load_model():
    return tf.keras.models.load_model("road_model.keras")

st.title("🚧 RoadRakshak AI")
st.subheader("AI-Powered Pothole Detection System")

st.write(
    "Upload a road image to check whether the AI detects "
    "a pothole or a normal road."
)

st.divider()

uploaded_file = st.file_uploader(
    "Upload a road image",
    type=["jpg", "jpeg", "png", "webp"]
)

if uploaded_file is not None:

    image = Image.open(uploaded_file).convert("RGB")
    st.image(
        image,
        caption="Uploaded Road Image",
        use_container_width=True
    )

    if st.button("🔍 Analyze Road Image", type="primary"):

        with st.spinner("AI is analyzing the road..."):

            try:
                model = load_model()

                # Prepare image
                image = image.resize((224, 224))
                image_array = np.array(image, dtype=np.float32)
                image_array = np.expand_dims(image_array, axis=0)

                # Predict
                prediction = model.predict(
                    image_array,
                    verbose=0
                )[0][0]

                # NORMAL = 0, potholes = 1
                if prediction >= 0.5:
                    st.error("🚨 POTHOLE DETECTED")
                    score = float(prediction)
                    st.metric(
                        "Pothole prediction score",
                        f"{score * 100:.2f}%"
                    )
                else:
                    st.success("✅ NORMAL ROAD")
                    score = 1.0 - float(prediction)
                    st.metric(
                        "Normal-road prediction score",
                        f"{score * 100:.2f}%"
                    )

                st.caption(
                    "This is an AI model score, not a guarantee "
                    "of actual road conditions."
                )

            except Exception as error:
                st.error(f"Prediction failed: {error}")

