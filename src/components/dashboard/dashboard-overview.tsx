import { Activity, Users, Calendar, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { getDashboard, type DashboardData } from "@/lib/api";

const WELLNESS_TIPS = [
  {
    emoji: "🌸",
    title: "Mindful Breathing",
    description: "Take 5 deep breaths to center yourself.",
    color: "bg-gradient-to-r from-primary/80 to-accent/70 text-white"
  },
  {
    emoji: "🤝",
    title: "Connect with a Peer",
    description: "Reach out to someone in your support network.",
    color: "bg-gradient-to-r from-accent/80 to-primary/60 text-white"
  },
  {
    emoji: "📝",
    title: "Journal Prompt",
    description: "What's one thing you're grateful for today?",
    color: "bg-gradient-to-r from-primary/70 to-pink-300 text-white"
  },
  {
    emoji: "🚶‍♂️",
    title: "Take a Short Walk",
    description: "Move your body for 5 minutes to refresh your mind.",
    color: "bg-gradient-to-r from-green-400 to-primary/70 text-white"
  },
  {
    emoji: "🎧",
    title: "Listen to Music",
    description: "Play your favorite song and enjoy the moment.",
    color: "bg-gradient-to-r from-blue-400 to-primary/80 text-white"
  },
  {
    emoji: "☀️",
    title: "Get Some Sunlight",
    description: "Step outside for a few minutes and soak up some sun.",
    color: "bg-gradient-to-r from-yellow-300 to-primary/70 text-white"
  },
  {
    emoji: "💧",
    title: "Hydrate",
    description: "Drink a glass of water to refresh your body.",
    color: "bg-gradient-to-r from-cyan-400 to-primary/70 text-white"
  },
  {
    emoji: "📚",
    title: "Read a Page",
    description: "Read a page from a book you enjoy.",
    color: "bg-gradient-to-r from-fuchsia-400 to-primary/70 text-white"
  }
];

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Real statistics from the backend — no hardcoded numbers.
  useEffect(() => {
    let cancelled = false;
    getDashboard()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load dashboard");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      title: "Mood Entries",
      value: data ? String(data.total_moods) : "…",
      icon: Activity,
      description: "Moods you have recorded",
      gradient: "bg-gradient-wellness"
    },
    {
      title: "Wellness Activities",
      value: data ? String(data.total_activities) : "…",
      icon: Calendar,
      description: "Activities you have logged",
      gradient: "bg-accent"
    },
    {
      title: "Communities",
      value: data ? String(data.total_communities) : "…",
      icon: Users,
      description: "Communities you joined",
      gradient: "bg-gradient-soft"
    },
    {
      title: "Unread Notifications",
      value: data ? String(data.unread_notifications) : "…",
      icon: MessageCircle,
      description: "Notifications waiting for you",
      gradient: "bg-gradient-soft"
    }
  ];

  // Randomize tip on mount
  const [wellnessTip, setWellnessTip] = useState(WELLNESS_TIPS[0]);
  const [showTipModal, setShowTipModal] = useState(true);
  useEffect(() => {
    const idx = Math.floor(Math.random() * WELLNESS_TIPS.length);
    setWellnessTip(WELLNESS_TIPS[idx]);
    setShowTipModal(true);
  }, []);

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {/* Modal for wellness tip */}
      <Dialog open={showTipModal} onOpenChange={setShowTipModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{wellnessTip.emoji}</span>
              <span>Wellness Tip</span>
            </DialogTitle>
          </DialogHeader>
          <div className={`p-4 rounded-lg ${wellnessTip.color} text-center`}> 
            <p className="text-lg font-semibold">{wellnessTip.title}</p>
            <p className="text-sm mt-2">{wellnessTip.description}</p>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-soft hover:shadow-glow transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.gradient}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Wellness Journey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mood Tracking</span>
                <span>{data ? `${data.total_moods} entries` : "…"}</span>
              </div>
              <Progress value={data ? Math.min(100, data.total_moods * 10) : 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Wellness Activities</span>
                <span>{data ? `${data.total_activities} logged` : "…"}</span>
              </div>
              <Progress value={data ? Math.min(100, data.total_activities * 10) : 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Community Participation</span>
                <span>{data ? `${data.total_communities} joined` : "…"}</span>
              </div>
              <Progress value={data ? Math.min(100, data.total_communities * 20) : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Today's Wellness Tip</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`p-4 rounded-lg ${wellnessTip.color} text-center`}>
              <p className="text-lg font-semibold">{wellnessTip.emoji} {wellnessTip.title}</p>
              <p className="text-xs mt-2">{wellnessTip.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}