
from pathlib import Path
from io import BytesIO
from datetime import datetime, timezone
import sqlite3
import uuid

import numpy as np
import tensorflow as tf
from PIL import Image, UnidentifiedImageError

from fastapi import (
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
    Request
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Literal


# ==================================================
# 1. PROJECT CONFIGURATION
# ==================================================

PROJECT_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = PROJECT_DIR / "road_model_3class.keras"

DATA_DIR = PROJECT_DIR / "backend" / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
DATABASE_PATH = DATA_DIR / "road_reports.db"

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

CLASSES = [
    "NORMAL_ROAD",
    "ACTUAL_POTHOLES",
    "ROAD_CRACKS"
]

VALID_STATUSES = [
    "Pending verification",
    "Verified",
    "Resolved"
]

MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024


# ==================================================
# 2. LOAD EXISTING THREE-CLASS AI MODEL
# ==================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"AI model not found: {MODEL_PATH}"
    )

model = tf.keras.models.load_model(MODEL_PATH)

print("RoadRakshak AI model loaded successfully!")


# ==================================================
# 3. DATABASE CONNECTION
# ==================================================

def get_connection():

    connection = sqlite3.connect(DATABASE_PATH)

    connection.row_factory = sqlite3.Row

    return connection


def initialize_database():

    with get_connection() as connection:

        connection.execute("""
            CREATE TABLE IF NOT EXISTS reports (

                id TEXT PRIMARY KEY,

                prediction TEXT NOT NULL,

                confidence REAL NOT NULL,

                latitude REAL,

                longitude REAL,

                accuracy REAL,

                location_source TEXT,

                image_name TEXT NOT NULL,

                image_url TEXT NOT NULL,

                description TEXT,

                status TEXT NOT NULL,

                created_at TEXT NOT NULL

            )
        """)

    print("RoadRakshak database initialized!")


initialize_database()


# ==================================================
# 4. REPORT STATUS UPDATE MODEL
# ==================================================

class ReportStatusUpdate(BaseModel):

    status: Literal[
        "Pending verification",
        "Verified",
        "Resolved"
    ]


# ==================================================
# 5. FASTAPI APPLICATION
# ==================================================

app = FastAPI(
    title="RoadRakshak AI",
    description="AI-powered Road Damage Detection and Reporting System",
    version="2.1.0"
)


# ==================================================
# 6. CORS CONFIGURATION
# ==================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://road-rakshak-m2sk1x1gt-amal-e1d9.vercel.app",
    "https://road-rakshak-ap5sguadw-amal-e1d9.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# 7. SERVE UPLOADED ROAD IMAGES
# ==================================================

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads"
)


# ==================================================
# 8. FORMAT REPORT RESPONSE
# ==================================================

def serialize_report(row, base_url):

    report = dict(row)

    report["image_url"] = (
        f"{base_url.rstrip('/')}{report['image_url']}"
    )

    if (
        report["latitude"] is not None
        and report["longitude"] is not None
    ):

        report["position"] = [
            report["latitude"],
            report["longitude"]
        ]

    else:

        report["position"] = None

    return report


# ==================================================
# 9. HOME API
# ==================================================

@app.get("/")
def home():

    return {
        "message": "RoadRakshak AI backend is running",
        "version": "2.1.0",
        "model": MODEL_PATH.name,
        "classes": CLASSES
    }


# ==================================================
# 10. HEALTH CHECK API
# ==================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_loaded": True,
        "model": MODEL_PATH.name,
        "database": DATABASE_PATH.exists(),
        "classes": CLASSES
    }


# ==================================================
# 11. AI PREDICTION API
# ==================================================

