// Minimal API layer for the FastAPI backend.
// Base URL comes from VITE_API_BASE_URL (defaults to local backend).
// Auth token (JWT) is stored in localStorage under "innerbloom_token".

const BASE: string =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL ??
  "http://localhost:8000";

const TOKEN_KEY = "innerbloom_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function logout() {
  setToken(null);
  try {
    localStorage.removeItem("innerbloom_user");
  } catch {
    /* ignore */
  }
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.auth !== false) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new Error("Unable to connect to the server. Is the backend running?");
  }
  if (res.status === 401) {
    // Session expired/invalid — clear local auth so guards redirect to login.
    logout();
  }
  if (!res.ok) {
    throw new Error(await toErrorMessage(res));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Backend error bodies vary: {"detail": "msg"} for most errors but
// {"detail": [{loc, msg, ...}]} for 422 validation errors. Always reduce to a
// readable string — never leak "[object Object]" into the UI.
async function toErrorMessage(res: Response): Promise<string> {
  const fallback = `Request failed (${res.status})`;
  try {
    const data: unknown = await res.json();
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      const detail = (data as { detail?: unknown }).detail;
      if (typeof detail === "string" && detail) return detail;
      if (Array.isArray(detail)) {
        const msgs = detail
          .map((d) =>
            typeof d === "string"
              ? d
              : d && typeof d === "object"
                ? String((d as { msg?: unknown }).msg ?? "")
                : ""
          )
          .filter(Boolean);
        if (msgs.length > 0) return msgs.join("; ");
      }
      if (detail && typeof detail === "object") return JSON.stringify(detail);
    }
  } catch {
    /* fall through to status-based message */
  }
  if (res.status === 401) return "Invalid email or password";
  if (res.status === 403) return "You are not authorized to perform this action.";
  if (res.status === 404) return "Not found.";
  if (res.status === 409) return "An account with this email already exists.";
  return fallback;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  age?: number | null;
  phone?: string | null;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  age?: number;
  phone?: string;
  concerns?: string;
  interests?: string;
  description?: string;
}): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
    auth: false,
  });
  setToken(data.access_token);
  try {
    localStorage.setItem("innerbloom_user", JSON.stringify(data.user));
  } catch {
    /* ignore */
  }
  return data;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setToken(data.access_token);
  try {
    localStorage.setItem("innerbloom_user", JSON.stringify(data.user));
  } catch {
    /* ignore */
  }
  return data;
}

export function chatWebSocketUrl(): string {
  const token = getToken() ?? "";
  const wsBase = BASE.replace(/^http/, "ws");
  return `${wsBase}/ws/chat?token=${encodeURIComponent(token)}`;
}

export function currentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("innerbloom_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}

// ---------- Profile ----------
export interface Profile {
  concerns: string;
  interests: string;
  bio: string;
  location: string;
  avatar: string;
}

export interface MeResponse extends AuthUser {
  profile: Profile;
}

export const getMe = () => api<MeResponse>("/api/users/me");

export const updateMe = (payload: {
  name?: string;
  age?: number;
  phone?: string;
  concerns?: string;
  interests?: string;
  bio?: string;
  location?: string;
}) => api<MeResponse>("/api/users/me", { method: "PUT", body: payload });

// ---------- Dashboard ----------
export interface MoodEntry {
  id: string;
  mood: string;
  energy_level: number | null;
  note: string;
  entry_date: string;
  entry_time: string;
  created_at: string;
}

export interface ActivityEntry {
  id: string;
  title: string;
  activity_type: string;
  description: string;
  activity_date: string;
  activity_time: string;
  duration_minutes: number | null;
  created_at: string;
}

export interface DashboardData {
  mood_trend: MoodEntry[];
  recent_activities: ActivityEntry[];
  total_moods: number;
  total_activities: number;
  total_journal_entries: number;
  total_communities: number;
  unread_notifications: number;
  avg_energy: number | null;
}

export const getDashboard = () => api<DashboardData>("/api/dashboard");

// ---------- Mood & activities ----------
export const createMood = (payload: {
  mood: string;
  energy_level?: number;
  note?: string;
  entry_date?: string;
  entry_time?: string;
}) => api<MoodEntry>("/api/mood", { method: "POST", body: payload });

export const moodHistory = (limit = 100) =>
  api<MoodEntry[]>(`/api/mood/history?limit=${limit}`);

export const createActivity = (payload: {
  title: string;
  activity_type?: string;
  description?: string;
  activity_date: string;
  activity_time?: string;
  duration_minutes?: number;
}) => api<ActivityEntry>("/api/activities", { method: "POST", body: payload });

export const listActivities = (limit = 100) =>
  api<ActivityEntry[]>(`/api/activities?limit=${limit}`);

// ---------- Journal ----------
export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const createJournal = (payload: { title?: string; content: string }) =>
  api<JournalEntry>("/api/journal", { method: "POST", body: payload });

export const listJournal = (limit = 100) =>
  api<JournalEntry[]>(`/api/journal?limit=${limit}`);

// ---------- Matching & connections ----------
export interface MatchResult {
  user_id: string;
  name: string;
  age: number | null;
  location: string;
  interests: string;
  compatibility_score: number;
}

export const findMatches = (limit = 20) =>
  api<MatchResult[]>(`/api/matching/find?limit=${limit}`, { method: "POST" });

export const connectPeer = (peerId: string) =>
  api<{ message: string }>(`/api/matching/connect/${peerId}`, { method: "POST" });

// ---------- Communities & posts ----------
export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  is_joined: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  community_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export const listCommunities = () => api<Community[]>("/api/communities");

export const createCommunity = (payload: { name: string; description?: string; category?: string }) =>
  api<Community>("/api/communities", { method: "POST", body: payload });

export const joinCommunity = (id: string) =>
  api<{ message: string }>(`/api/communities/${id}/join`, { method: "POST" });

export const listPosts = (communityId: string) =>
  api<Post[]>(`/api/communities/${communityId}/posts`);

export const createPost = (communityId: string, content: string) =>
  api<Post>(`/api/communities/${communityId}/posts`, { method: "POST", body: { content } });

// ---------- Messaging ----------
export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  user_id: string;
  name: string;
  last_message: string;
  last_at: string;
  unread_count: number;
}

export const listConversations = () => api<Conversation[]>("/api/conversations");

export const getConversation = (userId: string) =>
  api<Message[]>(`/api/messages/${userId}`);

export const sendMessage = (recipientId: string, content: string) =>
  api<Message>("/api/messages", { method: "POST", body: { recipient_id: recipientId, content } });

// ---------- Notifications ----------
export interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export const listNotifications = () => api<Notification[]>("/api/notifications");

export const markNotificationRead = (id: string) =>
  api<Notification>(`/api/notifications/${id}/read`, { method: "PUT" });

// ---------- Reports ----------
export const submitReport = (payload: { concern_level: string; description: string }) =>
  api<{ id: string; concern_level: string; description: string; status: string; created_at: string }>(
    "/api/reports/severity",
    { method: "POST", body: payload }
  );

export { BASE as API_BASE_URL };
