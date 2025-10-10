// app/hooks/useStudyStyle.ts
"use client";

import { useEffect, useState } from "react";
import { studyStyles } from "../config/studyStyles";

export function useStudyStyle() {
  const [style, setStyle] = useState<keyof typeof studyStyles>("Casual Devotional");

  useEffect(() => {
    const saved = localStorage.getItem("bc-study-style");
    if (saved && studyStyles[saved as keyof typeof studyStyles]) {
      setStyle(saved as keyof typeof studyStyles);
    }
  }, []);

  const saveStyle = (newStyle: keyof typeof studyStyles) => {
    setStyle(newStyle);
    localStorage.setItem("bc-study-style", newStyle);
  };

  return { style, saveStyle };
}