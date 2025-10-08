// app/api/deep-study/route.ts
import { NextRequest, NextResponse } from "next/server";

const FREE_BIBLE_BASE = "https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles";
const COMMENTARY_API = "https://bible.helloao.org/api";

// Book mapping for commentary API
const bookIdMap: Record<string, string> = {
  "genesis": "GEN", "exodus": "EXO", "leviticus": "LEV", "numbers": "NUM",
  "deuteronomy": "DEU", "joshua": "JOS", "judges": "JDG", "ruth": "RUT",
  "1-samuel": "1SA", "2-samuel": "2SA", "1-kings": "1KI", "2-kings": "2KI",
  "1-chronicles": "1CH", "2-chronicles": "2CH", "ezra": "EZR", "nehemiah": "NEH",
  "esther": "EST", "job": "JOB", "psalms": "PSA", "proverbs": "PRO",
  "ecclesiastes": "ECC", "song-of-solomon": "SNG", "isaiah": "ISA",
  "jeremiah": "JER", "lamentations": "LAM", "ezekiel": "EZK", "daniel": "DAN",
  "hosea": "HOS", "joel": "JOL", "amos": "AMO", "obadiah": "OBA", "jonah": "JON",
  "micah": "MIC", "nahum": "NAM", "habakkuk": "HAB", "zephaniah": "ZEP",
  "haggai": "HAG", "zechariah": "ZEC", "malachi": "MAL", "matthew": "MAT",
  "mark": "MRK", "luke": "LUK", "john": "JHN", "acts": "ACT", "romans": "ROM",
  "1-corinthians": "1CO", "2-corinthians": "2CO", "galatians": "GAL",
  "ephesians": "EPH", "philippians": "PHP", "colossians": "COL",
  "1-thessalonians": "1TH", "2-thessalonians": "2TH", "1-timothy": "1TI",
  "2-timothy": "2TI", "titus": "TIT", "philemon": "PHM", "hebrews": "HEB",
  "james": "JAS", "1-peter": "1PE", "2-peter": "2PE", "1-john": "1JN",
  "2-john": "2JN", "3-john": "3JN", "jude": "JUD", "revelation": "REV"
};

// Book name mapping for BibleHub URLs
const bookNameMapBibleHub: Record<string, string> = {
  "genesis": "genesis", "exodus": "exodus", "leviticus": "leviticus", "numbers": "numbers",
  "deuteronomy": "deuteronomy", "joshua": "joshua", "judges": "judges", "ruth": "ruth",
  "1-samuel": "1_samuel", "2-samuel": "2_samuel", "1-kings": "1_kings", "2-kings": "2_kings",
  "1-chronicles": "1_chronicles", "2-chronicles": "2_chronicles", "ezra": "ezra", "nehemiah": "nehemiah",
  "esther": "esther", "job": "job", "psalms": "psalms", "proverbs": "proverbs",
  "ecclesiastes": "ecclesiastes", "song-of-solomon": "songs", "isaiah": "isaiah",
  "jeremiah": "jeremiah", "lamentations": "lamentations", "ezekiel": "ezekiel", "daniel": "daniel",
  "hosea": "hosea", "joel": "joel", "amos": "amos", "obadiah": "obadiah", "jonah": "jonah",
  "micah": "micah", "nahum": "nahum", "habakkuk": "habakkuk", "zephaniah": "zephaniah",
  "haggai": "haggai", "zechariah": "zechariah", "malachi": "malachi", "matthew": "matthew",
  "mark": "mark", "luke": "luke", "john": "john", "acts": "acts", "romans": "romans",
  "1-corinthians": "1_corinthians", "2-corinthians": "2_corinthians", "galatians": "galatians",
  "ephesians": "ephesians", "philippians": "philippians", "colossians": "colossians",
  "1-thessalonians": "1_thessalonians", "2-thessalonians": "2_thessalonians", "1-timothy": "1_timothy",
  "2-timothy": "2_timothy", "titus": "titus", "philemon": "philemon", "hebrews": "hebrews",
  "james": "james", "1-peter": "1_peter", "2-peter": "2_peter", "1-john": "1_john",
  "2-john": "2_john", "3-john": "3_john", "jude": "jude", "revelation": "revelation"
};

