from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import os
from dotenv import load_dotenv
import base64

from models.session import CoachingRequest, TTSRequest

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


@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """
    Convert text to speech using IBM Watson Text-to-Speech
    Returns audio as base64-encoded string
    """
    try:
        # Import IBM Watson SDK
        from ibm_watson import TextToSpeechV1
        from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
        
        # Get credentials from environment
        api_key = os.getenv("IBM_TTS_API_KEY")
        url = os.getenv("IBM_TTS_URL")
        
        if not api_key or not url:
            raise HTTPException(
                status_code=500,
                detail="IBM Watson TTS credentials not configured. Please set IBM_TTS_API_KEY and IBM_TTS_URL in .env file"
            )
        
        # Initialize authenticator and service
        authenticator = IAMAuthenticator(api_key)
        text_to_speech = TextToSpeechV1(authenticator=authenticator)
        text_to_speech.set_service_url(url)
        
        # Generate speech
        # Using en-US_AllisonV3Voice - clear, friendly female voice
        response = text_to_speech.synthesize(
            text=request.text,
            voice='en-US_AllisonV3Voice',
            accept='audio/mp3'
        ).get_result()
        
        # Convert audio to base64
        audio_content = response.content
        audio_base64 = base64.b64encode(audio_content).decode('utf-8')
        
        return {
            "audio": audio_base64,
            "format": "mp3",
            "text": request.text
        }
        
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="IBM Watson SDK not installed. Run: pip install ibm-watson"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate speech: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Check if IBM services are configured"""
    watsonx_configured = bool(os.getenv("WATSONX_API_KEY") and os.getenv("WATSONX_PROJECT_ID"))
    tts_configured = bool(os.getenv("IBM_TTS_API_KEY") and os.getenv("IBM_TTS_URL"))
    
    return {
        "watsonx_ai": "configured" if watsonx_configured else "not_configured",
        "watson_tts": "configured" if tts_configured else "not_configured",
        "status": "ready" if (watsonx_configured and tts_configured) else "needs_configuration"
    }
