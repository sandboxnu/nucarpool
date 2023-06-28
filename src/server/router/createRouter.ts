import { TRPCError, initTRPC } from "@trpc/server";
import { Context } from "./context";
import superjson from "superjson";

export const transformer = {
  input: superjson,
  output: {
    serialize: (object: any) => superjson.stringify(object),
    // This `eval` only ever happens on the **client**
    deserialize: (object: any) => eval(`(${object})`),
  },
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;

const isProtected = middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const protectedRouter = procedure.use(isProtected);