@app.post("/predict")
async def predict(

    file: UploadFile = File(...),

    latitude: float | None = Form(None),

    longitude: float | None = Form(None),

    accuracy: float | None = Form(None),

    location_source: str | None = Form(None)

):

    # Validate image type

    if (
        not file.content_type
        or not file.content_type.startswith("image/")
    ):

        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image."
        )

    # Validate GPS coordinates

    if (latitude is None) != (longitude is None):

        raise HTTPException(
            status_code=400,
            detail="Latitude and longitude must be provided together."
        )

    if latitude is not None and not -90 <= latitude <= 90:

        raise HTTPException(
            status_code=400,
            detail="Invalid latitude."
        )

    if longitude is not None and not -180 <= longitude <= 180:

        raise HTTPException(
            status_code=400,
            detail="Invalid longitude."
        )

    if accuracy is not None and accuracy < 0:

        raise HTTPException(
            status_code=400,
            detail="Accuracy cannot be negative."
        )

    # Read original image

    image_bytes = await file.read()

    if not image_bytes:

        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty."
        )

    if len(image_bytes) > MAX_UPLOAD_SIZE_BYTES:

        raise HTTPException(
            status_code=413,
            detail=(
                f"Uploaded image exceeds the maximum size of "
                f"{MAX_UPLOAD_SIZE_BYTES / (1024 * 1024):.0f}MB."
            )
        )

    try:

        # IMAGE PREPROCESSING

        image = Image.open(
            BytesIO(image_bytes)
        ).convert("RGB")

        image = image.resize((224, 224))

        image_array = np.array(
            image,
            dtype=np.float32
        )

        image_array = np.expand_dims(
            image_array,
            axis=0
        )

        # AI MODEL PREDICTION

        probabilities = model.predict(
            image_array,
            verbose=0
        )[0]

        if len(probabilities) != len(CLASSES):

            raise ValueError(
                "Model output does not match the three configured classes."
            )

        predicted_index = int(
            np.argmax(probabilities)
        )

        label = CLASSES[predicted_index]

        confidence = (
            float(probabilities[predicted_index]) * 100
        )

        class_probabilities = {

            CLASSES[i]: round(
                float(probabilities[i]) * 100,
                2
            )

            for i in range(len(CLASSES))
        }

        # PREPARE PREDICTION RESPONSE

        result = {

            "prediction": label,

            "confidence": round(confidence, 2),

            "class_probabilities": class_probabilities,

            "pothole_probability": class_probabilities.get(
                "ACTUAL_POTHOLES",
                0.0
            ),

            "report": None

        }

        # SAVE DAMAGE REPORT AUTOMATICALLY

        if label != "NORMAL_ROAD":

            report_id = str(uuid.uuid4())

            extension = Path(
                file.filename or ""
            ).suffix.lower()

            if extension not in [
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            ]:

                extension = ".jpg"

            saved_filename = (
                f"{report_id}{extension}"
            )

            saved_path = (
                UPLOAD_DIR / saved_filename
            )

            # Save original uploaded photograph

            saved_path.write_bytes(image_bytes)

            image_path = (
                f"/uploads/{saved_filename}"
            )

            created_at = (
                datetime.now(timezone.utc).isoformat()
            )

            # Prepare description

            if label == "ACTUAL_POTHOLES":

                description = (
                    "AI detected a pothole. "
                    "Field verification required."
                )

            else:

                description = (
                    "AI detected road cracks. "
                    "Field verification required."
                )

            # Save report to SQLite

            with get_connection() as connection:

                connection.execute("""

                    INSERT INTO reports (

                        id,
                        prediction,
                        confidence,
                        latitude,
                        longitude,
                        accuracy,
                        location_source,
                        image_name,
                        image_url,
                        description,
                        status,
                        created_at

                    )

                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

                """, (

                    report_id,
                    label,
                    round(confidence, 2),
                    latitude,
                    longitude,
                    accuracy,
                    location_source,
                    file.filename or saved_filename,
                    image_path,
                    description,
                    "Pending verification",
                    created_at

                ))

            # Attach saved report to prediction response

            result["report"] = {

                "id": report_id,
                "prediction": label,
                "confidence": round(confidence, 2),
                "latitude": latitude,
                "longitude": longitude,
                "accuracy": accuracy,
                "location_source": location_source,
                "image_name": file.filename or saved_filename,
                "image_url": image_path,
                "description": description,
                "status": "Pending verification",
                "created_at": created_at

            }

        return result

    except UnidentifiedImageError:

        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a readable image."
        )

    except HTTPException:

        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Image analysis failed: {str(error)}"
        )

    finally:

        await file.close()


# ==================================================
# 12. GET ALL REPORTS API
# ==================================================

@app.get("/reports")
def get_reports(request: Request):

    with get_connection() as connection:

        rows = connection.execute("""

            SELECT *

            FROM reports

            ORDER BY created_at DESC

        """).fetchall()

    reports = [

        serialize_report(
            row,
            str(request.base_url)
        )

        for row in rows

    ]

    return {
        "total": len(reports),
        "reports": reports
    }


# ==================================================
# 13. GET SINGLE REPORT API
# ==================================================

@app.get("/reports/{report_id}")
def get_report(
    report_id: str,
    request: Request
):

    with get_connection() as connection:

        row = connection.execute(

            "SELECT * FROM reports WHERE id = ?",

            (report_id,)

        ).fetchone()

    if row is None:

        raise HTTPException(
            status_code=404,
            detail="Report not found."
        )

    return serialize_report(
        row,
        str(request.base_url)
    )


# ==================================================
# 14. UPDATE REPORT STATUS API
# ==================================================

@app.patch("/reports/{report_id}/status")
def update_report_status(

    report_id: str,

    update: ReportStatusUpdate

):

    with get_connection() as connection:

        existing_report = connection.execute(

            "SELECT id FROM reports WHERE id = ?",

            (report_id,)

        ).fetchone()

        if existing_report is None:

            raise HTTPException(
                status_code=404,
                detail="Report not found."
            )

        connection.execute(

            """
            UPDATE reports
            SET status = ?
            WHERE id = ?
            """,

            (update.status, report_id)

        )

    return {

        "success": True,

        "message": "Report status updated successfully.",

        "report_id": report_id,

        "status": update.status

    }


# ==================================================
# 15. STARTUP MESSAGE
# ==================================================

@app.on_event("startup")
async def startup_event():

    print("------------------------------------")

    print("ROADRAKSHAK AI BACKEND STARTED")

    print("AI MODEL: THREE-CLASS DETECTION")

    print("DATABASE: SQLITE")

    print("IMAGE STORAGE: ENABLED")

    print("REPORT API: ENABLED")

    print("REPORT STATUS UPDATE: ENABLED")

    print("------------------------------------")
