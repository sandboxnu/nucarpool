import { bool, envsafe, str } from "envsafe";

export const browserEnv = envsafe({
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: str({
    input: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  }),
  NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN: str({
    input: process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN,
  }),
  NEXT_PUBLIC_PUSHER_KEY: str({
    input: process.env.NEXT_PUBLIC_PUSHER_KEY,
  }),
  NEXT_PUBLIC_PUSHER_CLUSTER: str({
    input: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  }),
});
