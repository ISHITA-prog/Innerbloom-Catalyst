"""Severity/concern reports: users submit; admins review. Neutral, non-diagnostic."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import schemas
from app.core.dependencies import get_current_user
from app.db import models
from app.db.database import get_db

router = APIRouter(tags=["reports"])


@router.post("/api/reports/severity", response_model=schemas.SeverityReportOut,
             status_code=status.HTTP_201_CREATED,
             summary="Submit a concern report (support request, not a diagnosis)")
def submit_report(payload: schemas.SeverityReportCreate,
                  current: models.User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    report = models.SeverityReport(reporter_id=current.id,
                                   concern_level=payload.concern_level,
                                   description=payload.description.strip(), status="open")
    db.add(report)
    db.commit()
    db.refresh(report)
    return schemas.SeverityReportOut(id=report.id, concern_level=report.concern_level,
                                     description=report.description, status=report.status,
                                     created_at=report.created_at)


@router.get("/api/reports/mine", response_model=list[schemas.SeverityReportOut],
            summary="My submitted reports")
def my_reports(current: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (db.query(models.SeverityReport).filter_by(reporter_id=current.id)
            .order_by(models.SeverityReport.created_at.desc()).all())
    return [schemas.SeverityReportOut(id=r.id, concern_level=r.concern_level,
                                      description=r.description, status=r.status,
                                      created_at=r.created_at) for r in rows]
