// hooks/useStudyState.ts
import { useReducer, useCallback } from 'react';

/**
 * Consolidated Study State Management
 * 
 * BEFORE (State Explosion):
 * const [passage, setPassage] = useState('');
 * const [translation, setTranslation] = useState('ESV');
 * const [verseText, setVerseText] = useState('');
 * const [commentary, setCommentary] = useState('');
 * const [isLoading, setIsLoading] = useState(false);
 * const [error, setError] = useState(null);
 * const [activeTab, setActiveTab] = useState('ai');
 * const [classicCommentaries, setClassicCommentaries] = useState([]);
 * const [sermons, setSermons] = useState([]);
 * const [videos, setVideos] = useState([]);
 * // ... 10+ more states 🤯
 * 
 * AFTER (Consolidated with useReducer):
 * Single state object with clear actions
 * Better performance (fewer re-renders)
 * Easier to debug and test
 */

export interface StudyState {
  // Passage Info
  passage: string;
  translation: 'ESV' | 'NIV' | 'NASB' | 'KJV';
  verseText: string;
  
  // Content
  commentary: string;
  classicCommentaries: ClassicCommentary[];
  sermons: Sermon[];
  videos: Video[];
  
  // UI State
  activeTab: 'ai' | 'classic' | 'sermons' | 'videos';
  isLoading: boolean;
  error: string | null;
  
  // Progress
  loadingProgress: number;
  
  // User Preferences
  fontSize: 'small' | 'medium' | 'large';
  theme: 'dark' | 'light';
}

export interface ClassicCommentary {
  author: string;
  title: string;
  excerpt: string;
  url: string;
}

export interface Sermon {
  title: string;
  speaker: string;
  url: string;
  duration?: string;
}

export interface Video {
  title: string;
  channel: string;
  url: string;
  thumbnail: string;
  duration: string;
}

type StudyAction =
  | { type: 'SET_PASSAGE'; payload: string }
  | { type: 'SET_TRANSLATION'; payload: StudyState['translation'] }
  | { type: 'SET_VERSE_TEXT'; payload: string }
  | { type: 'SET_COMMENTARY'; payload: string }
  | { type: 'SET_CLASSIC_COMMENTARIES'; payload: ClassicCommentary[] }
  | { type: 'SET_SERMONS'; payload: Sermon[] }
  | { type: 'SET_VIDEOS'; payload: Video[] }
  | { type: 'SET_ACTIVE_TAB'; payload: StudyState['activeTab'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING_PROGRESS'; payload: number }
  | { type: 'SET_FONT_SIZE'; payload: StudyState['fontSize'] }
  | { type: 'SET_THEME'; payload: StudyState['theme'] }
  | { type: 'RESET_STATE' };

const initialState: StudyState = {
  passage: '',
  translation: 'ESV',
  verseText: '',
  commentary: '',
  classicCommentaries: [],
  sermons: [],
  videos: [],
  activeTab: 'ai',
  isLoading: false,
  error: null,
  loadingProgress: 0,
  fontSize: 'medium',
  theme: 'dark',
};

function studyReducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case 'SET_PASSAGE':
      return { ...state, passage: action.payload };
    case 'SET_TRANSLATION':
      return { ...state, translation: action.payload };
    case 'SET_VERSE_TEXT':
      return { ...state, verseText: action.payload };
    case 'SET_COMMENTARY':
      return { ...state, commentary: action.payload };
    case 'SET_CLASSIC_COMMENTARIES':
      return { ...state, classicCommentaries: action.payload };
    case 'SET_SERMONS':
      return { ...state, sermons: action.payload };
    case 'SET_VIDEOS':
      return { ...state, videos: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LOADING_PROGRESS':
      return { ...state, loadingProgress: action.payload };
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

export function useStudyState(overrideInitialState?: Partial<StudyState>) {
  const [state, dispatch] = useReducer(
    studyReducer,
    { ...initialState, ...overrideInitialState }
  );

  // Memoized action creators for better performance
  const actions = {
    setPassage: useCallback((passage: string) => {
      dispatch({ type: 'SET_PASSAGE', payload: passage });
    }, []),

    setTranslation: useCallback((translation: StudyState['translation']) => {
      dispatch({ type: 'SET_TRANSLATION', payload: translation });
    }, []),

    setVerseText: useCallback((text: string) => {
      dispatch({ type: 'SET_VERSE_TEXT', payload: text });
    }, []),

    setCommentary: useCallback((commentary: string) => {
      dispatch({ type: 'SET_COMMENTARY', payload: commentary });
    }, []),

    setClassicCommentaries: useCallback((commentaries: ClassicCommentary[]) => {
      dispatch({ type: 'SET_CLASSIC_COMMENTARIES', payload: commentaries });
    }, []),

    setSermons: useCallback((sermons: Sermon[]) => {
      dispatch({ type: 'SET_SERMONS', payload: sermons });
    }, []),

    setVideos: useCallback((videos: Video[]) => {
      dispatch({ type: 'SET_VIDEOS', payload: videos });
    }, []),

    setActiveTab: useCallback((tab: StudyState['activeTab']) => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
    }, []),

    setLoading: useCallback((isLoading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: isLoading });
    }, []),

    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),

    setLoadingProgress: useCallback((progress: number) => {
      dispatch({ type: 'SET_LOADING_PROGRESS', payload: progress });
    }, []),

    setFontSize: useCallback((size: StudyState['fontSize']) => {
      dispatch({ type: 'SET_FONT_SIZE', payload: size });
    }, []),

    setTheme: useCallback((theme: StudyState['theme']) => {
      dispatch({ type: 'SET_THEME', payload: theme });
    }, []),

    reset: useCallback(() => {
      dispatch({ type: 'RESET_STATE' });
    }, []),
  };

  return { state, actions };
}

// USAGE EXAMPLE:
// function DeepStudyPage() {
//   const { state, actions } = useStudyState({ translation: 'ESV' });
//
//   const handleSearch = async () => {
//     actions.setLoading(true);
//     actions.setError(null);
//     try {
//       const result = await fetchCommentary(state.passage);
//       actions.setCommentary(result);
//     } catch (err) {
//       actions.setError('Failed to load commentary');
//     } finally {
//       actions.setLoading(false);
//     }
//   };
//
//   return (
//     <div>
//       {state.isLoading && <LoadingSpinner />}
//       {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
//       <CommentaryDisplay text={state.commentary} />
//     </div>
//   );
// }
