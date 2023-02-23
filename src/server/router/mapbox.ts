import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./createProtectedRouter";
import { Feature, FeatureCollection } from "geojson";
import { serverEnv } from "../../utils/env/server";
import { Status } from "@prisma/client";

// TODO: implement router everywhere axios is currently being used

// router for interacting with the Mapbox API
export const mapboxRouter = createProtectedRouter()
  // query to search for an address
  .query("search", {
    input: z.object({
      value: z.string(),
      types: z.union([
        z.literal("address%2Cpostcode"),
        z.literal("neighborhood%2Cplace"),
      ]),
      proximity: z.literal("ip"),
      country: z.literal("us"),
      autocomplete: z.literal(true),
    }),

    // attempts to retrieve address data, throws TRPCError if it fails
    resolve: async ({ ctx, input }): Promise<FeatureCollection> => {
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${input.value}.json?access_token=${serverEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&autocomplete=${input.autocomplete}&country=${input.country}&proximity=${input.proximity}&types=${input.types}`;
      const data = await fetch(endpoint)
        .then((response) => response.json())
        .catch((err) => {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected error. Please try again.",
            cause: err,
          });
        });
      return data;
    },
  })
  // queries all other users besides current user and their locations
  .query("geoJsonUsersList", {
    async resolve({ ctx }) {
      const id = ctx.session.user?.id;
      const users = await ctx.prisma.user.findMany({
        where: {
          id: {
            not: id, // doesn't include the current user
          },
          isOnboarded: true, // only include user that have finished onboarding
          status: Status.ACTIVE, // only include active users
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          status: true,
          seatAvail: true,
          companyName: true,
          companyPOIAddress: true,
          companyPOICoordLng: true,
          companyPOICoordLat: true,
          startPOICoordLng: true,
          startPOICoordLat: true,
          startPOILocation: true,
        },
      });

      // creates points for each user with coordinates at company location
      const features: Feature[] = users.map((u) => {
        const feat = {
          type: "Feature" as "Feature",
          geometry: {
            type: "Point" as "Point",
            coordinates: [u.companyPOICoordLng, u.companyPOICoordLat],
          },
          properties: {
            ...u,
          },
        };
        return feat;
      });

      const featureCollection: FeatureCollection = {
        type: "FeatureCollection" as "FeatureCollection",
        features,
      };

      return featureCollection;
    },
  });
