import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Keywords that indicate complex scene needing DALL-E
const COMPLEX_SCENE_KEYWORDS = [
  'jesus', 'christ', 'mary', 'joseph', 'disciples', 'apostle', 'moses', 'david', 'abraham',
  'shepherd', 'wise men', 'magi', 'angel', 'angels', 'manger', 'nativity', 'crucifixion',
  'resurrection', 'baptism', 'miracle', 'parable', 'sermon on the mount',
  'people', 'person', 'man', 'woman', 'child', 'children', 'crowd', 'family',
  'santa', 'preacher', 'pastor', 'congregation', 'worshiper',
  'praying', 'kneeling', 'bowing', 'walking', 'standing', 'sitting',
  'face', 'hands', 'eyes', 'portrait',
  'scene with', 'depicting', 'showing'
];

function needsDallE(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return COMPLEX_SCENE_KEYWORDS.some(keyword => lower.includes(keyword));
}

// SVG template for simple mood/weather banners
const TEMPLATE = `<svg viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="BOTTOM_COLOR"/>
      <stop offset="50%" stop-color="MIDDLE_COLOR"/>
      <stop offset="100%" stop-color="TOP_COLOR"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="GLOW_CENTER" stop-opacity="1"/>
      <stop offset="100%" stop-color="GLOW_EDGE" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="softBlur"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <style>
    @keyframes drift { 0%,100% { transform: translateX(0); } 50% { transform: translateX(15px); } }
    @keyframes twinkle { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
    .drift { animation: drift 60s ease-in-out infinite; }
    .twinkle { animation: twinkle 3s ease-in-out infinite; }
  </style>

  <!-- Sky background - ALWAYS include this -->
  <rect width="800" height="200" fill="url(#sky)"/>

  <!-- Sun/Moon glow - position and color based on theme -->
  <circle cx="150" cy="160" r="80" fill="url(#glow)" filter="url(#blur)"/>
  <circle cx="150" cy="160" r="40" fill="SUN_COLOR"/>

  <!-- Fluffy cloud 1 - ALWAYS use multiple ellipses -->
  <g class="drift">
    <ellipse cx="300" cy="70" rx="50" ry="30" fill="CLOUD_COLOR" opacity="0.9"/>
    <ellipse cx="340" cy="60" rx="40" ry="28" fill="CLOUD_COLOR" opacity="0.95"/>
    <ellipse cx="380" cy="68" rx="45" ry="32" fill="CLOUD_COLOR" opacity="0.9"/>
    <ellipse cx="320" cy="82" rx="35" ry="22" fill="CLOUD_SHADOW" opacity="0.85"/>
    <ellipse cx="355" cy="78" rx="30" ry="20" fill="CLOUD_COLOR" opacity="0.9"/>
  </g>

  <!-- Fluffy cloud 2 -->
  <g class="drift" style="animation-delay: -30s;">
    <ellipse cx="600" cy="55" rx="45" ry="28" fill="CLOUD_COLOR" opacity="0.85"/>
    <ellipse cx="635" cy="48" rx="38" ry="25" fill="CLOUD_COLOR" opacity="0.9"/>
    <ellipse cx="670" cy="54" rx="40" ry="28" fill="CLOUD_COLOR" opacity="0.85"/>
    <ellipse cx="620" cy="65" rx="30" ry="18" fill="CLOUD_SHADOW" opacity="0.8"/>
  </g>

  <!-- ADD THEME-SPECIFIC ELEMENTS HERE: silhouettes, extra details -->
</svg>`;

async function generateWithDallE(prompt: string): Promise<{ imageUrl: string }> {
  const dallePrompt = `Photorealistic sky background for a mobile app weather header.

CRITICAL: This must be ONLY sky - looking straight up at the sky.
- NO window frames, NO windows, NO glass
- NO buildings, NO ground, NO horizon
- NO objects, NO people, NO furniture
- NO foreground elements of any kind
- Just pure sky, clouds, and atmospheric elements

Style: Clean, simple, photorealistic sky photography.
Wide panoramic format. Professional quality.

Sky scene: ${prompt}`;

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: dallePrompt,
    n: 1,
    size: '1792x1024',
    quality: 'standard',
  });

  const imageUrl = response.data[0]?.url;
  if (!imageUrl) {
    throw new Error('Failed to generate image');
  }

  return { imageUrl };
}