// Book name mapping for external URLs (for other tools)
const bookNameMap: Record<string, string> = {
  "genesis": "Genesis", "exodus": "Exodus", "leviticus": "Leviticus", "numbers": "Numbers",
  "deuteronomy": "Deuteronomy", "joshua": "Joshua", "judges": "Judges", "ruth": "Ruth",
  "1-samuel": "1-Samuel", "2-samuel": "2-Samuel", "1-kings": "1-Kings", "2-kings": "2-Kings",
  "1-chronicles": "1-Chronicles", "2-chronicles": "2-Chronicles", "ezra": "Ezra", "nehemiah": "Nehemiah",
  "esther": "Esther", "job": "Job", "psalms": "Psalm", "proverbs": "Proverbs",
  "ecclesiastes": "Ecclesiastes", "song-of-solomon": "Song-of-Solomon", "isaiah": "Isaiah",
  "jeremiah": "Jeremiah", "lamentations": "Lamentations", "ezekiel": "Ezekiel", "daniel": "Daniel",
  "hosea": "Hosea", "joel": "Joel", "amos": "Amos", "obadiah": "Obadiah", "jonah": "Jonah",
  "micah": "Micah", "nahum": "Nahum", "habakkuk": "Habakkuk", "zephaniah": "Zephaniah",
  "haggai": "Haggai", "zechariah": "Zechariah", "malachi": "Malachi", "matthew": "Matthew",
  "mark": "Mark", "luke": "Luke", "john": "John", "acts": "Acts", "romans": "Romans",
  "1-corinthians": "1-Corinthians", "2-corinthians": "2-Corinthians", "galatians": "Galatians",
  "ephesians": "Ephesians", "philippians": "Philippians", "colossians": "Colossians",
  "1-thessalonians": "1-Thessalonians", "2-thessalonians": "2-Thessalonians", "1-timothy": "1-Timothy",
  "2-timothy": "2-Timothy", "titus": "Titus", "philemon": "Philemon", "hebrews": "Hebrews",
  "james": "James", "1-peter": "1-Peter", "2-peter": "2-Peter", "1-john": "1-John",
  "2-john": "2-John", "3-john": "3-John", "jude": "Jude", "revelation": "Revelation"
};

