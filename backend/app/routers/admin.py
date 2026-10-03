"""Admin-only endpoints. Every route requires role == admin."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.core.dependencies import require_admin
from app.db import models
from app.db.database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/reports", response_model=list[schemas.SeverityReportOut],
            summary="Review all concern reports (admin)")
def all_reports(admin: models.User = Depends(require_admin), db: Session = Depends(get_db)):
    rows = db.query(models.SeverityReport).order_by(
        models.SeverityReport.created_at.desc()).limit(200).all()
    return [schemas.SeverityReportOut(id=r.id, concern_level=r.concern_level,
                                      description=r.description, status=r.status,
                                      created_at=r.created_at) for r in rows]


@router.put("/reports/{report_id}", response_model=schemas.SeverityReportOut,
            summary="Update a report status (admin)")
def update_report(report_id: str, new_status: str,
                  admin: models.User = Depends(require_admin), db: Session = Depends(get_db)):
    if new_status not in ("open", "reviewed", "resolved"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")
    report = db.query(models.SeverityReport).filter_by(id=report_id).first()
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    report.status = new_status
    db.commit()
    db.refresh(report)
    return schemas.SeverityReportOut(id=report.id, concern_level=report.concern_level,
                                     description=report.description, status=report.status,
                                     created_at=report.created_at)


@router.post("/communities", status_code=status.HTTP_201_CREATED,
             summary="Create a community (admin)")
def admin_create_community(payload: schemas.CommunityCreate,
                           admin: models.User = Depends(require_admin),
                           db: Session = Depends(get_db)):
    if db.query(models.Community).filter_by(name=payload.name.strip()).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Community name already exists")
    community = models.Community(name=payload.name.strip(), description=payload.description,
                                 category=payload.category.strip(), created_by=admin.id)
    db.add(community)
    db.commit()
    db.refresh(community)
    return {"id": community.id, "name": community.name}


@router.put("/communities/{community_id}", summary="Update a community (admin)")
def admin_update_community(community_id: str, payload: schemas.CommunityCreate,
                           admin: models.User = Depends(require_admin),
                           db: Session = Depends(get_db)):
    community = db.query(models.Community).filter_by(id=community_id).first()
    if community is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community not found")
    community.name = payload.name.strip()
    community.description = payload.description
    community.category = payload.category.strip()
    db.commit()
    return {"message": "Community updated"}


@router.delete("/communities/{community_id}", summary="Delete a community (admin)")
def admin_delete_community(community_id: str, admin: models.User = Depends(require_admin),
                           db: Session = Depends(get_db)):
    community = db.query(models.Community).filter_by(id=community_id).first()
    if community is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community not found")
    db.delete(community)
    db.commit()
    return {"message": "Community deleted"}


@router.get("/users", response_model=list[schemas.AdminUserOut],
            summary="List users (admin, no private wellness data)")
def list_users(admin: models.User = Depends(require_admin), db: Session = Depends(get_db)):
    return [schemas.AdminUserOut(id=u.id, name=u.name, email=u.email, role=u.role,
                                 age=u.age, created_at=u.created_at)
            for u in db.query(models.User).limit(200).all()]
