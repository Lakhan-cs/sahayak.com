from pathlib import Path
import joblib

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "service_model.pkl"
VECTORIZER_PATH = BASE_DIR / "models" / "vectorizer.pkl"


class RequirementModel:
    def __init__(self):
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
        if not VECTORIZER_PATH.exists():
            raise FileNotFoundError(f"Vectorizer not found: {VECTORIZER_PATH}")
        self.model = joblib.load(MODEL_PATH)
        self.vectorizer = joblib.load(VECTORIZER_PATH)

    def understand(self, text):
        text = str(text or "").strip()
        if not text:
            return {"success": False, "message": "Please enter your requirement."}

        features = self.vectorizer.transform([text])
        service = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        confidence = max(probabilities)
        classes = self.model.classes_
        top_indexes = probabilities.argsort()[-3:][::-1]

        suggestions = [
            {"service": classes[index], "confidence": round(float(probabilities[index]), 3)}
            for index in top_indexes
        ]

        return {
            "success": True,
            "input": text,
            "service": service,
            "confidence": round(float(confidence), 3),
            "suggestions": suggestions,
        }
