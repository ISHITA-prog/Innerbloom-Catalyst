"""End-to-end API tests with FastAPI TestClient (SQLite in-memory/file)."""
import os
import sys

os.environ["DATABASE_URL"] = "sqlite:///./test_innerbloom.db"
for var in ("JWT_SECRET_KEY",):
    os.environ.setdefault(var, "test-secret-key")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient

from app.db.database import Base, engine
from app.main import app, on_startup

client = TestClient(app, raise_server_exceptions=False)


@pytest.fixture(autouse=True)
def fresh_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    on_startup()  # TestClient skips lifespan; run startup seed explicitly
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_innerbloom.db"):
        try:
            os.remove("./test_innerbloom.db")
        except OSError:
            pass


def register(email="a@test.com", password="Pass1234", name="User A"):
    r = client.post("/api/auth/register", json={
        "name": name, "email": email, "password": password,
        "age": 22, "concerns": "Stress", "interests": "Music, Reading", "description": "Hi",
    })
    assert r.status_code == 201, r.text
    return r.json()


def login(email="a@test.com", password="Pass1234"):
    r = client.post("/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_register_login_and_me():
    reg = register()
    token = reg["access_token"]
    assert reg["user"]["email"] == "a@test.com"
    me = client.get("/api/users/me", headers=auth(token))
    assert me.status_code == 200
    assert me.json()["profile"]["interests"] == "Music, Reading"


def test_duplicate_register_409():
    register()
    r = client.post("/api/auth/register", json={
        "name": "Dup", "email": "a@test.com", "password": "Pass1234"})
    assert r.status_code == 409


def test_invalid_login_401():
    register()
    r = client.post("/api/auth/login", json={"email": "a@test.com", "password": "Wrong1234"})
    assert r.status_code == 401


def test_protected_route_no_token_401():
    assert client.get("/api/users/me").status_code in (401, 403)


def test_update_profile():
    token = register()["access_token"]
    r = client.put("/api/users/me", headers=auth(token),
                   json={"location": "Pune", "interests": "Yoga, Music"})
    assert r.status_code == 200
    assert r.json()["profile"]["location"] == "Pune"


def test_mood_crud_and_privacy():
    a = register("a@test.com")
    b = register("b@test.com", name="User B")
    r = client.post("/api/mood", headers=auth(a["access_token"]),
                    json={"mood": "Happy", "energy_level": 8, "note": "good day"})
    assert r.status_code == 201
    hist_b = client.get("/api/mood/history", headers=auth(b["access_token"]))
    assert hist_b.status_code == 200 and hist_b.json() == []
    # invalid energy rejected
    bad = client.post("/api/mood", headers=auth(a["access_token"]),
                      json={"mood": "Sad", "energy_level": 99})
    assert bad.status_code == 422


def test_activities_and_journal_privacy():
    a = register("a@test.com")
    b = register("b@test.com", name="User B")
    r = client.post("/api/activities", headers=auth(a["access_token"]),
                    json={"title": "Meditation", "activity_type": "meditation",
                          "activity_date": "2026-09-10", "duration_minutes": 15})
    assert r.status_code == 201
    j = client.post("/api/journal", headers=auth(a["access_token"]),
                    json={"title": "Day 1", "content": "private thoughts"})
    assert j.status_code == 201
    assert client.get("/api/journal", headers=auth(b["access_token"])).json() == []
    # B cannot fetch A's entry by id
    r2 = client.get(f"/api/journal/{j.json()['id']}", headers=auth(b["access_token"]))
    assert r2.status_code == 404


def test_dashboard():
    a = register("a@test.com")
    client.post("/api/mood", headers=auth(a["access_token"]),
                json={"mood": "Calm", "energy_level": 6})
    d = client.get("/api/dashboard", headers=auth(a["access_token"]))
    assert d.status_code == 200
    assert d.json()["total_moods"] == 1


def test_matching_excludes_self():
    a = register("a@test.com")
    b = register("b@test.com", name="User B")
    r = client.post("/api/matching/find", headers=auth(a["access_token"]))
    assert r.status_code == 200
    ids = [m["user_id"] for m in r.json()]
    assert a["user"]["id"] not in ids and b["user"]["id"] in ids
    assert all(0 <= m["compatibility_score"] <= 100 for m in r.json())


def test_communities_join_post_rules():
    a = register("a@test.com")
    b = register("b@test.com", name="User B")
    comms = client.get("/api/communities", headers=auth(a["access_token"])).json()
    assert len(comms) >= 5
    cid = comms[0]["id"]
    # cannot post before joining
    r = client.post(f"/api/communities/{cid}/posts", headers=auth(a["access_token"]),
                    json={"content": "hello"})
    assert r.status_code == 403
    assert client.post(f"/api/communities/{cid}/join",
                       headers=auth(a["access_token"])).status_code == 200
    p = client.post(f"/api/communities/{cid}/posts", headers=auth(a["access_token"]),
                    json={"content": "hello"})
    assert p.status_code == 201
    assert client.get(f"/api/communities/{cid}/posts",
                      headers=auth(b["access_token"])).status_code == 200


def test_messaging_and_notifications():
    a = register("a@test.com")
    b = register("b@test.com", name="User B")
    m = client.post("/api/messages", headers=auth(a["access_token"]),
                    json={"recipient_id": b["user"]["id"], "content": "Hi there"})
    assert m.status_code == 201
    conv = client.get(f"/api/messages/{a['user']['id']}",
                      headers=auth(b["access_token"]))
    assert conv.status_code == 200 and len(conv.json()) == 1
    notes = client.get("/api/notifications", headers=auth(b["access_token"])).json()
    assert any(n["kind"] == "message" for n in notes)
    nid = notes[0]["id"]
    assert client.put(f"/api/notifications/{nid}/read",
                      headers=auth(b["access_token"])).status_code == 200
    # A cannot mark B's notification
    assert client.put(f"/api/notifications/{nid}/read",
                      headers=auth(a["access_token"])).status_code == 404


def test_reports_and_admin_guard():
    a = register("a@test.com")
    r = client.post("/api/reports/severity", headers=auth(a["access_token"]),
                    json={"concern_level": "high", "description": "Need support"})
    assert r.status_code == 201
    # normal user blocked from admin
    assert client.get("/api/admin/reports", headers=auth(a["access_token"])).status_code == 403
    # bootstrap admin login (created by startup seed)
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@innerbloom.app", "password": "Admin123!"})
    assert admin_login.status_code == 200
    adm_token = admin_login.json()["access_token"]
    reps = client.get("/api/admin/reports", headers=auth(adm_token))
    assert reps.status_code == 200 and len(reps.json()) == 1


def test_admin_reports_flow():
    from app.core import security
    from app.db import models
    from app.db.database import SessionLocal
    register("a@test.com")
    db = SessionLocal()
    adm = models.User(name="Adm", email="adm@test.com",
                      password_hash=security.hash_password("Admin1234"), role="admin")
    db.add(adm)
    db.flush()
    db.add(models.UserProfile(user_id=adm.id))
    db.commit()
    db.close()
    t = client.post("/api/auth/login",
                    json={"email": "adm@test.com", "password": "Admin1234"}).json()["access_token"]
    a = login()
    client.post("/api/reports/severity", headers=auth(a["access_token"]),
                json={"concern_level": "medium", "description": "check"})
    reps = client.get("/api/admin/reports", headers=auth(t))
    assert reps.status_code == 200 and len(reps.json()) == 1


def test_websocket_auth_and_messaging():
    a = register("a@test.com")
    b = register("b@test.com", name="User B")
    # invalid token -> closed
    with pytest.raises(Exception):
        with client.websocket_connect("/ws/chat?token=bad"):
            pass
    with client.websocket_connect(f"/ws/chat?token={a['access_token']}") as wa:
        with client.websocket_connect(f"/ws/chat?token={b['access_token']}") as wb:
            wa.send_json({"recipient_id": b["user"]["id"], "content": "live hi"})
            ack = wa.receive_json()
            assert ack["type"] == "sent"
            incoming = wb.receive_json()
            assert incoming["content"] == "live hi"


def test_conversations_list():
    a = register("a@test.com")
    b = register("b@test.com", name="User B")
    assert client.get("/api/conversations", headers=auth(a["access_token"])).json() == []
    client.post("/api/messages", headers=auth(a["access_token"]),
                json={"recipient_id": b["user"]["id"], "content": "Hello B"})
    convs = client.get("/api/conversations", headers=auth(b["access_token"])).json()
    assert len(convs) == 1
    assert convs[0]["name"] == "User A" and convs[0]["unread_count"] == 1
    # reading the thread marks messages read
    client.get(f"/api/messages/{a['user']['id']}", headers=auth(b["access_token"]))
    convs2 = client.get("/api/conversations", headers=auth(b["access_token"])).json()
    assert convs2[0]["unread_count"] == 0


def test_ai_placeholder():
    r = client.post("/api/ai/wellness")
    assert r.status_code == 200
    assert "not implemented" in r.json()["message"]
