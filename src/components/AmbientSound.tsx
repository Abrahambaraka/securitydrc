"use client";

import { useEffect } from "react";

export default function AmbientSound() {
  useEffect(() => {
    const audio = new Audio("/sounds/ambiance.mp3");
    audio.volume = 0.15;
    audio.loop = true;
    audio.play().catch(() => {});
    
    return () => {
      audio.pause();
    }
  }, []);

  return null;
}
