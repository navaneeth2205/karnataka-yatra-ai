import json
import logging
import os
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import httpx
from backend.app.core.config import settings
from backend.app.services.localization_service import DESTINATION_NAMES

logger = logging.getLogger("karnataka_yatra.llm")

CURATED_FEW_SHOT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
    "dataset",
    "few_shot_curated.json",
)


def load_curated_few_shot_examples(preferred_language: str, duration_days: int, limit: int = 1) -> List[Dict[str, Any]]:
    """
    Retrieves high-quality, validated few-shot examples from the curated dataset pool
    to improve LLM generation quality through in-context learning without fine-tuning.
    """
    if not os.path.exists(CURATED_FEW_SHOT_PATH):
        return []

    try:
        with open(CURATED_FEW_SHOT_PATH, "r", encoding="utf-8") as f:
            examples = json.load(f)

        lang_norm = preferred_language.lower()
        matching = [
            e for e in examples
            if lang_norm in e.get("target_language", "").lower()
            or lang_norm in e.get("target_language_code", "").lower()
        ]

        if not matching:
            matching = [e for e in examples if e.get("target_language") == "original" or "english" in e.get("target_language", "").lower()]

        matching.sort(key=lambda x: abs((x.get("requested_duration") or 3) - duration_days))
        return matching[:limit]
    except Exception as e:
        logger.warning(f"Could not load few-shot examples: {e}")
        return []


class BaseLLMProvider(ABC):
    @abstractmethod
    def generate_narrative(
        self,
        starting_city: str,
        duration_days: int,
        interests: list,
        experience_preference: str,
        destinations: list,
        preferred_language: str,
        travel_season: str = "winter",
    ) -> Dict[str, str]:
        """Returns title and summary for the trip."""
        pass


class DeterministicProvider(BaseLLMProvider):
    """
    Multilingual deterministic narrative engine.
    Produces 100% natural localized content across Kannada, Hindi, Telugu, Tamil, Malayalam, and English.
    """

    def generate_narrative(
        self,
        starting_city: str,
        duration_days: int,
        interests: list,
        experience_preference: str,
        destinations: list,
        preferred_language: str,
        travel_season: str = "winter",
    ) -> Dict[str, str]:
        lang = preferred_language.lower()

        # Localize destination names for the title
        dest_names = [
            DESTINATION_NAMES.get(d.id, {}).get(lang, d.name)
            for d in destinations
        ]
        dest_str = " & ".join(dest_names[:3]) if dest_names else "Karnataka"
        interests_str = ", ".join(interests[:3])

        if lang == "kannada":
            title = f"ಕರ್ನಾಟಕ ಯಾತ್ರೆ: {dest_str} ಸಾಂಸ್ಕೃತಿಕ ಪಯಣ"
            summary = (
                f"{starting_city} ನಗರದಿಂದ ಪ್ರಾರಂಭವಾಗುವ {duration_days} ದಿನಗಳ ಅದ್ಭುತ ಪ್ರವಾಸ. "
                f"{dest_str} ಪ್ರಮುಖ ತಾಣಗಳು ಮತ್ತು {travel_season.capitalize()} ಋತುವಿನ ವಿಶೇಷ ಆಕರ್ಷಣೆಗಳನ್ನು ಒಳಗೊಂಡಿದೆ."
            )
        elif lang == "hindi":
            title = f"कर्नाटक यात्रा: {dest_str} की सांस्कृतिक धरोहर"
            summary = (
                f"{starting_city} से शुरू होने वाली {duration_days} दिवसीय अविस्मरणीय यात्रा। "
                f"{dest_str} के दर्शनीय स्थलों और {travel_season.capitalize()} मौसम के अनुसार तैयार विशेष योजना।"
            )
        elif lang == "telugu":
            title = f"కర్ణాటక యాత్ర: {dest_str} ప్రత్యేక పర్యటన"
            summary = (
                f"{starting_city} నుండి ప్రారంభమయ్యే {duration_days} రోజుల అద్భుత ప్రయాణం. "
                f"{dest_str}లోని ప్రసిద్ధ పర్యాటక ప్రదేశాలు మరియు ఆహ్లాదకరమైన అనుభవాలు."
            )
        elif lang == "tamil":
            title = f"கர்நாடக யாத்திரை: {dest_str} பாரம்பரிய பயணம்"
            summary = (
                f"{starting_city}விலிருந்து தொடங்கும் {duration_days} நாள் இனிய பயணம். "
                f"{dest_str}ன் முக்கிய வரலாற்றுத் தலங்கள் மற்றும் இயற்கை எழில் காட்சிகள்."
            )
        elif lang == "malayalam":
            title = f"കർണാടക യാത്ര: {dest_str} സാംസ്കാരിക പര്യടനം"
            summary = (
                f"{starting_city}ൽ നിന്ന് ആരംഭിക്കുന്ന {duration_days} ദിവസത്തെ സുന്ദരമായ യാത്ര. "
                f"{dest_str}ലെ പ്രധാന വിനോദസഞ്ചാര കേന്ദ്രങ്ങളും കാഴ്ചകളും."
            )
        else:  # english
            titles_by_pref = {
                "budget-friendly": f"Smart Explorer: {dest_str} Discovery",
                "relaxed": f"Serene Karnataka: Unhurried Journey through {dest_str}",
                "adventurous": f"Wild Trails & Peaks: {dest_str} Expedition",
                "balanced": f"Essence of Karnataka: Handcrafted {dest_str} Journey",
            }
            title = titles_by_pref.get(experience_preference, f"Karnataka Odyssey: {dest_str}")
            summary = (
                f"A thoughtfully curated {duration_days}-day journey originating from {starting_city}. "
                f"Balanced for a {experience_preference} pace highlighting {interests_str} across {dest_str}."
            )

        return {
            "title": title,
            "summary": summary,
            "provider": "deterministic",
        }


