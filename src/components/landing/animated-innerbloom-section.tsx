import React, { useEffect, useRef, useState } from "react";

const lottieUrl = "https://lottie.host/fca43481-9b93-4742-9d64-53b7a7235928/f8OaizGCT1.lottie";

const AnimatedInnerBloomSection = () => {
  const lottieRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Animate.css
    if (!document.querySelector('link[href*="animate.min.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css";
      document.head.appendChild(link);
    }
    // Lottie web component
    if (!document.querySelector('script[src*="dotlottie-wc"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.6.2/dist/dotlottie-wc.js";
      document.body.appendChild(script);
    }
    // Lottie element
    if (lottieRef.current) {
      lottieRef.current.innerHTML = '';
      const lottie = document.createElement('dotlottie-wc');
      lottie.setAttribute('src', lottieUrl);
      lottie.setAttribute('style', 'width: 300px; height: 300px;');
      lottie.setAttribute('speed', '1');
      lottie.setAttribute('autoplay', '');
      lottie.setAttribute('loop', '');
      lottieRef.current.appendChild(lottie);
    }
  }, []);

  useEffect(() => {
    // Intersection Observer for heading animation
    const observer = new window.IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (headingRef.current) {
      observer.observe(headingRef.current);
    }
    return () => {
      if (headingRef.current) observer.unobserve(headingRef.current);
    };
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center py-20 min-h-[400px] w-full overflow-hidden bg-gradient-to-br from-white via-primary/5 to-primary/10">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <h1
          ref={headingRef}
          className={`text-5xl md:text-7xl font-bold text-primary font-roboto drop-shadow-lg mb-6 animate__animated ${inView ? "animate__fadeInLeft" : "opacity-0"}`}
        >
          InnerBloom
        </h1>
        <div ref={lottieRef} className="mt-2" />
      </div>
    </section>
  );
};

export default AnimatedInnerBloomSection; 