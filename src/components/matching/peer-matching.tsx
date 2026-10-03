import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, MapPin, Star, Search, Users, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  connectPeer,
  currentUser,
  findMatches,
  getConversation,
  sendMessage,
  type MatchResult,
  type Message,
} from "@/lib/api";

interface Peer {
  id: string;
  name: string;
  initials: string;
  age: number | null;
  location: string;
  interests: string[];
  matchScore: number;
}

function toPeer(m: MatchResult): Peer {
  const interests = m.interests
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const initials = m.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    id: m.user_id,
    name: m.name,
    initials,
    age: m.age,
    location: m.location,
    interests,
    matchScore: m.compatibility_score,
  };
}

export function PeerMatching() {
  // Real peers from the backend matching engine — never hardcoded.
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const myId = currentUser()?.id;
  const pollRef = useRef<number | null>(null);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    try {
      const results = await findMatches();
      setPeers(results.map(toPeer));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load peers");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const loadChat = useCallback(
    async (peerId: string) => {
      setChatLoading(true);
      try {
        const msgs = await getConversation(peerId);
        setChatMessages(msgs);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unable to load conversation");
      }
      setChatLoading(false);
    },
    []
  );

  // Poll for new messages while the chat window is open.
  useEffect(() => {
    if (showChat && selectedPeer) {
      pollRef.current = window.setInterval(() => {
        getConversation(selectedPeer.id)
          .then(setChatMessages)
          .catch(() => undefined);
      }, 3000);
    }
    return () => {
      if (pollRef.current !== null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [showChat, selectedPeer]);

  const handleConnect = async (peerId: string) => {
    setConnectingId(peerId);
    try {
      await connectPeer(peerId);
      setConnectedIds((prev) => new Set(prev).add(peerId));
      toast.success("Connected! You can now chat with this peer.");
      await loadMatches();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to connect");
    }
    setConnectingId(null);
  };

  const handleOpenChat = (peer: Peer) => {
    setSelectedPeer(peer);
    setShowChat(true);
    setChatMessages([]);
    loadChat(peer.id);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedPeer || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(selectedPeer.id, chatInput.trim());
      setChatMessages((prev) => [...prev, msg]);
      setChatInput("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to send message");
    }
    setSending(false);
  };

  const filteredPeers = peers.filter((peer) => {
    const q = search.toLowerCase();
    return (
      peer.name.toLowerCase().includes(q) ||
      peer.interests.some((i) => i.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Find Your Support Network</h2>
          <p className="text-muted-foreground">Connect with peers who understand your journey</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search interests..." className="pl-10 w-64" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Finding peers…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && filteredPeers.length === 0 && (
        <Card className="shadow-soft">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No matching peers found.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peer List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredPeers.map((peer) => (
            <Card
              key={peer.id}
              className={`shadow-soft cursor-pointer transition-smooth hover:shadow-glow ${
                selectedPeer?.id === peer.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPeer(peer)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-wellness text-wellness-foreground">
                        {peer.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{peer.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground space-x-2">
                        {peer.age !== null && <span>{peer.age} years old</span>}
                        {peer.age !== null && peer.location && <span>•</span>}
                        {peer.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {peer.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-semibold text-primary">{peer.matchScore}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {peer.interests.length > 0 && (
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Interests</p>
                      <div className="flex flex-wrap gap-1">
                        {peer.interests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">{peer.matchScore}% compatibility</p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={connectingId === peer.id || connectedIds.has(peer.id)}
                      onClick={e => { e.stopPropagation(); handleConnect(peer.id); }}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {connectedIds.has(peer.id) ? "Connected" : connectingId === peer.id ? "Connecting…" : "Connect"}
                    </Button>
                    <Button size="sm" onClick={e => { e.stopPropagation(); handleOpenChat(peer); }}>
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed View */}
        <div className="space-y-4">
          {selectedPeer ? (
            <Card className="shadow-soft sticky top-20">
              <CardHeader>
                <div className="text-center space-y-4">
                  <div className="relative mx-auto w-20 h-20">
                    <Avatar className="w-20 h-20">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                        {selectedPeer.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedPeer.name}</h3>
                    <p className="text-muted-foreground">
                      {selectedPeer.age !== null && `${selectedPeer.age} years old`}
                      {selectedPeer.age !== null && selectedPeer.location && " • "}
                      {selectedPeer.location}
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="w-5 h-5 fill-primary text-primary" />
                    <span className="text-lg font-bold text-primary">{selectedPeer.matchScore}% Match</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-3">
                  <Button className="w-full shadow-glow" onClick={() => handleOpenChat(selectedPeer)}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Conversation
                  </Button>
                  <div className="w-full text-center py-2 rounded border mt-2">
                    {connectedIds.has(selectedPeer.id) ? (
                      <span className="text-green-600 font-medium">You are connected to this user.</span>
                    ) : (
                      <span className="text-muted-foreground">You are not connected to this user.</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-soft">
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a peer to view their profile</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {/* Chat Modal */}
      {showChat && selectedPeer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button className="absolute top-2 right-2 text-muted-foreground" onClick={() => setShowChat(false)} title="Close chat">
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                  {selectedPeer.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-lg text-primary">{selectedPeer.name}</div>
                <div className="text-xs text-muted-foreground">Chat</div>
              </div>
            </div>
            <div className="h-64 overflow-y-auto border rounded p-3 mb-3 bg-muted/20">
              {chatLoading && (
                <div className="text-muted-foreground text-sm text-center mt-20">Loading conversation…</div>
              )}
              {!chatLoading && chatMessages.length === 0 && (
                <div className="text-muted-foreground text-sm text-center mt-20">No messages yet. Say hello!</div>
              )}
              {chatMessages.map((msg) => {
                const mine = msg.sender_id === myId;
                return (
                  <div key={msg.id} className={`mb-2 flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`px-3 py-2 rounded-lg max-w-[70%] ${mine ? "bg-primary text-white" : "bg-white border"}`}>
                      <span className="text-sm">{msg.content}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
              />
              <Button onClick={handleSendMessage} disabled={!chatInput.trim() || sending}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
