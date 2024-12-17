import mixpanel from "mixpanel-browser";
import { browserEnv } from "./env/browser";

const mixpanelToken = browserEnv.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN;

if (!mixpanelToken) {
  throw new Error("NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN is not defined");
}

mixpanel.init(mixpanelToken, {
  debug: process.env.NODE_ENV !== "production",
  track_pageview: true,
  persistence: "localStorage",
});

export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  mixpanel.track(eventName, properties);
};

export const setUserProperties = (properties: Record<string, any>) => {
  mixpanel.people.set(properties);
};
export const trackFTUECompletion = (role: string) => {
  trackEvent("FTUE Completed", { role });
};
export const trackFTUEStep = (step: number) => {
  const name = "FTUE Step " + step;
  trackEvent(name);
};
// Add this new function
export const trackProfileCompletion = (role: string, status: string) => {
  trackEvent("Profile Completed", { role, status });
};

// Add this new function
export const trackViewRoute = (role: string) => {
  trackEvent("View Route Clicked", {
    role
  });
};

export const trackRequestResponse = (action: "accept" | "decline", role: string) => {
  trackEvent("Request Response", {
    action,
    role
  });
};
