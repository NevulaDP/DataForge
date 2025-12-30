
/**
 * DataForge Analytics Service
 * Automated event tracking via Google Analytics 4.
 * Includes privacy-first consent management.
 */

const CONSENT_KEY = 'data_forge_consent_v1';

// Extend window for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Checks if the user has previously granted consent for tracking.
 */
export const hasConsent = (): boolean => {
  return localStorage.getItem(CONSENT_KEY) === 'granted';
};

/**
 * Persists the user's tracking preference.
 */
export const setConsent = (status: 'granted' | 'denied') => {
  localStorage.setItem(CONSENT_KEY, status);
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      'analytics_storage': status
    });
  }
};

/**
 * Tracks an event only if consent is granted.
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (hasConsent() && typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      ...params,
      platform: 'DataForge Simulator',
      timestamp: new Date().toISOString()
    });
    console.debug(`[Analytics] Sent to GA4: ${eventName}`, params);
  } else {
    console.debug(`[Analytics] Track suppressed (Consent: ${hasConsent()}): ${eventName}`, params);
  }
};

/**
 * Common events for Data Analyst tracking
 */
export const Analytics = {
  MISSION_STARTED: 'mission_started',
  CODE_EXECUTED: 'code_executed',
  PROJECT_SAVED: 'project_saved',
  REPORT_EXPORTED: 'report_exported',
  MENTOR_ADVICE_REQUESTED: 'mentor_advice',
  SESSION_RESUMED: 'session_resumed'
};