async function generateSvgBanner(prompt: string): Promise<{ svg: string }> {
  const systemPrompt = `You are the banner designer for The Busy Preacher app.
Create clean, modern, sermon-ready SVG banners that work for churches, slides, and social media.

DESIGN PRINCIPLES:
1. Style: Modern, minimal, clean. Soft lighting, natural colors. No cheesy clipart or outdated styles.
2. Composition: Clear subject focus, no clutter, no text unless specifically requested.
3. Biblical/Historical: Use reverent, respectful tones for Jesus or Scripture scenes.
4. Sermon-Ready: Colors should be modern and subtle - great for slides, screens, and church social media.
5. When Vague: Choose the cleanest, most natural interpretation. Keep backgrounds simple and professional.

YOUR TASK: Fill in this SVG template with appropriate colors and optionally add silhouette elements.

TEMPLATE:
${TEMPLATE}

REPLACE these placeholders with hex colors:
- BOTTOM_COLOR: bottom of sky gradient
- MIDDLE_COLOR: middle of sky gradient
- TOP_COLOR: top of sky gradient
- GLOW_CENTER: center of sun/moon glow
- GLOW_EDGE: edge of glow
- SUN_COLOR: the sun/moon circle
- CLOUD_COLOR: main cloud color
- CLOUD_SHADOW: slightly darker cloud shadow

COLOR GUIDANCE:
- Sermon themes: Soft, reverent tones (deep blues, warm golds, peaceful greens)
- Sports teams: Use team colors tastefully (Saints=#D3BC8D gold to #101820 black)
- Nature/Creation: Earth tones, sky blues, forest greens
- Sunrise/Hope: Warm oranges, soft pinks, golden yellows
- Evening/Reflection: Deep purples, twilight blues, soft amber
- Peace/Calm: Soft pastels, muted tones, gentle gradients
- Joy/Celebration: Bright but not garish - clean blues, warm yellows

SILHOUETTES (add after clouds if relevant):
- Church: <path d="M380 200 L380 140 L400 120 L420 140 L420 200 Z M395 120 L400 100 L405 120 Z" fill="#1a1a1a" opacity="0.7"/>
- Cross: <path d="M395 200 L395 130 L385 130 L385 120 L395 120 L395 100 L405 100 L405 120 L415 120 L415 130 L405 130 L405 200 Z" fill="#2a2a2a" opacity="0.6"/>
- Hills: <ellipse cx="400" cy="220" rx="300" ry="80" fill="#2d5016" opacity="0.5"/>
- Trees: <path d="M100 200 L100 160 L90 160 L100 140 L85 140 L100 115 L115 140 L100 140 L110 160 L100 160 Z" fill="#1a3d1a" opacity="0.6"/>
- City: <path d="M0 200 L0 150 L30 150 L30 130 L50 130 L50 160 L80 160 L80 140 L100 140 L100 200 Z" fill="#1a1a1a" opacity="0.7"/>

OUTPUT: Return ONLY the complete SVG code. No explanation, no markdown, no code blocks. Just raw SVG starting with <svg and ending with </svg>.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Create a banner for: "${prompt}". Fill in the template with appropriate colors and optionally add 1-2 silhouette elements. Output ONLY the SVG.` }
    ],
    max_tokens: 2000,
  });

  let svgContent = response.choices[0]?.message?.content || '';

  // Clean up
  svgContent = svgContent
    .replace(/```svg\n?/gi, '')
    .replace(/```xml\n?/gi, '')
    .replace(/```\n?/gi, '')
    .replace(/^[\s\S]*?(<svg)/i, '$1')
    .replace(/(<\/svg>)[\s\S]*$/i, '$1')
    .trim();

  // Validate
  if (!svgContent.startsWith('<svg')) {
    const svgMatch = svgContent.match(/<svg[\s\S]*<\/svg>/i);
    if (svgMatch) {
      svgContent = svgMatch[0];
    } else {
      throw new Error('Failed to generate valid SVG');
    }
  }

  if (!svgContent.includes('</svg>')) {
    throw new Error('Incomplete SVG generated');
  }

  // Fix common issues
  if (!svgContent.includes('viewBox')) {
    svgContent = svgContent.replace('<svg', '<svg viewBox="0 0 800 200"');
  }
  if (!svgContent.includes('xmlns')) {
    svgContent = svgContent.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  return { svg: svgContent };
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, style } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // If style is explicitly set, use that; otherwise auto-detect
    const useRealistic = style === 'realistic' || (style !== 'svg' && needsDallE(prompt));

    if (useRealistic) {
      console.log('Using DALL-E for realistic scene:', prompt);
      const result = await generateWithDallE(prompt);
      return NextResponse.json({ imageUrl: result.imageUrl, type: 'image' });
    } else {
      console.log('Using SVG template for banner:', prompt);
      const result = await generateSvgBanner(prompt);
      return NextResponse.json({ svg: result.svg, type: 'svg' });
    }
  } catch (error: any) {
    console.error('Error generating scene:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate scene' },
      { status: 500 }
    );
  }
}
