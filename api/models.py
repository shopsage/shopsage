"""SQLModel database models for ShopSage account system."""

import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _new_id() -> str:
    return uuid.uuid4().hex


class User(SQLModel, table=True):
    id: str = Field(default_factory=_new_id, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    display_name: str = ""
    preferences: str = "{}"  # JSON string, expandable
    created_at: datetime = Field(default_factory=_utcnow)

    chats: List["Chat"] = Relationship(back_populates="user")
    saved_products: List["SavedProduct"] = Relationship(back_populates="user")


class Chat(SQLModel, table=True):
    id: str = Field(default_factory=_new_id, primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    title: str = "New Chat"
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)

    user: Optional[User] = Relationship(back_populates="chats")
    messages: List["ChatMessage"] = Relationship(back_populates="chat", cascade_delete=True)


class ChatMessage(SQLModel, table=True):
    __tablename__ = "chatmessage"

    id: str = Field(default_factory=_new_id, primary_key=True)
    chat_id: str = Field(foreign_key="chat.id")
    role: str  # "user" or "assistant"
    content_json: str = "[]"  # Full MessageContent[] as JSON — for UI rendering
    plain_text: str = ""  # Stripped text — for LLM context
    created_at: datetime = Field(default_factory=_utcnow)

    chat: Optional[Chat] = Relationship(back_populates="messages")


class SavedProduct(SQLModel, table=True):
    __tablename__ = "savedproduct"

    id: str = Field(default_factory=_new_id, primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    product_name: str
    cheapest_price: Optional[float] = None
    image: Optional[str] = None
    last_searched_at: datetime = Field(default_factory=_utcnow)
    created_at: datetime = Field(default_factory=_utcnow)

    user: Optional[User] = Relationship(back_populates="saved_products")
