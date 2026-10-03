import { useState } from "react";
import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhyDifferent } from "@/components/landing/why-different";
import { CommunityVoices } from "@/components/landing/community-voices";
import { EmergencySection } from "@/components/landing/emergency-section";
import { Footer } from "@/components/landing/footer";
import { LoginModal } from "@/components/auth/login-modal";
import { SignupModal } from "@/components/auth/signup-modal";
import AnimatedInnerBloomSection from "@/components/landing/animated-innerbloom-section";

const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <LandingNav 
        onLogin={() => setShowLogin(true)}
        onSignup={() => setShowSignup(true)}
      />
      
      <HeroSection onGetStarted={() => setShowSignup(true)} />
      <AnimatedInnerBloomSection />
      <HowItWorks />
      <WhyDifferent />
      <CommunityVoices />
      <EmergencySection />
      <Footer />

      <LoginModal 
        open={showLogin} 
        onOpenChange={setShowLogin}
      />
      <SignupModal 
        open={showSignup} 
        onOpenChange={setShowSignup}
      />
    </div>
  );
};

export default LandingPage;