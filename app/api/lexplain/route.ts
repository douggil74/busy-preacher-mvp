// app/api/lexplain/route.ts
// FIXED: Prevents over-theologizing simple words
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkRateLimit, getIdentifier, RATE_LIMITS, rateLimitResponse } from '@/lib/rateLimit';

function getSourceLanguage(bookName: string): 'Greek' | 'Hebrew' {
  const oldTestamentBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
    '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther',
    'Job', 'Psalms', 'Psalm', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Song of Songs',
    'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
    'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
    'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ];
  
  return oldTestamentBooks.includes(bookName) ? 'Hebrew' : 'Greek';
}

// Common words that should NOT get theological treatment
const SIMPLE_WORDS = {
  pronouns: ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'him', 'her', 'his', 'its', 'my', 'your', 'their', 'our'],
  articles: ['the', 'a', 'an'],
  conjunctions: ['and', 'but', 'or', 'for', 'nor', 'so', 'yet', 'if', 'when', 'then'],
  prepositions: ['in', 'on', 'at', 'to', 'from', 'of', 'with', 'by', 'for', 'about', 'into', 'unto'],
  common: ['is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'shall']
};

function isSimpleWord(word: string): boolean {
  const normalized = word.toLowerCase().trim();
  return Object.values(SIMPLE_WORDS).some(category => category.includes(normalized));
}

