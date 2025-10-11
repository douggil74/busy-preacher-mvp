// App.js
import React, { useState, useEffect } from 'react';
import './App.css';

// Import the BibleCommentaryService
class BibleCommentaryService {
  constructor() {
    // Bible book mappings for different APIs
    this.bookMappings = {
      // Standard book codes
      genesis: { code: 'gen', name: 'Genesis', number: 1 },
      exodus: { code: 'exo', name: 'Exodus', number: 2 },
      leviticus: { code: 'lev', name: 'Leviticus', number: 3 },
      numbers: { code: 'num', name: 'Numbers', number: 4 },
      deuteronomy: { code: 'deu', name: 'Deuteronomy', number: 5 },
      joshua: { code: 'jos', name: 'Joshua', number: 6 },
      judges: { code: 'jdg', name: 'Judges', number: 7 },
      ruth: { code: 'rut', name: 'Ruth', number: 8 },
      '1samuel': { code: '1sa', name: '1 Samuel', number: 9 },
      '2samuel': { code: '2sa', name: '2 Samuel', number: 10 },
      '1kings': { code: '1ki', name: '1 Kings', number: 11 },
      '2kings': { code: '2ki', name: '2 Kings', number: 12 },
      '1chronicles': { code: '1ch', name: '1 Chronicles', number: 13 },
      '2chronicles': { code: '2ch', name: '2 Chronicles', number: 14 },
      ezra: { code: 'ezr', name: 'Ezra', number: 15 },
      nehemiah: { code: 'neh', name: 'Nehemiah', number: 16 },
      esther: { code: 'est', name: 'Esther', number: 17 },
      job: { code: 'job', name: 'Job', number: 18 },
      psalms: { code: 'psa', name: 'Psalms', number: 19 },
      psalm: { code: 'psa', name: 'Psalms', number: 19 }, // Alternative
      proverbs: { code: 'pro', name: 'Proverbs', number: 20 },
      ecclesiastes: { code: 'ecc', name: 'Ecclesiastes', number: 21 },
      songofsolomon: { code: 'sng', name: 'Song of Solomon', number: 22 },
      isaiah: { code: 'isa', name: 'Isaiah', number: 23 },
      jeremiah: { code: 'jer', name: 'Jeremiah', number: 24 },
      lamentations: { code: 'lam', name: 'Lamentations', number: 25 },
      ezekiel: { code: 'eze', name: 'Ezekiel', number: 26 },
      daniel: { code: 'dan', name: 'Daniel', number: 27 },
      hosea: { code: 'hos', name: 'Hosea', number: 28 },
      joel: { code: 'jol', name: 'Joel', number: 29 },
      amos: { code: 'amo', name: 'Amos', number: 30 },
      obadiah: { code: 'oba', name: 'Obadiah', number: 31 },
      jonah: { code: 'jon', name: 'Jonah', number: 32 },
      micah: { code: 'mic', name: 'Micah', number: 33 },
      nahum: { code: 'nah', name: 'Nahum', number: 34 },
      habakkuk: { code: 'hab', name: 'Habakkuk', number: 35 },
      zephaniah: { code: 'zep', name: 'Zephaniah', number: 36 },
      haggai: { code: 'hag', name: 'Haggai', number: 37 },
      zechariah: { code: 'zec', name: 'Zechariah', number: 38 },
      malachi: { code: 'mal', name: 'Malachi', number: 39 },
      matthew: { code: 'mat', name: 'Matthew', number: 40 },
      mark: { code: 'mrk', name: 'Mark', number: 41 },
      luke: { code: 'luk', name: 'Luke', number: 42 },
      john: { code: 'jhn', name: 'John', number: 43 },
      acts: { code: 'act', name: 'Acts', number: 44 },
      romans: { code: 'rom', name: 'Romans', number: 45 },
      '1corinthians': { code: '1co', name: '1 Corinthians', number: 46 },
      '2corinthians': { code: '2co', name: '2 Corinthians', number: 47 },
      galatians: { code: 'gal', name: 'Galatians', number: 48 },
      ephesians: { code: 'eph', name: 'Ephesians', number: 49 },
      philippians: { code: 'php', name: 'Philippians', number: 50 },
      colossians: { code: 'col', name: 'Colossians', number: 51 },
      '1thessalonians': { code: '1th', name: '1 Thessalonians', number: 52 },
      '2thessalonians': { code: '2th', name: '2 Thessalonians', number: 53 },
      '1timothy': { code: '1ti', name: '1 Timothy', number: 54 },
      '2timothy': { code: '2ti', name: '2 Timothy', number: 55 },
      titus: { code: 'tit', name: 'Titus', number: 56 },
      philemon: { code: 'phm', name: 'Philemon', number: 57 },
      hebrews: { code: 'heb', name: 'Hebrews', number: 58 },
      james: { code: 'jas', name: 'James', number: 59 },
      '1peter': { code: '1pe', name: '1 Peter', number: 60 },
      '2peter': { code: '2pe', name: '2 Peter', number: 61 },
      '1john': { code: '1jn', name: '1 John', number: 62 },
      '2john': { code: '2jn', name: '2 John', number: 63 },
      '3john': { code: '3jn', name: '3 John', number: 64 },
      jude: { code: 'jud', name: 'Jude', number: 65 },
      revelation: { code: 'rev', name: 'Revelation', number: 66 }
    };

    this.cache = new Map();
    this.cacheTimeout = 3600000;
  }

