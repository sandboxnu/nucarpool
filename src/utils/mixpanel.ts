import mixpanel from 'mixpanel-browser';

mixpanel.init(process.env.MIXPANEL_PROJECT_TOKEN, {
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
