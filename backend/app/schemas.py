"""Pydantic request/response schemas for the whole API."""
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


# ---------- Auth ----------
class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    age: int | None = Field(default=None, ge=10, le=120)
    phone: str | None = Field(default=None, max_length=40)
    concerns: str = Field(default="", max_length=2000)
    interests: str = Field(default="", max_length=2000)
    description: str = Field(default="", max_length=4000)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    age: int | None = None
    phone: str | None = None
    role: str


class ProfileOut(BaseModel):
    concerns: str = ""
    interests: str = ""
    bio: str = ""
    location: str = ""
    avatar: str = ""


class MeResponse(UserOut):
    profile: ProfileOut = ProfileOut()


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Users ----------
class UpdateMeRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    age: int | None = Field(default=None, ge=10, le=120)
    phone: str | None = Field(default=None, max_length=40)
    concerns: str | None = Field(default=None, max_length=2000)
    interests: str | None = Field(default=None, max_length=2000)
    bio: str | None = Field(default=None, max_length=4000)
    location: str | None = Field(default=None, max_length=120)
    avatar: str | None = Field(default=None, max_length=255)


# ---------- Mood ----------
class MoodCreate(BaseModel):
    mood: str = Field(min_length=1, max_length=60)
    energy_level: int | None = Field(default=None, ge=1, le=10)
    note: str = Field(default="", max_length=2000)
    entry_date: str = Field(default="", max_length=10)
    entry_time: str = Field(default="", max_length=5)

    @field_validator("entry_date")
    @classmethod
    def _date_or_empty(cls, v: str) -> str:
        if v == "":
            return v
        import re

        if not re.match(r"^\d{4}-\d{2}-\d{2}$", v):
            raise ValueError("entry_date must be YYYY-MM-DD")
        return v


class MoodOut(BaseModel):
    id: str
    mood: str
    energy_level: int | None
    note: str
    entry_date: str
    entry_time: str
    created_at: datetime


# ---------- Activities ----------
class ActivityCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    activity_type: str = Field(default="wellness", max_length=60)
    description: str = Field(default="", max_length=2000)
    activity_date: str = Field(min_length=1, max_length=10)
    activity_time: str = Field(default="", max_length=5)
    duration_minutes: int | None = Field(default=None, ge=1, le=1440)


class ActivityOut(BaseModel):
    id: str
    title: str
    activity_type: str
    description: str
    activity_date: str
    activity_time: str
    duration_minutes: int | None
    created_at: datetime


# ---------- Journal ----------
class JournalCreate(BaseModel):
    title: str = Field(default="", max_length=200)
    content: str = Field(min_length=1, max_length=20000)


class JournalOut(BaseModel):
    id: str
    title: str
    content: str
    created_at: datetime
    updated_at: datetime


# ---------- Dashboard ----------
class DashboardResponse(BaseModel):
    mood_trend: list[MoodOut]
    recent_activities: list[ActivityOut]
    total_moods: int
    total_activities: int
    total_journal_entries: int
    total_communities: int
    unread_notifications: int
    avg_energy: float | None = None


# ---------- Communities & posts ----------
class CommunityCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    description: str = Field(default="", max_length=4000)
    category: str = Field(default="health", max_length=60)


class CommunityOut(BaseModel):
    id: str
    name: str
    description: str
    category: str
    member_count: int = 0
    is_joined: bool = False
    created_at: datetime


class PostCreate(BaseModel):
    content: str = Field(min_length=1, max_length=5000)


class PostOut(BaseModel):
    id: str
    community_id: str
    author_id: str
    author_name: str = ""
    content: str
    created_at: datetime


# ---------- Matching ----------
class MatchResult(BaseModel):
    user_id: str
    name: str
    age: int | None = None
    location: str = ""
    interests: str = ""
    compatibility_score: float


# ---------- Messages ----------
class MessageCreate(BaseModel):
    recipient_id: str = Field(min_length=1, max_length=36)
    content: str = Field(min_length=1, max_length=5000)


class MessageOut(BaseModel):
    id: str
    sender_id: str
    recipient_id: str
    content: str
    is_read: bool
    created_at: datetime


class ConversationOut(BaseModel):
    user_id: str
    name: str
    last_message: str
    last_at: datetime
    unread_count: int


# ---------- Notifications ----------
class NotificationOut(BaseModel):
    id: str
    kind: str
    title: str
    body: str
    is_read: bool
    created_at: datetime


# ---------- Reports ----------
class SeverityReportCreate(BaseModel):
    concern_level: str = Field(pattern="^(low|medium|high|urgent)$")
    description: str = Field(min_length=1, max_length=5000)


class SeverityReportOut(BaseModel):
    id: str
    concern_level: str
    description: str
    status: str
    created_at: datetime


# ---------- Admin ----------
class AdminUserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    age: int | None = None
    created_at: datetime