class GeminiLLMProvider(BaseLLMProvider):
    """
    Google Gemini provider with native multilingual prompts and seasonal understanding.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.fallback = DeterministicProvider()

    def generate_narrative(
        self,
        starting_city: str,
        duration_days: int,
        interests: list,
        experience_preference: str,
        destinations: list,
        preferred_language: str,
        travel_season: str = "winter",
    ) -> Dict[str, str]:
        if not self.api_key:
            return self.fallback.generate_narrative(
                starting_city,
                duration_days,
                interests,
                experience_preference,
                destinations,
                preferred_language,
                travel_season,
            )

        dest_names = ", ".join([d.name for d in destinations])

        prompt = f"""You are the senior Karnataka Tourism AI planner.
Generate a concise, evocative itinerary title and a 2-sentence overview entirely in the target language: {preferred_language.upper()}.
Do NOT mix languages. Write 100% natural, fluent {preferred_language}.

Parameters:
- Starting Gateway: {starting_city}
- Duration: {duration_days} days
- Season: {travel_season.upper()}
- Interests: {', '.join(interests)}
- Style: {experience_preference}
- Destinations Included: {dest_names}

Guidelines:
- Return ONLY valid JSON in this exact structure:
{{
  "title": "Your Itinerary Title in {preferred_language}",
  "summary": "Your 2-sentence overview in {preferred_language}"
}}
"""
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.MODEL_NAME}:generateContent?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.4, "maxOutputTokens": 300},
            }
            with httpx.Client(timeout=8.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    if raw_text.startswith("```"):
                        raw_text = raw_text.split("```")[1]
                        if raw_text.startswith("json"):
                            raw_text = raw_text[4:]
                    parsed = json.loads(raw_text.strip())
                    return {
                        "title": parsed.get("title", ""),
                        "summary": parsed.get("summary", ""),
                        "provider": "gemini-multilingual",
                    }
        except Exception as e:
            logger.warning(f"Gemini API invocation failed ({e}); falling back to multilingual engine.")

        return self.fallback.generate_narrative(
            starting_city,
            duration_days,
            interests,
            experience_preference,
            destinations,
            preferred_language,
            travel_season,
        )


def get_llm_provider() -> BaseLLMProvider:
    if settings.LLM_PROVIDER.lower() == "gemini" and settings.GEMINI_API_KEY:
        return GeminiLLMProvider()
    return DeterministicProvider()
