// lib/crisisDetection.ts
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Crisis keywords that trigger pastor notification
const CRISIS_KEYWORDS = [
  // Suicide/self-harm
  'suicide', 'kill myself', 'end my life', 'want to die', 'no reason to live',
  'better off dead', 'hurt myself', 'self harm', 'cut myself',

  // Severe mental health
  'can\'t go on', 'give up', 'hopeless', 'no hope', 'nothing matters',

  // Abuse/danger
  'abuse', 'abused', 'abusing', 'hitting me', 'hurting me', 'afraid',
  'scared for my life', 'threatened', 'violence',

  // Addiction crisis
  'overdose', 'relapsed', 'using again', 'can\'t stop drinking',

  // Severe distress
  'crisis', 'emergency', 'urgent help', 'desperate', 'can\'t take it'
];

export interface CrisisAlert {
  id?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userLocation?: string;
  prayerRequest: string;
  detectedKeywords: string[];
  createdAt: any;
  status: 'new' | 'contacted' | 'resolved';
  pastorNotes?: string;
}

/**
 * Detects crisis keywords in prayer request text
 */
export function detectCrisis(text: string): { isCrisis: boolean; keywords: string[] } {
  const lowerText = text.toLowerCase();
  const foundKeywords: string[] = [];

  for (const keyword of CRISIS_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    }
  }

  return {
    isCrisis: foundKeywords.length > 0,
    keywords: foundKeywords
  };
}

/**
 * Logs crisis alert and notifies pastor
 */
export async function logCrisisAlert(alert: CrisisAlert): Promise<void> {
  try {
    // Save to Firestore
    const alertDoc = doc(db, 'crisis_alerts', `${alert.userId}_${Date.now()}`);
    await setDoc(alertDoc, {
      ...alert,
      createdAt: serverTimestamp(),
      status: 'new'
    });

    // Send email notification to pastor
    await notifyPastor(alert);

  } catch (error) {
    console.error('Error logging crisis alert:', error);
    throw error;
  }
}

/**
 * Sends email notification to pastor via API
 */
async function notifyPastor(alert: CrisisAlert): Promise<void> {
  try {
    const response = await fetch('/api/crisis-alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userName: alert.userName,
        userEmail: alert.userEmail,
        userLocation: alert.userLocation,
        prayerRequest: alert.prayerRequest,
        keywords: alert.detectedKeywords
      })
    });

    if (!response.ok) {
      console.error('Failed to notify pastor');
    }
  } catch (error) {
    console.error('Error notifying pastor:', error);
    // Don't throw - we still want the prayer to be submitted even if email fails
  }
}

/**
 * Get formatted location string (city, state only)
 */
export function getGeneralLocation(location?: { city?: string; state?: string; country?: string }): string {
  if (!location) return '';

  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);

  return parts.join(', ');
}
