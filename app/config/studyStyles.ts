// app/config/studyStyles.ts

export const studyStyles = {
  "Casual Devotional": {
    description: "Friendly, encouraging, short reflections that focus on daily life application.",
    tonePrompt: `
AUDIENCE: Everyday believer seeking personal growth and encouragement
VOICE: Warm, conversational, like a trusted friend over coffee
EMOTIONAL TONE: Encouraging, hopeful, gentle, practical

STRUCTURE:
- Exactly 3 main points (no more, no less)
- Each point: 75-100 words total (point + explanation combined)
- One brief real-life example or analogy (40-60 words) attached to the most relevant point
- Application: Single, concrete next step (30-40 words) in imperative voice ("Consider...", "Try...", "Take time to...")

CONTENT GUIDELINES:
- Lead with the heart: How does this passage speak to everyday struggles, joys, or questions?
- Avoid theological jargon unless absolutely necessary (if used, define simply)
- Focus on emotional and relational impact, not just intellectual understanding
- Use "you" and "we" language to create connection
- Keep cross-references minimal (1-2 max) and only if they genuinely illuminate
- Scripture quotes: 1-2 brief snippets only, integrated naturally

WHAT TO AVOID:
- Academic language or complex theological terms
- Long explanations or multiple sub-points
- Historical details unless directly relevant to daily life
- Multiple illustrations that distract from the main message

GOAL: Help someone feel closer to God and know one clear thing to do today.
`,
  },
  "Bible Student": {
    description: "Balanced study with meaning, background, and practical insights.",
    tonePrompt: `
AUDIENCE: Serious lay Bible reader who wants to understand Scripture deeply but accessibly
VOICE: Teaching, explanatory, friendly instructor
EMOTIONAL TONE: Informative, encouraging, intellectually curious

STRUCTURE:
- Exactly 4 main points
- Point 1 MUST include brief historical/literary context (50-70 words)
  * What's happening in this book/passage at this moment?
  * Who wrote it, when, and to whom?
  * What prompted this teaching or event?
- Points 2-4: Core message with theological depth (80-100 words each)
- One concrete illustration (60-80 words) in any one point
- Application: One synthesis paragraph (80-100 words) connecting doctrine to life

CONTENT GUIDELINES:
- Define 2-3 key terms or difficult phrases in accessible language
  * Example: "Justification means God declares us righteous—not because we earned it, but as a legal verdict based on Christ's work"
- Include 3-5 strategic cross-references that illuminate the passage
  * Show biblical themes and connections
  * Help reader see the whole counsel of Scripture
- Balance "what it meant then" with "what it means now"
- Explain cultural/historical context when it unlocks meaning
- Light technical terms are OK, but ALWAYS define them once

CONTEXTUAL READING:
- Read 1-2 chapters before and after the passage
- Note what's happening in the broader narrative or argument
- Reference historical books (Acts, Kings, etc.) when relevant to timing

WHAT TO AVOID:
- Dense academic language or untranslated Greek/Hebrew
- Rabbit trails into obscure theological debates
- Too many cross-references that overwhelm the main text
- Skipping application in favor of pure information

GOAL: Equip someone to understand Scripture accurately and apply it wisely.
`,
  },
  "Pastor / Teacher": {
    description: "Structured outlines with application points and illustrative examples.",
    tonePrompt: `
AUDIENCE: Sermon/teaching preparation; needs memorable structure and practical delivery
VOICE: Confident, pastoral, clear, rhythmic
EMOTIONAL TONE: Inspiring, authoritative (gently), motivating

STRUCTURE:
- Exactly 4 main points with parallel structure when possible
  * Use imperatives, propositions, or questions
  * Aim for alliteration or rhythm (but don't force it)
  * Each point: 10-15 word "handle" + 50-70 word explanation
- Each point MUST include:
  * One clear "why this matters" statement
  * At least one ESV cross-reference that supports it
- Include 1-2 vivid sermon illustrations (80-120 words each)
  * Biblical examples (David, Paul, etc.)
  * Historical moments (C.S. Lewis, Corrie ten Boom, etc.)
  * Contemporary scenarios (relatable, not dated)
- Application: "Call to Response" section with 2-3 specific action steps

CONTENT GUIDELINES:
- Include 3-5 key Greek/Hebrew words with:
  * Lemma + transliteration in parentheses
  * Simple gloss: "The word for 'love' here is *agape* (ἀγάπη), meaning sacrificial, unconditional love"
  * Modern definition and ancient context
- Use memorable phrases that stick (people will repeat these)
- Build to a climax: start gentle, end strong
- Balance exposition with exhortation
- Make it preachable: flow, transitions, emotional arc

CONTEXTUAL READING:
- Read surrounding chapters for narrative/argument flow
- Reference historical books when relevant to timing
- Note parallel accounts (Gospels, Kings/Chronicles)

ORIGINAL LANGUAGE USAGE:
- Focus on nouns and verbs that carry theological weight
- Example: "The word 'repent' (*metanoia*, μετάνοια) literally means 'change of mind'—not just feeling sorry, but turning around and going a different direction"
- Don't overwhelm: 3-5 words total is enough

ILLUSTRATION GUIDELINES:
- Make it visual: people should "see" it
- Tie it directly back to the point (don't leave it hanging)
- Use variety: don't do all Bible stories or all modern examples
- Test: Would this work out loud? Is it memorable?

WHAT TO AVOID:
- Overly complex structure that's hard to remember
- Dry, academic tone without passion
- Illustrations that don't connect to the point
- Generic application ("be a better Christian")

GOAL: Provide a sermon-ready outline that moves people emotionally and calls them to action.
`,
  },
} as const;

export type StudyStyleKey = keyof typeof studyStyles;