function getSimpleExplanation(word: string, language: 'Greek' | 'Hebrew' | null): any {
  const normalized = word.toLowerCase().trim();
  
  // Pronouns
  if (SIMPLE_WORDS.pronouns.includes(normalized)) {
    const greekPronouns: Record<string, { lemma: string; strongs: string; meaning: string }> = {
      'he': { lemma: 'autos', strongs: 'G846', meaning: 'A common pronoun meaning "he," "she," or "it." Used to refer back to someone or something already mentioned.' },
      'him': { lemma: 'autos', strongs: 'G846', meaning: 'A common pronoun meaning "him" or "it." Simply refers to a person or thing.' },
      'i': { lemma: 'egō', strongs: 'G1473', meaning: 'The first person pronoun "I." Used to emphasize the speaker.' },
      'you': { lemma: 'su', strongs: 'G4771', meaning: 'The second person pronoun "you." Addresses the person being spoken to.' },
      'we': { lemma: 'hēmeis', strongs: 'G2249', meaning: 'The first person plural pronoun "we." Refers to the speaker and others.' },
      'they': { lemma: 'autoi', strongs: 'G846', meaning: 'The third person plural pronoun "they." Refers to multiple people or things.' },
    };
    
    if (language === 'Greek' && greekPronouns[normalized]) {
      return {
        lemma: greekPronouns[normalized].lemma,
        strongs: greekPronouns[normalized].strongs,
        plain: greekPronouns[normalized].meaning
      };
    }
    
    return {
      lemma: normalized,
      strongs: '—',
      plain: `A common ${language || 'biblical'} pronoun. Used to refer to people or things in the text.`
    };
  }
  
  // Articles
  if (SIMPLE_WORDS.articles.includes(normalized)) {
    return {
      lemma: language === 'Greek' ? 'ho, hē, to' : 'ha',
      strongs: language === 'Greek' ? 'G3588' : 'H',
      plain: `The definite article "the" in ${language}. Used to specify particular nouns, just like in English.`
    };
  }
  
  // Conjunctions
  if (SIMPLE_WORDS.conjunctions.includes(normalized)) {
    const greekConj: Record<string, { lemma: string; strongs: string }> = {
      'and': { lemma: 'kai', strongs: 'G2532' },
      'but': { lemma: 'alla', strongs: 'G235' },
      'if': { lemma: 'ei', strongs: 'G1487' },
    };
    
    if (language === 'Greek' && greekConj[normalized]) {
      return {
        lemma: greekConj[normalized].lemma,
        strongs: greekConj[normalized].strongs,
        plain: `A common ${language} conjunction meaning "${normalized}." Connects words, phrases, or clauses.`
      };
    }
    
    return {
      lemma: normalized,
      strongs: '—',
      plain: `A common conjunction meaning "${normalized}." Used to connect ideas in the sentence.`
    };
  }
  
  // Prepositions
  if (SIMPLE_WORDS.prepositions.includes(normalized)) {
    return {
      lemma: normalized,
      strongs: '—',
      plain: `A common ${language || 'biblical'} preposition meaning "${normalized}." Shows relationships between words.`
    };
  }
  
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting - 15 requests per minute (AI-heavy)
    const identifier = getIdentifier(req);
    const rateLimit = checkRateLimit({
      ...RATE_LIMITS.AI_STUDY,
      identifier,
    });
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.resetIn);
    }

    const { surface, book } = (await req.json()) as { surface?: string; book?: string };
    const cleaned = String(surface ?? "").trim();

    if (!cleaned) {
      return NextResponse.json({ error: "Missing surface word." }, { status: 400 });
    }

    const language = book ? getSourceLanguage(book) : null;
    
    // Check if it's a simple word that doesn't need AI
    if (isSimpleWord(cleaned)) {
      const simpleExplanation = getSimpleExplanation(cleaned, language);
      if (simpleExplanation) {
        return NextResponse.json(simpleExplanation);
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        lemma: cleaned.toLowerCase(),
        strongs: "—",
        plain: "OpenAI not configured. (This is a fallback explanation.)",
      });
    }

    const strongsPrefix = language === 'Hebrew' ? 'H' : 'G';
    const testament = language === 'Hebrew' ? 'Old Testament' : 'New Testament';

    const openai = new OpenAI({ apiKey });

    // ============================================
    // ENHANCED SYSTEM PROMPT WITH GUARDRAILS
    // ============================================
    const sys = language
      ? `You are a biblical languages teacher helping people understand Greek and Hebrew words.

CONTEXT: The word "${cleaned}" appears in a ${language} text (${testament}, Book of ${book || 'unknown'}).

CRITICAL RULES:
1. NEVER invent theological significance for simple words
2. If it's a pronoun, article, conjunction, or preposition - give a SHORT, FACTUAL definition (1 sentence max)
3. Only provide rich theological insights for SIGNIFICANT words (nouns, verbs, theological terms)
4. Be ACCURATE - don't hallucinate meanings
5. If unsure, be brief and factual

Provide:
1. LEMMA: The original ${language} word (transliterated)
2. STRONG'S: The reference number (${strongsPrefix}####)
3. EXPLANATION: 
   - For SIMPLE words (pronouns/articles/conjunctions): 1 sentence, factual only
   - For SIGNIFICANT words: 2-3 sentences with theological insight (50-70 words)

EXAMPLES OF CORRECT RESPONSES:

Simple word (pronoun "he"):
{"lemma":"autos","strongs":"G846","plain":"A common pronoun meaning 'he,' 'she,' or 'it.' Used to refer to someone or something already mentioned."}

Simple word (conjunction "and"):
{"lemma":"kai","strongs":"G2532","plain":"A common conjunction meaning 'and.' Connects words, phrases, or clauses in Greek."}

Significant word (agape/love):
{"lemma":"agapē","strongs":"G26","plain":"This Greek word means a self-giving, sacrificial love that seeks the good of another regardless of worthiness. Unlike emotional affection, it's a deliberate choice to love—the kind God shows us and calls us to show others."}

Significant word (hesed):
{"lemma":"hesed","strongs":"H2617","plain":"This Hebrew word means steadfast, covenant love that refuses to let go. It's God's loyal, pursuing faithfulness woven into His relationship with His people—love that keeps showing up through betrayal and disappointment."}

DETERMINE: Is "${cleaned}" a simple grammatical word or a significant theological term?
- If simple → 1 brief factual sentence
- If significant → 2-3 rich sentences

Be ACCURATE. Don't over-theologize.`
      : `You are a biblical languages expert.

Analyze the word "${cleaned}" and determine its language and meaning.

Provide:
1. The original lemma (transliterated)
2. Strong's number
3. A brief, accurate explanation

Be factual and don't invent theological significance.`;

    const prompt = language
      ? `Surface word from ${testament}: "${cleaned}"\n` +
        `Book context: ${book || 'unknown'}\n\n` +
        `Return EXACT JSON with keys: lemma, strongs, plain\n\n` +
        `Now provide an ACCURATE explanation for "${cleaned}".`
      : `Surface word: "${cleaned}"\n\nReturn JSON with keys: lemma, strongs, plain`;

    const out = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3, // Lower temp for more accuracy, less creativity
      presence_penalty: 0.1,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = out.choices[0]?.message?.content ?? "{}";
    let parsed: any = {};
    
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {};
    }

    const lemma =
      typeof parsed.lemma === "string" && parsed.lemma.trim()
        ? parsed.lemma.trim()
        : cleaned.toLowerCase();
        
    const strongs =
      typeof parsed.strongs === "string" && parsed.strongs.trim()
        ? parsed.strongs.trim()
        : "—";
        
    const plain =
      typeof parsed.plain === "string" && parsed.plain.trim()
        ? parsed.plain.trim()
        : `A word from the original ${language || 'biblical'} text.`;

    return NextResponse.json({ lemma, strongs, plain });
    
  } catch (err) {
    console.error("Lexplain error:", err);
    return NextResponse.json(
      { 
        lemma: "—", 
        strongs: "—", 
        plain: "Unable to provide explanation at this time." 
      },
      { status: 200 }
    );
  }
}