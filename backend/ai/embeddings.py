"""
OpenAI embedding generation for semantic similarity
"""
import logging
from typing import List
from openai import AsyncOpenAI

from backend.config import settings

logger = logging.getLogger(__name__)


class EmbeddingGenerator:
    """Generates embeddings for messages using OpenAI"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "text-embedding-ada-002"
    
    async def generate(self, text: str) -> List[float]:
        """
        Generate embedding vector for text
        
        Args:
            text: Text to embed
            
        Returns:
            List of 1536 float values (embedding vector)
        """
        try:
            # Truncate if needed (ada-002 has 8191 token limit)
            # Rough estimate: 1 token ≈ 4 characters
            MAX_CHARS = 8000 * 4
            if len(text) > MAX_CHARS:
                text = text[:MAX_CHARS]
                logger.warning(f"Truncating text for embedding from {len(text)} chars")
            
            response = await self.client.embeddings.create(
                model=self.model,
                input=text
            )
            
            embedding = response.data[0].embedding
            logger.debug(f"Generated embedding of length {len(embedding)}")
            
            return embedding
        
        except Exception as e:
            logger.error(f"Embedding generation error: {e}", exc_info=True)
            raise

