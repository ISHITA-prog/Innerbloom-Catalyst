import { useCallback, useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { api, type Community } from "@/lib/api";

interface AdminReport {
  id: string;
  concern_level: string;
  description: string;
  status: string;
  created_at: string;
}

export function AdminPanel() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [r, c] = await Promise.all([
        api<AdminReport[]>("/api/admin/reports"),
        api<Community[]>("/api/communities"),
      ]);
      setReports(r);
      setCommunities(c);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin data");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (id: string, status: string) => {
    try {
      await api(`/api/admin/reports/${id}?new_status=${status}`, { method: "PUT" });
      await load();
      toast.success("Report updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update report");
    }
  };

  const handleDeleteCommunity = async (id: string, name: string) => {
    if (!window.confirm(`Delete community "${name}"?`)) return;
    try {
      await api(`/api/admin/communities/${id}`, { method: "DELETE" });
      await load();
      toast.success("Community deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete community");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-primary" />
          Admin
        </h2>
        <p className="text-muted-foreground">Review support requests and manage communities</p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Support Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 && (
                <p className="text-sm text-muted-foreground">No reports submitted yet.</p>
              )}
              <div className="space-y-2">
                {reports.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Level: {r.concern_level}</span>
                      <span className="text-xs text-muted-foreground">
                        {r.status} • {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{r.description}</p>
                    <div className="flex gap-2">
                      {(["open", "reviewed", "resolved"] as const).map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={r.status === s ? "default" : "outline"}
                          onClick={() => handleStatus(r.id, s)}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Communities</CardTitle>
            </CardHeader>
            <CardContent>
              {communities.length === 0 && (
                <p className="text-sm text-muted-foreground">No communities yet.</p>
              )}
              <div className="space-y-2">
                {communities.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.member_count} members • {c.category}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteCommunity(c.id, c.name)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
