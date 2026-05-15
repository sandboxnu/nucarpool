import { envsafe, str, url, makeValidator, invalidEnvError } from "envsafe";
import { browserEnv } from "./browser";

if (typeof window !== "undefined") {
  throw new Error(
    "This should only be included on the client (but the env vars wont be exposed)",
  );
}

export const serverEnv = {
  ...browserEnv,
  ...envsafe({
    DATABASE_URL: str({
      input: process.env.DATABASE_URL,
    }),
    NEXTAUTH_SECRET: str({
      input: process.env.NEXTAUTH_SECRET,
      devDefault: "xxx",
    }),
    AWS_ACCESS_KEY_ID: str({
      input: process.env.ACCESS_KEY_ID_AWS,
    }),
    AWS_SECRET_ACCESS_KEY: str({
      input: process.env.SECRET_ACCESS_KEY_AWS,
    }),
    AWS_REGION: str({
      input: process.env.REGION_AWS,
    }),
    AZURE_CLIENT_ID: str({
      input: process.env.AZURE_CLIENT_ID,
    }),
    AZURE_CLIENT_SECRET: str({
      input: process.env.AZURE_CLIENT_SECRET,
    }),
    AZURE_TENANT_ID: str({
      input: process.env.AZURE_TENANT_ID,
    }),
    GOOGLE_CLIENT_ID: str({
      input: process.env.GOOGLE_CLIENT_ID,
    }),
    GOOGLE_CLIENT_SECRET: str({
      input: process.env.GOOGLE_CLIENT_SECRET,
    }),
    PUSHER_APP_ID: str({
      input: process.env.PUSHER_APP_ID,
    }),
    PUSHER_SECRET: str({
      input: process.env.PUSHER_SECRET,
    }),
  }),
};
