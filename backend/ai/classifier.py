"""
OpenAI-based message classification
"""
import json
import logging
from typing import Optional
from openai import AsyncOpenAI

from backend.models import Classification
from backend.ai.prompts import CLASSIFICATION_SYSTEM_PROMPT
from backend.config import settings

logger = logging.getLogger(__name__)


class MessageClassifier:
    """Classifies Slack messages as relevant/irrelevant and assigns categories"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def classify(self, message_text: str) -> Classification:
        """
        Classify a single message
        
        Args:
            message_text: The Slack message text to classify
            
        Returns:
            Classification object with is_relevant, category, confidence, reasoning
        """
        try:
            # Truncate very long messages to avoid token limits
            MAX_TOKENS = 8000
            if len(message_text) > MAX_TOKENS * 4:  # Rough char estimate
                truncated = message_text[:MAX_TOKENS * 4] + "...[truncated]"
                logger.warning(f"Truncating long message from {len(message_text)} to {len(truncated)} chars")
                message_text = truncated
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": CLASSIFICATION_SYSTEM_PROMPT},
                    {"role": "user", "content": message_text}
                ],
                response_format={"type": "json_object"},
                temperature=0.3  # Lower temp for consistent classification
            )
            
            result = json.loads(response.choices[0].message.content)
            classification = Classification(**result)
            
            logger.info(
                f"Classification: relevant={classification.is_relevant}, "
                f"category={classification.category}, confidence={classification.confidence:.2f}"
            )
            
            return classification
        
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse classification JSON: {e}")
            return Classification(
                is_relevant=False,
                category=None,
                confidence=0.0,
                reasoning=f"JSON parsing failed: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Classification error: {e}", exc_info=True)
            # Default to not relevant on error (safe fallback)
            return Classification(
                is_relevant=False,
                category=None,
                confidence=0.0,
                reasoning=f"Classification failed: {str(e)}"
            )

