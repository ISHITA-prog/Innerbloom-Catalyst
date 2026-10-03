"""Create notifications (DB rows). Delivery over WebSocket is best-effort."""
from sqlalchemy.orm import Session

from app.db import models


def create_notification(db: Session, user_id: str, kind: str, title: str, body: str = "") -> models.Notification:
    note = models.Notification(user_id=user_id, kind=kind, title=title, body=body)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
