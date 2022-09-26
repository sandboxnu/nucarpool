import superjson from "superjson";
import { createRouter } from "./createRouter";
import { mapboxRouter } from "./mapbox";
import { userRouter } from "./user";

// TODO: Document this

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("user.", userRouter)
  .merge("mapbox.", mapboxRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
