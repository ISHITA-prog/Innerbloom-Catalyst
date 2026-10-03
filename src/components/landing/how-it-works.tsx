import { Card, CardContent } from "@/components/ui/card";
import { User, Heart, Users, MessageCircle } from "lucide-react";
import { useEffect, useRef } from "react";

const steps = [
  {
    icon: User,
    title: "Create Your Profile",
    description: "Tell us about yourself in a safe, anonymous way",
    side: "left"
  },
  {
    icon: Heart,
    title: "Tell Us How You Feel",
    description: "Share your current emotional state and what you're going through",
    side: "right"
  },
  {
    icon: Users,
    title: "Get Matched with a Peer",
    description: "Our AI connects you with someone who truly understands",
    side: "left"
  },
  {
    icon: MessageCircle,
    title: "Chat. Share. Heal.",
    description: "Start meaningful conversations in a safe, supportive environment",
    side: "right"
  }
];

export const HowItWorks = () => {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".step-card");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works-section" className="py-20 bg-gradient-to-b from-primary/5 to-white relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 400 400">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It <span className="text-primary font-kalam">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to find your support network
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Animated timeline */}
          <div 
            ref={timelineRef}
            className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary/30 via-primary to-primary/30 rounded-full hidden lg:block"
          />

          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, index) => (
              <div key={index} className={`step-card opacity-0 flex items-center ${
                step.side === "left" ? "lg:flex-row" : "lg:flex-row-reverse"
              } flex-col gap-8`}>
                
                {/* Step number circle */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-foreground font-bold text-xl shadow-glow hidden lg:flex z-10">
                  {index + 1}
                </div>

                {/* Content card */}
                <div className={`flex-1 ${
                  step.side === "left" ? "lg:pr-16" : "lg:pl-16"
                }`}>
                  <Card className="glass border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <step.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="lg:hidden w-8 h-8 bg-primary rounded-full flex items-center justify-center text-foreground font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Spacer for alignment */}
                <div className="flex-1 hidden lg:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};