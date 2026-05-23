"use client";
import { useState } from "react";
import HeroSection from "./components/HeroSection";
import Problem from "./components/Problem";
import Blog from "./components/Blog";
import Subscription from "./components/Supscription";
import AboutQuestion from "./components/AboutQuestion";
import Register from "./components/Register";
import SplashScreen from "@/components/layout/SplashScreen";
import Conclusion from "./components/Conclusion";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <div className={showSplash ? "h-screen overflow-hidden" : ""}>
        <HeroSection />
        <Problem />
        <Blog />
        <Subscription />
        <Register />
        <AboutQuestion />
        <Conclusion />
      </div>
    </>
  );
}
