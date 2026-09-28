from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class IntentionIn(BaseModel):
    text: str = Field(min_length=1, max_length=200)

class IntentionUpdate(BaseModel):
    achieved: str = Field(pattern="^(Yes|Partially|No)$")

class FocusIn(BaseModel):
    task: str = Field(min_length=1, max_length=200)
    planned_minutes: int = Field(default=25, ge=1, le=240)

class FocusCompleteIn(BaseModel):
    actual_minutes: int = Field(ge=0, le=600)
    completed: bool = True

class CognitiveIn(BaseModel):
    task_type: str = Field(min_length=1, max_length=50)
    accuracy: float = Field(ge=0, le=100)
    reaction_ms: float | None = Field(default=None, ge=0)

class MusicIn(BaseModel):
    track: str
    category: str
    minutes: int = Field(default=0, ge=0, le=600)

class MoodIn(BaseModel):
    mood: str = Field(min_length=1, max_length=30)

class JournalIn(BaseModel):
    content: str = Field(min_length=1, max_length=10000)

class WellnessIn(BaseModel):
    mode: str
    minutes: int = Field(default=0, ge=0, le=600)

class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