  parseReference(reference) {
    const match = reference.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/i);
    if (!match) return null;

    const [, book, chapter, verseStart, verseEnd] = match;
    const normalizedBook = book.trim().toLowerCase().replace(/\s+/g, '');
    const bookInfo = this.bookMappings[normalizedBook];
    
    if (!bookInfo) return null;

    return {
      book: bookInfo.code,
      bookName: bookInfo.name,
      bookNumber: bookInfo.number,
      chapter: parseInt(chapter),
      verseStart: parseInt(verseStart),
      verseEnd: verseEnd ? parseInt(verseEnd) : parseInt(verseStart),
      normalizedBook
    };
  }

  getCacheKey(type, reference, version = '') {
    return `${type}:${reference}:${version}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async getCompleteStudyMaterial(reference) {
    const parsed = this.parseReference(reference);
    if (!parsed) {
      return {
        error: 'Invalid reference format. Use format like "John 3:16" or "Genesis 1:1-3"'
      };
    }

    const result = {
      reference,
      parsed,
      verses: {},
      commentary: {},
      crossReferences: [],
      studyQuestions: [],
      externalLinks: []
    };

    const [verses, commentary, crossRefs] = await Promise.all([
      this.getMultipleVersions(reference),
      this.getAllCommentaries(reference),
      this.getCrossReferences(reference)
    ]);

    result.verses = verses;
    result.commentary = commentary;
    result.crossReferences = crossRefs;
    result.studyQuestions = this.generateStudyQuestions(reference, parsed);
    result.externalLinks = this.generateExternalLinks(reference, parsed);

    return result;
  }

  async getMultipleVersions(reference) {
    const versions = {
      kjv: 'King James Version',
      asv: 'American Standard Version',
      web: 'World English Bible'
    };

    const verses = {};

    for (const [code, name] of Object.entries(versions)) {
      const cacheKey = this.getCacheKey('verse', reference, code);
      const cached = this.getFromCache(cacheKey);
      
      if (cached) {
        verses[code] = cached;
        continue;
      }

      try {
        const response = await fetch(
          `https://bible-api.com/${encodeURIComponent(reference)}?translation=${code}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const verseData = {
            text: data.text.trim(),
            version: name,
            verses: data.verses
          };
          verses[code] = verseData;
          this.setCache(cacheKey, verseData);
        }
      } catch (error) {
        console.error(`Failed to fetch ${code}:`, error);
      }
    }

    if (Object.keys(verses).length === 0) {
      verses.kjv = await this.fetchFromWldehAPI(reference);
    }

    return verses;
  }

  async fetchFromWldehAPI(reference) {
    const parsed = this.parseReference(reference);
    if (!parsed) return null;

    try {
      const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books/${parsed.normalizedBook}/chapters/${parsed.chapter}.json`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const verses = [];
        
        for (let v = parsed.verseStart; v <= parsed.verseEnd; v++) {
          const verse = data.verses.find(verse => verse.verse === v);
          if (verse) {
            verses.push(verse.text);
          }
        }
        
        return {
          text: verses.join(' '),
          version: 'King James Version',
          source: 'wldeh-api'
        };
      }
    } catch (error) {
      console.error('Failed to fetch from wldeh API:', error);
    }
    
    return null;
  }

  async getAllCommentaries(reference) {
    const commentaries = {};
    const sources = [
      this.getChristianContextCommentary(reference),
      this.getStoredCommentary(reference)
    ];

    const results = await Promise.all(sources);
    
    if (results[0]) commentaries.christianContext = results[0];
    if (results[1]) commentaries.stored = results[1];

    if (Object.keys(commentaries).length === 0) {
      commentaries.default = this.getDefaultCommentary(reference);
    }

    return commentaries;
  }

  async getChristianContextCommentary(reference) {
    const parsed = this.parseReference(reference);
    if (!parsed) return null;

    const cacheKey = this.getCacheKey('commentary-cc', reference);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://api.getcontext.xyz/v0.9/c/${parsed.bookName}/${parsed.chapter}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.commentary) {
          const result = {
            text: data.commentary,
            source: 'Christian Context API'
          };
          this.setCache(cacheKey, result);
          return result;
        }
      }
    } catch (error) {
      console.error('Christian Context API error:', error);
    }
    
    return null;
  }

  async getStoredCommentary(reference) {
    const parsed = this.parseReference(reference);
    if (!parsed) return null;

    const storedCommentaries = {
      'john3:16': {
        matthewHenry: 'God so loved the world - Here God is commending his love toward us. The Father shows his love in giving his Son for us...',
        adamClarke: 'For God so loved the world - Such a love as that which induced God to give his only begotten Son to die for the world...'
      },
      'genesis1:1': {
        matthewHenry: 'In the beginning - That is, in the beginning of time, when God first created all things...',
        adamClarke: 'In the beginning God created - The word Elohim, which we translate God, is the plural of El or Eloah...'
      }
    };

    const key = `${parsed.normalizedBook}${parsed.chapter}:${parsed.verseStart}`;
    if (storedCommentaries[key]) {
      return {
        text: storedCommentaries[key],
        source: 'Stored Commentaries'
      };
    }

    return null;
  }

  getCrossReferences(reference) {
    const parsed = this.parseReference(reference);
    if (!parsed) return [];

    const crossRefs = {
      'john3:16': ['Romans 5:8', '1 John 4:9-10', '2 Corinthians 5:21', 'Isaiah 53:5-6'],
      'genesis1:1': ['John 1:1-3', 'Hebrews 11:3', 'Psalm 33:6', 'Colossians 1:16'],
      'psalm23:1': ['John 10:11', 'Isaiah 40:11', 'Ezekiel 34:23', '1 Peter 2:25']
    };

    const key = `${parsed.normalizedBook}${parsed.chapter}:${parsed.verseStart}`;
    return crossRefs[key] || [];
  }

  generateStudyQuestions(reference, parsed) {
    return [
      `What is the main theme of ${reference}?`,
      `What does this passage teach us about God's character?`,
      `How does ${parsed.bookName} ${parsed.chapter} relate to the broader context of the book?`,
      `What practical application can we draw from this verse for our daily lives?`,
      `Are there any key words or phrases that stand out in this passage?`,
      `How might this passage have been understood by its original audience?`,
      `What questions does this passage raise for further study?`,
      `How does this verse connect to the gospel message?`
    ];
  }

  generateExternalLinks(reference, parsed) {
    const encodedRef = encodeURIComponent(reference);
    
    return [
      {
        name: 'Blue Letter Bible',
        url: `https://www.blueletterbible.org/search/search.cfm?Criteria=${encodedRef}`,
        description: 'In-depth study tools and original language resources'
      },
      {
        name: 'Bible Hub',
        url: `https://biblehub.com/${parsed.normalizedBook}/${parsed.chapter}-${parsed.verseStart}.htm`,
        description: 'Parallel versions and commentaries'
      },
      {
        name: 'StudyLight.org',
        url: `https://www.studylight.org/commentary/${parsed.normalizedBook}/${parsed.chapter}.html`,
        description: 'Multiple commentary sources'
      },
      {
        name: 'Bible Gateway',
        url: `https://www.biblegateway.com/passage/?search=${encodedRef}`,
        description: 'Read in multiple translations'
      }
    ];
  }

  getDefaultCommentary(reference) {
    return {
      text: `Commentary for ${reference} is being compiled. In the meantime, consider these reflection points:
      
      1. Read the passage in context - examine the verses before and after.
      2. Consider the historical and cultural background of the text.
      3. Look for repeated words or themes that might indicate emphasis.
      4. Think about how this passage relates to the overall message of the book.
      5. Pray for understanding and wisdom as you study God's Word.`,
      source: 'Study Guide',
      type: 'default'
    };
  }

  formatSourceName(source) {
    const names = {
      christianContext: 'Christian Context Commentary',
      stored: 'Classic Commentaries',
      default: 'Study Notes'
    };
    
    return names[source] || source;
  }

  formatAuthorName(author) {
    const names = {
      matthewHenry: 'Matthew Henry',
      adamClarke: 'Adam Clarke',
      albertBarnes: 'Albert Barnes',
      johnGill: 'John Gill'
    };
    
    return names[author] || author;
  }
}

