from fastapi import APIRouter, HTTPException
import os
from dotenv import load_dotenv

from models.session import CoachingRequest

load_dotenv()

router = APIRouter(prefix="/coaching", tags=["coaching"])

FALLBACK_INSTRUCTIONS = {
    "knee bend": "Start sitting on a chair with feet flat on the floor. Slowly bend your knee, lifting your foot off the ground. Hold for 3 seconds, then lower it back down. Keep your back straight. Breathe in as you lift, breathe out as you lower. Do this 10 times on each leg. Stop if you feel sharp pain.",
    "shoulder rotation": "Stand or sit upright. Slowly roll your shoulders forward in a circle, then backward. Keep your arms relaxed at your sides. Breathe steadily throughout. Do 10 rotations forward and 10 backward. Move slowly and gently. Stop if you feel any pain.",
    "ankle circles": "Sit on a chair and lift one foot off the floor. Slowly rotate your ankle in a circle, 10 times clockwise then 10 times anticlockwise. Keep the movement smooth. Breathe normally. Repeat with the other foot. Stop if you feel pain.",
}

def get_fallback(exercise_name: str) -> str:
    key = exercise_name.lower().strip()
    for k, v in FALLBACK_INSTRUCTIONS.items():
        if k in key or key in k:
            return v
    return (
        f"For {exercise_name}: start in a comfortable position. "
        "Move slowly and gently through the exercise. "
        "Breathe steadily — inhale to prepare, exhale as you move. "
        "Complete 10 repetitions. Rest if you feel pain or discomfort."
    )


@router.post("/instruction")
async def get_coaching_instruction(request: CoachingRequest):
    """Generate AI coaching instruction, with fallback if watsonx.ai is unavailable."""
    try:
        from ibm_watsonx_ai.foundation_models import Model
        from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

        api_key = os.getenv("WATSONX_API_KEY")
        project_id = os.getenv("WATSONX_PROJECT_ID")
        url = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")

        if not api_key or not project_id:
            raise ValueError("Credentials not configured")

        model = Model(
            model_id="ibm/granite-3-8b-instruct",
            params={
                GenParams.MAX_NEW_TOKENS: 200,
                GenParams.TEMPERATURE: 0.7,
                GenParams.TOP_P: 1,
                GenParams.TOP_K: 50
            },
            credentials={"apikey": api_key, "url": url},
            project_id=project_id
        )

        prompt = f"""You are a physiotherapist providing voice instructions to a patient doing home exercises.

Exercise: {request.exercise_name}

Provide clear, simple, step-by-step instructions for this exercise. Keep it under 100 words. Use simple language suitable for patients with low literacy. Focus on:
1. Starting position
2. Movement steps
3. Breathing
4. Safety tips

Instructions:"""

        response = model.generate_text(prompt=prompt)
        return {"exercise_name": request.exercise_name, "instruction": response.strip(), "source": "watsonx"}

    except Exception:
        return {
            "exercise_name": request.exercise_name,
            "instruction": get_fallback(request.exercise_name),
            "source": "fallback"
        }


@router.get("/health")
async def health_check():
    """Check if IBM watsonx.ai service is configured"""
    watsonx_configured = bool(os.getenv("WATSONX_API_KEY") and os.getenv("WATSONX_PROJECT_ID"))
    return {
        "watsonx_ai": "configured" if watsonx_configured else "not_configured",
        "text_to_speech": "browser_native",
        "status": "ready" if watsonx_configured else "needs_configuration",
        "note": "Using browser's built-in speech synthesis for voice guidance"
    }