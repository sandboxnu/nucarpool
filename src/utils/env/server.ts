import { envsafe, str, url, makeValidator, invalidEnvError } from "envsafe";
import { browserEnv } from "./browser";

if (typeof window !== "undefined") {
  throw new Error(
    "This should only be included on the client (but the env vars wont be exposed)"
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
    GOOGLE_CLIENT_ID: str({
      input: process.env.GOOGLE_CLIENT_ID,
    }),
    GOOGLE_CLIENT_SECRET: str({
      input: process.env.GOOGLE_CLIENT_SECRET,
    }),
    SENDGRID_API_KEY: str({
      input: process.env.SENDGRID_API_KEY,
    }),
  }),
};
