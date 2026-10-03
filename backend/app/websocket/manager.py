"""Native FastAPI WebSocket connection manager (no Socket.IO)."""
from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, user_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active[user_id].add(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket) -> None:
        conns = self.active.get(user_id)
        if conns and websocket in conns:
            conns.remove(websocket)
        if conns is not None and not conns:
            self.active.pop(user_id, None)

    async def send_to(self, user_id: str, payload: dict) -> bool:
        """Return True if delivered to at least one live socket."""
        conns = list(self.active.get(user_id, set()))
        if not conns:
            return False
        delivered = False
        for ws in conns:
            try:
                await ws.send_json(payload)
                delivered = True
            except Exception:
                continue
        return delivered

    def is_online(self, user_id: str) -> bool:
        return bool(self.active.get(user_id))


manager = ConnectionManager()
