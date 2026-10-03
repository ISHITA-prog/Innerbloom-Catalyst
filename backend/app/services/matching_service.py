"""Deterministic weighted peer matching (no ML — replaceable later).

Weights: 40% interests, 30% support preferences (concerns),
         20% shared communities, 10% other attributes (location/age closeness).
Private data (journal, mood notes) is never used.
"""
from sqlalchemy.orm import Session

from app.db import models


def _tokens(text: str) -> set[str]:
    return {t.strip().lower() for t in (text or "").replace(";", ",").split(",") if t.strip()}


def _jaccard(a: set[str], b: set[str]) -> float:
    if not a and not b:
        return 0.0
    union = a | b
    if not union:
        return 0.0
    return len(a & b) / len(union)


def compatibility(
    me: models.User,
    me_profile: models.UserProfile | None,
    other: models.User,
    other_profile: models.UserProfile | None,
    my_community_ids: set[str],
    other_community_ids: set[str],
) -> float:
    me_p = me_profile
    ot_p = other_profile
    interests = _jaccard(_tokens(me_p.interests if me_p else ""), _tokens(ot_p.interests if ot_p else ""))
    concerns = _jaccard(_tokens(me_p.concerns if me_p else ""), _tokens(ot_p.concerns if ot_p else ""))
    if my_community_ids or other_community_ids:
        shared = len(my_community_ids & other_community_ids)
        total = max(len(my_community_ids | other_community_ids), 1)
        communities = shared / total
    else:
        communities = 0.0
    other_score = 0.0
    if me_p and ot_p and me_p.location and ot_p.location:
        other_score += 0.5 if me_p.location.strip().lower() == ot_p.location.strip().lower() else 0.0
    if me.age and other.age and abs(me.age - other.age) <= 5:
        other_score += 0.5
    score = 0.40 * interests + 0.30 * concerns + 0.20 * communities + 0.10 * other_score
    return round(score * 100, 1)


def find_matches(db: Session, me: models.User, limit: int = 20) -> list[dict]:
    me_profile = db.query(models.UserProfile).filter_by(user_id=me.id).first()
    my_rows = db.query(models.CommunityMember).filter_by(user_id=me.id).all()
    my_communities = {r.community_id for r in my_rows}
    connected_ids: set[str] = set()
    for c in db.query(models.PeerConnection).filter_by(requester_id=me.id).all():
        connected_ids.add(c.peer_id)
    for c in db.query(models.PeerConnection).filter_by(peer_id=me.id).all():
        connected_ids.add(c.requester_id)

    results: list[dict] = []
    others = db.query(models.User).filter(models.User.id != me.id).all()
    for other in others:
        if other.id in connected_ids:
            continue
        other_profile = db.query(models.UserProfile).filter_by(user_id=other.id).first()
        other_rows = db.query(models.CommunityMember).filter_by(user_id=other.id).all()
        score = compatibility(
            me, me_profile, other, other_profile,
            my_communities, {r.community_id for r in other_rows},
        )
        results.append(
            {
                "user_id": other.id,
                "name": other.name,
                "age": other.age,
                "location": other_profile.location if other_profile else "",
                "interests": other_profile.interests if other_profile else "",
                "compatibility_score": score,
            }
        )
    results.sort(key=lambda r: r["compatibility_score"], reverse=True)
    return results[:limit]
