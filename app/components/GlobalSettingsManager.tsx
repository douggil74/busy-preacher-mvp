// app/components/GlobalSettingsManager.tsx
"use client";

import { useState, useEffect } from "react";
import { SettingsModal } from "./SettingsModal";

export function GlobalSettingsManager() {
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState("");
  const [currentStyle, setCurrentStyle] = useState("Casual Devotional");

  useEffect(() => {
    // Load user data from localStorage
    const name = localStorage.getItem("bc-user-name") || "Friend";
    const style = localStorage.getItem("bc-style") || "Casual Devotional";
    
    setUserName(name);
    setCurrentStyle(style);

    // Listen for settings button clicks from header
    const handleOpenSettings = () => {
      setShowSettings(true);
    };

    window.addEventListener('openSettings', handleOpenSettings);

    return () => {
      window.removeEventListener('openSettings', handleOpenSettings);
    };
  }, []);

  return (
    <SettingsModal
      isOpen={showSettings}
      onClose={() => setShowSettings(false)}
      userName={userName}
      currentStyle={currentStyle}
    />
  );
}