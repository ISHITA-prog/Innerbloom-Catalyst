import { Flower, Instagram, MessageCircle, Mail, Shield, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import innerbloomLogo from "@/assets/innerbloom-logo.png";
import { useState } from "react";

export const Footer = () => {
  const [showCreatedBy, setShowCreatedBy] = useState(false);
  const [showMission, setShowMission] = useState(false);
  return (
    <footer className="bg-foreground/5 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src={innerbloomLogo} alt="Innerbloom Logo" className="w-8 h-8 object-contain" />
              <span className="text-2xl font-roboto font-bold text-[#004030]">
                InnerBloom
              </span>
            </div>
            <p className="text-muted-foreground">
              AI-matched emotional support with people who understand what you're going through.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <MessageCircle className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <Mail className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">About</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => setShowMission((v) => !v)}>
                  Our Mission
                </Button>
                {showMission && (
                  <div className="mt-2 text-xs text-foreground bg-white/80 rounded p-2 shadow">
                    India’s youth are facing a silent surge in depression, anxiety, and burnout, affecting their emotional well-being and daily lives. Beyond academic pressure and post-COVID isolation, unnoticed triggers like lack of emotional outlets, toxic comparison on social media, and overstimulation from digital content are worsening the crisis — with limited peer-driven support systems in place.<br/><br/>
                    “InnerBloom” solves the problem by providing a safe, AI-powered platform that connects individuals with similar mental health struggles through peer matching, anonymous chat, and a supportive community. AI-driven sentiment and crisis detection, along with moderation by professional psychologists, ensure safe conversations. The platform offers structured group activities, casual games, and offline meetups for real-world impact. Features like an SOS button, therapist access, stress detection (via facial cues), and anonymized profiles ensure privacy while delivering meaningful support.
                  </div>
                )}
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                  How It Works
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                  Safety & Privacy
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                  Success Stories
                </Button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                  <Shield className="w-4 h-4 mr-2" />
                  Crisis Resources
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                  Help Center
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => setShowCreatedBy(true)}>
                  Contact Us
                </Button>
                {showCreatedBy && (
                  <div className="mt-2 text-xs text-foreground bg-white/80 rounded p-2 shadow">
                    created by team Alchemists
                  </div>
                )}
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                  Community Guidelines
                </Button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                  <FileText className="w-4 h-4 mr-2" />
                  Privacy Policy
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                  <FileText className="w-4 h-4 mr-2" />
                  Terms of Use
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                  Cookie Policy
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                  HIPAA Compliance
                </Button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-primary/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-sm">
              © 2024 InnerBloom. All rights reserved. Made with 💚 for mental health.
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>1000+ Members</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <div>Available 24/7</div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <div>🔒 HIPAA Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};