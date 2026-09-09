import os

from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
SERVICES = [
    "Electrician", "Plumber", "Carpenter", "Gardener",
    "AC Repair", "Appliance Repair", "Painter", "Cleaner", "Other"
]

try:
    from google import genai
    _GENAI_AVAILABLE = True
except ImportError:
    genai = None
    _GENAI_AVAILABLE = False


class RequirementResult(BaseModel):
    service: str = Field(description="Detected UrbanServe service")
    issue: str = Field(description="Problem or requirement described by the customer")
    intent: str = Field(description="Customer intention")
    language: str = Field(description="Detected language")
    confidence: float = Field(description="Confidence from 0 to 1")


def _ml_fallback(user_text: str):
    try:
        from search_feature.requirement_model import RequirementModel
        result = RequirementModel().understand(user_text)
        return {
            "success": result.get("success", False),
            "service": result.get("service", "Other"),
            "issue": user_text,
            "intent": "service_request",
            "language": "English/Hinglish",
            "confidence": result.get("confidence", 0.0),
            "source": "local-ml-fallback",
            "suggestions": result.get("suggestions", []),
        }
    except Exception as error:
        return {
            "success": False,
            "message": "AI service is unavailable and the local ML fallback could not be loaded.",
            "details": str(error),
        }


def understand_requirement(user_text):
    user_text = str(user_text or "").strip()
    if not user_text:
        return {"success": False, "message": "Please enter your requirement."}

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or api_key.lower().startswith("your_") or not _GENAI_AVAILABLE:
        return _ml_fallback(user_text)

    service_list = ", ".join(SERVICES)
    prompt = f"""
You are UrbanServe's AI Requirement Understanding system.
Allowed services are ONLY: {service_list}
Understand English, Hindi, Hinglish and common Indian mixed-language searches.
Determine service, issue, customer intent, language, and confidence from 0 to 1.
Do not invent a new service.
Customer input: {user_text}
"""

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": RequirementResult,
            },
        )
        result = RequirementResult.model_validate_json(response.text)
        service = result.service if result.service in SERVICES else "Other"
        return {
            "success": True,
            "service": service,
            "issue": result.issue,
            "intent": result.intent,
            "language": result.language,
            "confidence": round(max(0.0, min(1.0, float(result.confidence))), 3),
            "source": "gemini",
        }
    except Exception as error:
        print("Gemini Error:", error)
        # Keep the search feature useful if the external AI is temporarily unavailable.
        return _ml_fallback(user_text)
