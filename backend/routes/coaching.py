from fastapi import APIRouter, HTTPException
import os
from dotenv import load_dotenv

from models.session import CoachingRequest

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/coaching", tags=["coaching"])


@router.post("/instruction")
async def get_coaching_instruction(request: CoachingRequest):
    """
    Generate AI coaching instruction for an exercise using IBM watsonx.ai
    """
    try:
        # Import IBM watsonx.ai SDK
        from ibm_watsonx_ai.foundation_models import Model
        from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams
        
        # Get credentials from environment
        api_key = os.getenv("WATSONX_API_KEY")
        project_id = os.getenv("WATSONX_PROJECT_ID")
        url = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
        
        if not api_key or not project_id:
            raise HTTPException(
                status_code=500,
                detail="IBM watsonx.ai credentials not configured. Please set WATSONX_API_KEY and WATSONX_PROJECT_ID in .env file"
            )
        
        # Initialize the model
        model = Model(
            model_id="ibm/granite-13b-chat-v2",
            params={
                GenParams.MAX_NEW_TOKENS: 200,
                GenParams.TEMPERATURE: 0.7,
                GenParams.TOP_P: 1,
                GenParams.TOP_K: 50
            },
            credentials={
                "apikey": api_key,
                "url": url
            },
            project_id=project_id
        )
        
        # Create prompt for exercise coaching
        prompt = f"""You are a physiotherapist providing voice instructions to a patient doing home exercises.

Exercise: {request.exercise_name}

Provide clear, simple, step-by-step instructions for this exercise. Keep it under 100 words. Use simple language suitable for patients with low literacy. Focus on:
1. Starting position
2. Movement steps
3. Breathing
4. Safety tips

Instructions:"""
        
        # Generate response
        response = model.generate_text(prompt=prompt)
        
        return {
            "exercise_name": request.exercise_name,
            "instruction": response.strip()
        }
        
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="IBM watsonx.ai SDK not installed. Run: pip install ibm-watsonx-ai"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate coaching instruction: {str(e)}"
        )


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