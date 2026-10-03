import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { listCommunities, listPosts, type Post } from "@/lib/api";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function SocialFeed() {
  // Real posts aggregated from the communities the user has joined.
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const communities = await listCommunities();
        const joined = communities.filter((c) => c.is_joined);
        const all: Post[] = [];
        for (const c of joined) {
          const p = await listPosts(c.id);
          all.push(...p);
        }
        all.sort((a, b) => b.created_at.localeCompare(a.created_at));
        if (!cancelled) {
          setPosts(all.slice(0, 50));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load feed");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading community feed…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (posts.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            No posts yet. Join a community and start the conversation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="shadow-soft hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-wellness text-wellness-foreground">
                      {initialsOf(post.author_name || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{post.author_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground leading-relaxed">{post.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}