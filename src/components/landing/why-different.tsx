import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Brain, Shield, Gamepad2, Activity, Users } from "lucide-react";

const competitors = [
  { name: "7 Cups", features: [false, true, false, false, false] },
  { name: "TalkLife", features: [false, true, true, false, false] },
  { name: "Discord", features: [false, false, true, false, false] }
];

const ourFeatures = [
  {
    icon: Brain,
    title: "AI Matching Based on Mood & Experience",
    description: "Smart algorithms connect you with peers who've been through similar experiences"
  },
  {
    icon: Shield,
    title: "Anonymity + Real Safety Tools",
    description: "Stay anonymous while having access to crisis intervention and professional support"
  },
  {
    icon: Gamepad2,
    title: "Activities like Games, Journaling, and Runs",
    description: "Engage in meaningful activities together, from virtual games to guided journaling"
  },
  {
    icon: Activity,
    title: "Real-Time Emotional Monitoring",
    description: "Track your emotional journey with intelligent insights and personalized recommendations"
  },
  {
    icon: Users,
    title: "Support from Verified Interns",
    description: "Access to psychology interns and mental health professionals when you need expert guidance"
  }
];

export const WhyDifferent = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-primary/10 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-primary/30 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-primary/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-primary/15 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why We're <span className="text-primary font-kalam">Different</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how InnerBloom compares to other mental health platforms
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mb-16 overflow-x-auto">
          <div className="glass rounded-2xl p-8 min-w-[800px]">
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="text-lg font-semibold text-foreground">Features</div>
              <div className="text-center">
                <Badge variant="default" className="bg-primary text-foreground font-kalam">
                  InnerBloom
                </Badge>
              </div>
              {competitors.map((comp) => (
                <div key={comp.name} className="text-center text-muted-foreground">
                  {comp.name}
                </div>
              ))}
            </div>

            {ourFeatures.map((feature, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 py-4 border-b border-primary/10 last:border-b-0">
                <div className="text-foreground font-medium">{feature.title}</div>
                <div className="flex justify-center">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                {competitors.map((comp, compIndex) => (
                  <div key={compIndex} className="flex justify-center">
                    {comp.features[index] ? (
                      <CheckCircle className="w-6 h-6 text-muted-foreground/50" />
                    ) : (
                      <X className="w-6 h-6 text-destructive/50" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Feature Details */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ourFeatures.map((feature, index) => (
            <Card key={index} className="glass border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};