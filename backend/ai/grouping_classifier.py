"""
AI-based grouping classifier using GPT-4
Determines if two messages are about the same issue
"""
import json
import logging
from typing import Tuple
from openai import AsyncOpenAI

from backend.config import settings

logger = logging.getLogger(__name__)


class GroupingClassifier:
    """Uses GPT-4 to determine if messages are about the same issue"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def are_same_issue(
        self,
        message1: str,
        message2: str,
        ticket_title: str = None
    ) -> Tuple[bool, float, str]:
        """
        Check if two messages are about the same issue
        
        Args:
            message1: First message text
            message2: Second message text
            ticket_title: Optional title of existing ticket
            
        Returns:
            Tuple of (is_same_issue, confidence, reasoning)
        """
        try:
            prompt = f"""Message 1: "{message1}"

Message 2: "{message2}"
"""
            
            if ticket_title:
                prompt += f'\nExisting ticket title: "{ticket_title}"\n'
            
            prompt += "\nAre these messages about the SAME issue/topic?"
            
            system_prompt = """You are a message relationship analyzer for a Forward-Deployed Engineer.

Determine if two messages are about the SAME issue/topic, even if worded differently or sent hours/days apart.

Examples of SAME issue:
- "Can you add CSV export?" + "I don't see a button for CSV export" → SAME (both about CSV export feature)
- "Login button broken" + "The login doesn't work on mobile" → SAME (both about login issue)
- "How do I export data?" + "Where is the export feature?" → SAME (both asking about export)

Examples of DIFFERENT issues:
- "Can you add CSV export?" + "The login button is broken" → DIFFERENT (different features)
- "Export feature broken" + "How do I login?" → DIFFERENT (different topics)

Respond ONLY with valid JSON:
{
  "is_same_issue": true/false,
  "confidence": 0.90,
  "reasoning": "Brief explanation of why they are/aren't the same issue"
}"""
            
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2
            )
            
            result = json.loads(response.choices[0].message.content)
            
            is_same = result.get("is_same_issue", False)
            confidence = result.get("confidence", 0.0)
            reasoning = result.get("reasoning", "")
            
            logger.debug(
                f"Grouping check: same={is_same}, confidence={confidence:.2f}, "
                f"reasoning={reasoning}"
            )
            
            return (is_same, confidence, reasoning)
        
        except Exception as e:
            logger.error(f"Grouping classification error: {e}", exc_info=True)
            # On error, default to not same (safer)
            return (False, 0.0, f"Error: {str(e)}")