// Main DeepStudy Component
const DeepStudy = () => {
  const [reference, setReference] = useState('');
  const [studyData, setStudyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState('kjv');
  const [favorites, setFavorites] = useState([]);
  const [notes, setNotes] = useState({});
  const [activeTab, setActiveTab] = useState('verse');

  const commentaryService = new BibleCommentaryService();

  useEffect(() => {
    const savedFavorites = localStorage.getItem('bibleFavorites');
    const savedNotes = localStorage.getItem('bibleNotes');
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const handleStudy = async () => {
    if (!reference.trim()) {
      setError('Please enter a Bible reference (e.g., John 3:16)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await commentaryService.getCompleteStudyMaterial(reference);
      
      if (data.error) {
        setError(data.error);
        setStudyData(null);
      } else {
        setStudyData(data);
        addToRecentSearches(reference);
      }
    } catch (err) {
      setError('Failed to fetch study material. Please try again.');
      console.error('Study error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToRecentSearches = (ref) => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [ref, ...recent.filter(r => r !== ref)].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const toggleFavorite = () => {
    if (!studyData) return;
    
    const ref = studyData.reference;
    const updated = favorites.includes(ref) 
      ? favorites.filter(f => f !== ref)
      : [...favorites, ref];
    
    setFavorites(updated);
    localStorage.setItem('bibleFavorites', JSON.stringify(updated));
  };

  const saveNote = (note) => {
    if (!studyData) return;
    
    const updated = {
      ...notes,
      [studyData.reference]: note
    };
    
    setNotes(updated);
    localStorage.setItem('bibleNotes', JSON.stringify(updated));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const renderVerseSection = () => {
    if (!studyData || !studyData.verses) return null;

    const currentVersion = studyData.verses[selectedVersion];
    if (!currentVersion) return null;

    return (
      <div className="verse-section">
        <div className="verse-header">
          <h2>{studyData.reference}</h2>
          <button 
            onClick={toggleFavorite}
            className={`favorite-btn ${favorites.includes(studyData.reference) ? 'active' : ''}`}
          >
            {favorites.includes(studyData.reference) ? '★' : '☆'}
          </button>
        </div>

        <div className="version-selector">
          {Object.keys(studyData.verses).map(version => (
            <button
              key={version}
              onClick={() => setSelectedVersion(version)}
              className={`version-btn ${selectedVersion === version ? 'active' : ''}`}
            >
              {version.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="verse-text">
          <p>{currentVersion.text}</p>
          <div className="verse-actions">
            <button onClick={() => copyToClipboard(currentVersion.text)}>
              Copy
            </button>
            <span className="version-label">{currentVersion.version}</span>
          </div>
        </div>

        {studyData.crossReferences && studyData.crossReferences.length > 0 && (
          <div className="cross-references">
            <h3>Cross References</h3>
            <div className="ref-list">
              {studyData.crossReferences.map((ref, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setReference(ref);
                    handleStudy();
                  }}
                  className="ref-link"
                >
                  {ref}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCommentarySection = () => {
    if (!studyData || !studyData.commentary) return null;

    return (
      <div className="commentary-section">
        <h3>Commentary</h3>
        {Object.entries(studyData.commentary).map(([source, content]) => (
          <div key={source} className="commentary-block">
            <h4>{commentaryService.formatSourceName(source)}</h4>
            {typeof content === 'object' && content.text ? (
              <p>{content.text}</p>
            ) : typeof content === 'object' ? (
              Object.entries(content).map(([author, text]) => (
                <div key={author} className="author-commentary">
                  <h5>{commentaryService.formatAuthorName(author)}</h5>
                  <p>{text}</p>
                </div>
              ))
            ) : (
              <p>{content}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStudyQuestions = () => {
    if (!studyData || !studyData.studyQuestions) return null;

    return (
      <div className="study-questions">
        <h3>Study Questions</h3>
        <ol>
          {studyData.studyQuestions.map((question, idx) => (
            <li key={idx}>{question}</li>
          ))}
        </ol>
      </div>
    );
  };

  const renderNotesSection = () => {
    const currentNote = studyData ? notes[studyData.reference] || '' : '';

    return (
      <div className="notes-section">
        <h3>Personal Notes</h3>
        <textarea
          value={currentNote}
          onChange={(e) => saveNote(e.target.value)}
          placeholder="Add your personal notes and reflections here..."
          rows={6}
        />
      </div>
    );
  };

  const renderExternalLinks = () => {
    if (!studyData || !studyData.externalLinks) return null;

    return (
      <div className="external-links">
        <h3>Further Study</h3>
        <div className="links-grid">
          {studyData.externalLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="external-link"
            >
              <strong>{link.name}</strong>
              <small>{link.description}</small>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderSidebar = () => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');

    return (
      <div className="sidebar">
        {favorites.length > 0 && (
          <div className="sidebar-section">
            <h4>Favorites</h4>
            <ul>
              {favorites.map((fav, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => {
                      setReference(fav);
                      handleStudy();
                    }}
                    className="sidebar-link"
                  >
                    {fav}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recent.length > 0 && (
          <div className="sidebar-section">
            <h4>Recent Searches</h4>
            <ul>
              {recent.map((ref, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => {
                      setReference(ref);
                      handleStudy();
                    }}
                    className="sidebar-link"
                  >
                    {ref}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="deep-study-container">
      <header className="study-header">
        <h1>Bible Deep Study</h1>
        <div className="search-bar">
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleStudy()}
            placeholder="Enter reference (e.g., John 3:16, Genesis 1:1-3)"
          />
          <button onClick={handleStudy} disabled={loading}>
            {loading ? 'Loading...' : 'Study'}
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="study-layout">
        {renderSidebar()}

        <main className="study-main">
          {studyData && (
            <>
              <div className="tabs">
                <button
                  onClick={() => setActiveTab('verse')}
                  className={`tab ${activeTab === 'verse' ? 'active' : ''}`}
                >
                  Verse
                </button>
                <button
                  onClick={() => setActiveTab('commentary')}
                  className={`tab ${activeTab === 'commentary' ? 'active' : ''}`}
                >
                  Commentary
                </button>
                <button
                  onClick={() => setActiveTab('study')}
                  className={`tab ${activeTab === 'study' ? 'active' : ''}`}
                >
                  Study
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                >
                  Notes
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'verse' && renderVerseSection()}
                {activeTab === 'commentary' && renderCommentarySection()}
                {activeTab === 'study' && (
                  <>
                    {renderStudyQuestions()}
                    {renderExternalLinks()}
                  </>
                )}
                {activeTab === 'notes' && renderNotesSection()}
              </div>
            </>
          )}

          {!studyData && !loading && !error && (
            <div className="welcome-message">
              <h2>Welcome to Bible Deep Study</h2>
              <p>Enter a Bible reference above to begin your study.</p>
              <p>Try: John 3:16, Psalm 23:1-6, or Romans 8:28</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <div className="App">
      <DeepStudy />
    </div>
  );
}

export default App;