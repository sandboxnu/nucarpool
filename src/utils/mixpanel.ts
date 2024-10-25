import mixpanel from 'mixpanel-browser';
import { browserEnv } from './env/browser';

const mixpanelToken = browserEnv.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN;

if (!mixpanelToken) {
  throw new Error('NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN is not defined');
}

mixpanel.init(mixpanelToken, {
  debug: process.env.NODE_ENV !== 'production',
  track_pageview: true,
  persistence: 'localStorage'
});

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  mixpanel.track(eventName, properties);
};

export const setUserProperties = (properties: Record<string, any>) => {
  mixpanel.people.set(properties);
};

// Add this new function
export const trackProfileCompletion = (role: string, status: string) => {
  trackEvent('Profile Completed', { role, status });
};
