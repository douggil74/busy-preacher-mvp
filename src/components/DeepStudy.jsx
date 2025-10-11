// DeepStudy.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './DeepStudy.css'; // We'll create this next

// Import or include the BibleCommentaryService
// import BibleCommentaryService from './commentaryService';

const DeepStudy = () => {
  const [reference, setReference] = useState('');
  const [studyData, setStudyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState('kjv');
  const [showCommentary, setShowCommentary] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [notes, setNotes] = useState({});
  const [activeTab, setActiveTab] = useState('verse');

  // Initialize the commentary service
  const commentaryService = new BibleCommentaryService();

  // Load saved data from localStorage
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

  // Handle search/study
  const handleStudy = useCallback(async () => {
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
        // Add to recent searches
        addToRecentSearches(reference);
      }
    } catch (err) {
      setError('Failed to fetch study material. Please try again.');
      console.error('Study error:', err);
    } finally {
      setLoading(false);
    }
  }, [reference]);

  // Add to recent searches
  const addToRecentSearches = (ref) => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [ref, ...recent.filter(r => r !== ref)].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Toggle favorite
  const toggleFavorite = () => {
    if (!studyData) return;
    
    const ref = studyData.reference;
    const updated = favorites.includes(ref) 
      ? favorites.filter(f => f !== ref)
      : [...favorites, ref];
    
    setFavorites(updated);
    localStorage.setItem('bibleFavorites', JSON.stringify(updated));
  };

  // Save note
  const saveNote = (note) => {
    if (!studyData) return;
    
    const updated = {
      ...notes,
      [studyData.reference]: note
    };
    
    setNotes(updated);
    localStorage.setItem('bibleNotes', JSON.stringify(updated));
  };

  // Copy verse to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show toast notification or feedback
      alert('Copied to clipboard!');
    });
  };

  // Render verse section
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

  // Render commentary section
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

  // Render study questions
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

  // Render notes section
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

  // Render external links
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

  // Render recent and favorites sidebar
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

export default DeepStudy;