"""
AI-powered ticket title generator
Creates concise, descriptive titles based on message context
"""
import json
import logging
from typing import List
from openai import AsyncOpenAI

from backend.config import settings

logger = logging.getLogger(__name__)


class TitleGenerator:
    """Uses GPT-4 to generate concise, descriptive ticket titles"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def generate_title(
        self,
        messages: List[str],
        category: str
    ) -> str:
        """
        Generate a concise, descriptive title for a ticket
        
        Args:
            messages: List of message texts in the ticket
            category: Ticket category (bug, feature, support, question)
            
        Returns:
            Concise title (max 80 chars)
        """
        try:
            # Combine messages for context
            context = "\n\n".join([f"Message {i+1}: {msg}" for i, msg in enumerate(messages[:5])])
            
            system_prompt = """You are a ticket title generator for a Forward-Deployed Engineer dashboard.

Generate a SHORT, concise title (max 60 characters, ideally 3-6 words) that captures the core issue or request.

Guidelines:
- Be BRIEF and to the point (like "Mobile Login Button Issue")
- Use title case (capitalize important words)
- Focus on the KEY problem/request only
- Remove filler words like "I just wanted to check in regarding..."
- For bugs: "What" + "Where" format (e.g., "Mobile Login Button Issue", "Export Feature Broken")
- For features: "Add" + "What" format (e.g., "Add CSV Export", "Dark Mode Request")
- For support: "How to" or question format (e.g., "Password Reset Help", "Export Data Guide")
- For questions: Direct question or topic (e.g., "Enterprise Pricing", "Feature Launch Date")

Examples:
- "i just wanted to check in regarding the mobile login button" → "Mobile Login Button Issue" ✅
- "Can you add CSV export?" → "Add CSV Export" ✅
- "The app crashes when I click export" → "Export Click Crash" ✅
- "How do I reset my password?" → "Password Reset Help" ✅
- "The login button doesn't work on mobile" → "Mobile Login Button Issue" ✅

Respond ONLY with the title, no quotes, no explanation, no periods at the end."""

            user_prompt = f"""Category: {category}

Messages:
{context}

Generate a concise title:"""

            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=50
            )
            
            title = response.choices[0].message.content.strip()
            
            # Remove quotes if present
            if title.startswith('"') and title.endswith('"'):
                title = title[1:-1]
            if title.startswith("'") and title.endswith("'"):
                title = title[1:-1]
            
            # Clean up the title
            title = title.strip()
            # Remove trailing periods
            if title.endswith('.'):
                title = title[:-1]
            # Ensure max length (prefer shorter)
            if len(title) > 60:
                title = title[:57] + "..."
            
            logger.debug(f"Generated title: {title}")
            return title
        
        except Exception as e:
            logger.error(f"Title generation error: {e}", exc_info=True)
            # Fallback: Extract key words from first message
            if messages:
                first_msg = messages[0].lower()
                # Try to extract key phrases
                # Remove common filler words
                filler_words = ['i', 'just', 'wanted', 'to', 'check', 'in', 'regarding', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'can', 'you', 'please', 'thanks', 'thank']
                words = first_msg.split()
                key_words = [w for w in words if w not in filler_words and len(w) > 2][:4]
                if key_words:
                    fallback = ' '.join(key_words).title()
                    if len(fallback) > 60:
                        fallback = fallback[:57] + "..."
                    return fallback
                # Last resort: first 60 chars
                fallback = messages[0][:60].strip()
                if len(messages[0]) > 60:
                    fallback += "..."
                return fallback
            return "New Ticket"

