import { Users, MessageCircle, Heart, BookOpen, Briefcase, Home, Plus, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  createCommunity,
  createPost,
  joinCommunity,
  listCommunities,
  listPosts,
  type Community as ApiCommunity,
  type Post as ApiPost,
} from "@/lib/api";

const categoryLabels: Record<string, string> = {
  health: "Health & Wellness",
  education: "Education",
  family: "Family & Relationships",
  career: "Career & Work",
  wellness: "Wellness",
  support: "Support",
};

// Presentational icon/color per category (client-side styling only).
function categoryStyle(category: string): { icon: typeof Heart; color: string } {
  switch (category) {
    case "education":
      return { icon: BookOpen, color: "bg-gradient-primary" };
    case "family":
      return { icon: Home, color: "bg-accent" };
    case "career":
      return { icon: Briefcase, color: "bg-warning" };
    default:
      return { icon: Heart, color: "bg-gradient-wellness" };
  }
}

export function CommunitiesSection() {
  // Real communities from PostgreSQL — never hardcoded.
  const [communities, setCommunities] = useState<ApiCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [newCommunity, setNewCommunity] = useState({ name: "", issue: "", category: "health" });
  const [search, setSearch] = useState("");
  const [discussionCommunity, setDiscussionCommunity] = useState<ApiCommunity | null>(null);
  const [discussionPosts, setDiscussionPosts] = useState<ApiPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [discussionInput, setDiscussionInput] = useState("");
  const [sending, setSending] = useState(false);

  // Lottie animation for top of section
  const lottieRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!document.querySelector('script[src*="dotlottie-wc"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.6.2/dist/dotlottie-wc.js";
      document.body.appendChild(script);
    }
    if (lottieRef.current) {
      lottieRef.current.innerHTML = '';
      const lottie = document.createElement('dotlottie-wc');
      lottie.setAttribute('src', 'https://lottie.host/b5f84b6f-a67c-4d68-9afa-198f817143bf/680y4IN5t0.lottie');
      lottie.setAttribute('style', 'width: 300px; height: 300px;');
      lottie.setAttribute('speed', '1');
      lottie.setAttribute('autoplay', '');
      lottie.setAttribute('loop', '');
      lottieRef.current.appendChild(lottie);
    }
  }, []);

  const loadCommunities = async () => {
    try {
      const list = await listCommunities();
      setCommunities(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load communities");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  const handleJoin = async (id: string) => {
    setJoiningId(id);
    try {
      await joinCommunity(id);
      await loadCommunities();
      toast.success("You joined the community!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to join community");
    }
    setJoiningId(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createCommunity({
        name: newCommunity.name,
        description: newCommunity.issue,
        category: newCommunity.category,
      });
      setShowCreate(false);
      setNewCommunity({ name: "", issue: "", category: "health" });
      await loadCommunities();
      toast.success("Community created!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create community");
    }
    setCreating(false);
  };

  const openDiscussion = async (community: ApiCommunity) => {
    setDiscussionCommunity(community);
    setDiscussionPosts([]);
    setPostsLoading(true);
    try {
      const posts = await listPosts(community.id);
      setDiscussionPosts(posts);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load posts");
    }
    setPostsLoading(false);
  };

  const handleSendDiscussion = async (id: string) => {
    if (!discussionInput.trim() || sending) return;
    setSending(true);
    try {
      const post = await createPost(id, discussionInput.trim());
      setDiscussionPosts((prev) => [post, ...prev]);
      setDiscussionInput("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to post");
    }
    setSending(false);
  };

  const groupedCommunities = communities
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase()))
    .reduce((acc, community) => {
      if (!acc[community.category]) {
        acc[community.category] = [];
      }
      acc[community.category].push(community);
      return acc;
    }, {} as Record<string, ApiCommunity[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center mb-2 gap-2">
        <h2 className="text-3xl font-bold text-primary font-kalam">Communities</h2>
        <p className="text-muted-foreground text-lg mb-2">Join supportive groups that understand your journey</p>
        <div className="flex flex-col md:flex-row gap-2 items-center w-full justify-center">
          <Input
            placeholder="Find your Blooming circle"
            className="w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button className="shadow-glow" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Community
          </Button>
        </div>
        <div ref={lottieRef} className="flex justify-center mt-4" />
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create a New Community</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              placeholder="Community Name"
              value={newCommunity.name}
              onChange={e => setNewCommunity({ ...newCommunity, name: e.target.value })}
              required
            />
            <Input
              placeholder="What issue does this community address?"
              value={newCommunity.issue}
              onChange={e => setNewCommunity({ ...newCommunity, issue: e.target.value })}
              required
            />
            <select
              className="w-full border rounded px-3 py-2"
              value={newCommunity.category}
              onChange={e => setNewCommunity({ ...newCommunity, category: e.target.value })}
              title="Select community category"
            >
              <option value="health">Health & Wellness</option>
              <option value="education">Education</option>
              <option value="family">Family & Relationships</option>
              <option value="career">Career & Work</option>
            </select>
            <Button type="submit" className="w-full bg-primary text-white" disabled={creating}>
              {creating ? "Creating…" : "Create"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {loading && <p className="text-sm text-muted-foreground text-center">Loading communities…</p>}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      {!loading && !error && communities.length === 0 && (
        <Card className="shadow-soft">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No communities yet. Create the first one!</p>
          </CardContent>
        </Card>
      )}

      {Object.entries(groupedCommunities).map(([category, communitiesInCategory]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {categoryLabels[category] ?? category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {communitiesInCategory.map((community) => {
              const style = categoryStyle(community.category);
              const Icon = style.icon;
              return (
              <Card key={community.id} className="shadow-soft hover:shadow-glow transition-smooth">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${style.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{community.name}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {community.member_count} members
                          </span>
                        </div>
                      </div>
                    </div>
                    {community.is_joined && (
                      <Badge className="bg-success text-success-foreground">Joined</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    {community.description}
                  </p>

                  <div className="flex space-x-2">
                    {community.is_joined ? (
                      <Button size="sm" className="flex-1" onClick={() => openDiscussion(community)}>
                        <MessageCircle className="w-4 h-4 mr-1" />
                        View Discussions
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full shadow-glow"
                        disabled={joiningId === community.id}
                        onClick={() => handleJoin(community.id)}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        {joiningId === community.id ? "Joining…" : "Join Community"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>
      ))}
      {/* Discussion Panel */}
      {discussionCommunity && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative flex flex-col h-[70vh]">
            <button className="absolute top-2 right-2 text-muted-foreground" onClick={() => setDiscussionCommunity(null)} title="Close discussion">
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div>
                <div className="font-bold text-lg text-primary">{discussionCommunity.name}</div>
                <div className="text-xs text-muted-foreground">Discussions</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 mb-3 bg-muted/20 rounded">
              {postsLoading && (
                <div className="text-muted-foreground text-sm text-center mt-20">Loading posts…</div>
              )}
              {!postsLoading && discussionPosts.length === 0 && (
                <div className="text-muted-foreground text-sm text-center mt-20">No posts yet. Start the conversation!</div>
              )}
              {discussionPosts.map((post) => (
                <div key={post.id} className="mb-3 bg-white border rounded-lg px-3 py-2">
                  <div className="text-xs font-medium text-primary mb-1">{post.author_name}</div>
                  <div className="text-sm">{post.content}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(post.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Input
                value={discussionInput}
                onChange={e => setDiscussionInput(e.target.value)}
                placeholder="Share something with the community..."
                onKeyDown={e => { if (e.key === 'Enter') handleSendDiscussion(discussionCommunity.id); }}
              />
              <Button onClick={() => handleSendDiscussion(discussionCommunity.id)} disabled={!discussionInput.trim() || sending}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
