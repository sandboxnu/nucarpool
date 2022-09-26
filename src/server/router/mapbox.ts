import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./createProtectedRouter";
import { FeatureCollection } from "geojson";
import { serverEnv } from "../../utils/env/server";

// TODO: document router :D
// TODO: implement router everywhere axios is currently being used

export const mapboxRouter = createProtectedRouter()
  .query("search", {
    input: z.object({
      value: z.string(),
      types: z.union([z.literal("address%2Cpostcode"), z.literal("neighborhood%2Cplace")]),
      proximity: z.literal("ip"),
      country: z.literal("us"),
      autocomplete: z.literal(true),
    }),
    resolve: async ({ ctx, input }): Promise<FeatureCollection> => {
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${input.value}.json?access_token=${serverEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&autocomplete=${input.autocomplete}&country=${input.country}&proximity=${input.proximity}&types=${input.types}`;
      const data = await fetch(endpoint).then((response) => response.json()).catch((err) => {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected error. Please try again.",
          cause: err
        });
      });
      return data
    }
  }
);