function parseReference(reference: string) {
  const bookMap: Record<string, string> = {
    genesis: "genesis", gen: "genesis",
    exodus: "exodus", exod: "exodus", ex: "exodus",
    leviticus: "leviticus", lev: "leviticus",
    numbers: "numbers", num: "numbers",
    deuteronomy: "deuteronomy", deut: "deuteronomy",
    joshua: "joshua", josh: "joshua",
    judges: "judges", judg: "judges",
    ruth: "ruth",
    "1samuel": "1-samuel", "1sam": "1-samuel",
    "2samuel": "2-samuel", "2sam": "2-samuel",
    "1kings": "1-kings", "1kgs": "1-kings",
    "2kings": "2-kings", "2kgs": "2-kings",
    "1chronicles": "1-chronicles", "1chr": "1-chronicles",
    "2chronicles": "2-chronicles", "2chr": "2-chronicles",
    ezra: "ezra",
    nehemiah: "nehemiah", neh: "nehemiah",
    esther: "esther", esth: "esther",
    job: "job",
    psalms: "psalms", psalm: "psalms", ps: "psalms",
    proverbs: "proverbs", prov: "proverbs",
    ecclesiastes: "ecclesiastes", eccl: "ecclesiastes",
    "songofsolomon": "song-of-solomon", song: "song-of-solomon",
    isaiah: "isaiah", isa: "isaiah",
    jeremiah: "jeremiah", jer: "jeremiah",
    lamentations: "lamentations", lam: "lamentations",
    ezekiel: "ezekiel", ezek: "ezekiel",
    daniel: "daniel", dan: "daniel",
    hosea: "hosea", hos: "hosea",
    joel: "joel",
    amos: "amos",
    obadiah: "obadiah", obad: "obadiah",
    jonah: "jonah",
    micah: "micah", mic: "micah",
    nahum: "nahum", nah: "nahum",
    habakkuk: "habakkuk", hab: "habakkuk",
    zephaniah: "zephaniah", zeph: "zephaniah",
    haggai: "haggai", hag: "haggai",
    zechariah: "zechariah", zech: "zechariah",
    malachi: "malachi", mal: "malachi",
    matthew: "matthew", matt: "matthew", mt: "matthew",
    mark: "mark", mk: "mark",
    luke: "luke", lk: "luke",
    john: "john", jn: "john",
    acts: "acts",
    romans: "romans", rom: "romans",
    "1corinthians": "1-corinthians", "1cor": "1-corinthians",
    "2corinthians": "2-corinthians", "2cor": "2-corinthians",
    galatians: "galatians", gal: "galatians",
    ephesians: "ephesians", eph: "ephesians",
    philippians: "philippians", phil: "philippians",
    colossians: "colossians", col: "colossians",
    "1thessalonians": "1-thessalonians", "1thess": "1-thessalonians",
    "2thessalonians": "2-thessalonians", "2thess": "2-thessalonians",
    "1timothy": "1-timothy", "1tim": "1-timothy",
    "2timothy": "2-timothy", "2tim": "2-timothy",
    titus: "titus",
    philemon: "philemon", phlm: "philemon",
    hebrews: "hebrews", heb: "hebrews",
    james: "james", jas: "james",
    "1peter": "1-peter", "1pet": "1-peter",
    "2peter": "2-peter", "2pet": "2-peter",
    "1john": "1-john",
    "2john": "2-john",
    "3john": "3-john",
    jude: "jude",
    revelation: "revelation", rev: "revelation",
  };

  const match = reference.match(/^(\d?\s*[a-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/i);
  if (!match) return null;

  const [, book, chapter, verseStart, verseEnd] = match;
  const normalizedBook = book.trim().toLowerCase().replace(/\s+/g, '');
  const bookCode = bookMap[normalizedBook];
  
  if (!bookCode) return null;

  return {
    book: bookCode,
    chapter,
    verseStart,
    verseEnd: verseEnd || verseStart,
  };
}

async function fetchVerse(ref: string, version: string) {
  const parsed = parseReference(ref);
  if (!parsed) return { error: "Invalid reference format" };

  const { book, chapter, verseStart, verseEnd } = parsed;
  
  try {
    const verses: string[] = [];
    const startNum = parseInt(verseStart);
    const endNum = parseInt(verseEnd);
    
    for (let v = startNum; v <= endNum; v++) {
      const url = `${FREE_BIBLE_BASE}/en-${version.toLowerCase()}/books/${book}/chapters/${chapter}/verses/${v}.json`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        verses.push(`${v} ${data.text}`);
      }
    }
    
    if (verses.length === 0) {
      return { error: `Failed to fetch ${version}` };
    }
    
    return { 
      version: version.toUpperCase(), 
      text: verses.join(' '),
      book: book
    };
  } catch (error) {
    console.error(`${version} error:`, error);
    return { error: `Failed to fetch ${version}` };
  }
}

async function fetchAdamClarkeCommentary(ref: string) {
  try {
    const parsed = parseReference(ref);
    if (!parsed) return { error: "Invalid reference format" };

    const { book, chapter, verseStart } = parsed;
    const bookId = bookIdMap[book];
    
    if (!bookId) {
      return { error: "Book not available in commentary" };
    }

    const url = `${COMMENTARY_API}/c/adam-clarke/${bookId}/${chapter}.json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return { error: "Commentary not available" };
    }
    
    const data = await response.json();
    const verseNum = parseInt(verseStart);
    const verseContent = data.chapter?.content?.find(
      (item: any) => item.type === 'verse' && item.number === verseNum
    );
    
    if (!verseContent || !verseContent.content || verseContent.content.length === 0) {
      return { error: "No commentary for this verse" };
    }
    
    const commentary = verseContent.content
      .map((item: any) => typeof item === 'string' ? item : item.text || '')
      .join(' ')
      .trim();
    
    if (!commentary) {
      return { error: "No commentary for this verse" };
    }
    
    const maxLength = 2000;
    const truncatedCommentary = commentary.length > maxLength 
      ? commentary.substring(0, maxLength) + '...'
      : commentary;
    
    return {
      commentary: truncatedCommentary,
      commentarySource: "Adam Clarke Bible Commentary"
    };
    
  } catch (error: any) {
    console.error("Adam Clarke error:", error);
    return { error: `Failed to fetch commentary: ${error.message}` };
  }
}

function generateStudyLinks(reference: string) {
  const parsed = parseReference(reference);
  if (!parsed) return null;

  const { book, chapter, verseStart, verseEnd } = parsed;
  const bookName = bookNameMap[book] || book;
  const bookNameHub = bookNameMapBibleHub[book] || book.replace(/-/g, '_');
  const verseRange = verseEnd !== verseStart ? `${verseStart}-${verseEnd}` : verseStart;
  
  const formattedRef = `${bookName} ${chapter}:${verseRange}`;
  const encodedRef = encodeURIComponent(formattedRef);

  // BibleHub URL format: https://biblehub.com/[book]/[chapter]-[verse].htm
  // For verse ranges, we'll link to the first verse
  const bibleHubUrl = `https://biblehub.com/${bookNameHub}/${chapter}-${verseStart}.htm`;

  return {
    bibleHub: bibleHubUrl,
    blueLetterBible: `https://www.blueletterbible.org/search/search.cfm?Criteria=${encodedRef}&t=NIV`,
    studyLight: `https://www.studylight.org/desk/?q=${encodedRef}&t1=en_niv&sr=1`
  };
}

async function fetchAICommentary(reference: string, verseText: string) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { error: "OpenAI API key not configured" };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable Bible scholar and teacher. Provide insightful, accurate, and balanced commentary on Bible verses. Include historical context, theological insights, and practical application. Be concise but comprehensive (2-3 paragraphs). Maintain a respectful, non-denominational approach.'
          },
          {
            role: 'user',
            content: `Provide commentary on ${reference}: "${verseText}"\n\nInclude:\n1. Historical and cultural context\n2. Key theological insights\n3. Practical application for modern readers`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return { error: 'Failed to generate AI commentary' };
    }

    const data = await response.json();
    const aiCommentary = data.choices[0]?.message?.content;

    if (!aiCommentary) {
      return { error: 'No commentary generated' };
    }

    return {
      commentary: aiCommentary,
      commentarySource: 'AI-Generated Commentary (GPT-4)'
    };

  } catch (error: any) {
    console.error('AI Commentary error:', error);
    return { error: `Failed to generate AI commentary: ${error.message}` };
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get("reference");
    const includeAI = true;

    if (!reference) {
      return NextResponse.json({ error: "Missing reference parameter" }, { status: 400 });
    }

    console.log(`Fetching: ${reference}`);

    const [kjv, asv, web, niv, adamClarke] = await Promise.all([
      fetchVerse(reference, "kjv"),
      fetchVerse(reference, "asv"),
      fetchVerse(reference, "web"),
      fetchVerse(reference, "niv"),
      fetchAdamClarkeCommentary(reference),
    ]);

    let aiCommentary = null;
    if (kjv && !kjv.error && typeof kjv.text === 'string') {
      aiCommentary = await fetchAICommentary(reference, kjv.text);
    }
    
    const studyLinks = generateStudyLinks(reference);

    return NextResponse.json({
      reference,
      timestamp: new Date().toISOString(),
      translations: {
        kjv,
        asv,
        web,
        niv,
      },
      commentaries: {
        adamClarke: adamClarke.error ? null : adamClarke,
        ai: aiCommentary && !aiCommentary.error ? aiCommentary : null,
      },
      studyLinks: studyLinks,
    });
    
  } catch (error: any) {
    console.error("Deep Study API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Bible data" },
      { status: 500 }
    );
  }
}