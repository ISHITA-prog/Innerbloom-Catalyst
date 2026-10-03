import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { listNotifications, markNotificationRead, type Notification } from "@/lib/api";

export function NotificationsPanel() {
  const [notes, setNotes] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setNotes(await listNotifications());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load notifications");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update notification");
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && notes.length === 0 && (
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        )}
        <div className="space-y-2">
          {notes.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${
                n.is_read ? "bg-muted/30" : "bg-primary/5"
              }`}
            >
              <div>
                <p className="text-sm font-medium">{n.title}</p>
                {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
              {!n.is_read && (
                <Button size="sm" variant="outline" onClick={() => handleMarkRead(n.id)}>
                  Mark read
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
