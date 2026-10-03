import { Button } from "@/components/ui/button";
import innerbloomLogo from "@/assets/innerbloom-logo.png";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LandingNavProps {
  onLogin: () => void;
  onSignup: () => void;
}

export const LandingNav = ({ onLogin, onSignup }: LandingNavProps) => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
      <div className="glass-nav rounded-full px-6 py-3 flex items-center justify-between shadow-glow">
        <div className="flex items-center space-x-2">
          <img
            src={innerbloomLogo}
            alt="Innerbloom Logo"
            className="w-12 h-12 object-contain"
          />
          <span className="text-xl font-roboto font-bold text-foreground">
            InnerBloom
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Sun className={isDark ? "opacity-50" : "text-primary"} size={18} />
            <Switch
              checked={isDark}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              aria-label="Toggle dark mode"
            />
            <Moon className={!isDark ? "opacity-50" : "text-primary"} size={18} />
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/about")}
            className="hover:bg-primary/10 transition-all duration-300"
          >
            About Us
          </Button>
          <Button
            variant="ghost"
            onClick={onLogin}
            className="hover:bg-primary/10 transition-all duration-300"
          >
            Log In
          </Button>
          <Button
            onClick={onSignup}
            className="bg-primary hover:bg-primary/90 text-foreground rounded-full px-6 transition-all duration-300 hover:scale-105"
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};