export const studyStyles = {
    "Casual Devotional": {
      description: "Friendly, encouraging, short reflections that focus on daily life application.",
      tonePrompt: "Use a warm, conversational tone. Write like a friend helping someone grow closer to God.",
    },
    "Bible Student": {
      description: "Balanced study with meaning, background, and practical insights.",
      tonePrompt: "Use a teaching tone. Explain key terms briefly but stay personal.",
    },
    "Pastor / Teacher": {
      description: "Structured outlines with application points and illustrative examples.",
      tonePrompt: "Use a pastoral tone. Provide clear structure, points, and a gentle call to action.",
    },
    Theologian: {
      description: "Analytical study with context, language detail, and precise references.",
      tonePrompt: "Use an academic tone. Include Greek/Hebrew terms and doctrinal insight when relevant.",
    },
  } as const;
  
  export type StudyStyleKey = keyof typeof studyStyles;
  