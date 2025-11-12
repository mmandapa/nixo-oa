"""
Pydantic models for type safety
"""
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class Classification(BaseModel):
    """AI classification result"""
    is_relevant: bool
    category: Optional[str] = None  # 'support', 'bug', 'feature', 'question'
    confidence: float
    reasoning: str


class Ticket(BaseModel):
    """Ticket model"""
    id: str
    title: str
    category: str
    status: str
    channel_id: str
    channel_name: Optional[str] = None
    first_message_ts: str
    message_count: int
    last_user_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class Message(BaseModel):
    """Message model"""
    id: str
    ticket_id: str
    slack_message_id: str
    text: str
    user_id: str
    user_name: str
    channel_id: str
    thread_ts: Optional[str] = None
    message_ts: str
    created_at: datetime


class TicketWithMessages(BaseModel):
    """Ticket with nested messages"""
    ticket: Ticket
    messages: List[Message]

