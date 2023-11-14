import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedRouter } from "./createRouter";
import { Feature, FeatureCollection } from "geojson";
import { serverEnv } from "../../utils/env/server";
import { Role, Status } from "@prisma/client";
import { DirectionsResponse } from "../../utils/types";
import { roundCoord } from "../../utils/publicUser";

// router for interacting with the Mapbox API
export const mapboxRouter = router({
  //search address query
  search: protectedRouter
    .input(
      z.object({
        value: z.string(),
        types: z.union([
          z.literal("address%2Cpostcode"),
          z.literal("neighborhood%2Cplace"),
        ]),
        proximity: z.literal("ip"),
        country: z.literal("us"),
        autocomplete: z.literal(true),
      })
    )
    .query(async ({ ctx, input }): Promise<FeatureCollection> => {
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
    }),

  //queries all other users and locations besides current user
  geoJsonUserList: protectedRouter.query(async ({ ctx }) => {
    const id = ctx.session.user?.id;
    const currentUser = await ctx.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    const oppRole =
      currentUser?.role === Role.DRIVER ? Role.RIDER : Role.DRIVER;
    const users = await ctx.prisma.user.findMany({
      where: {
        id: {
          not: id, // doesn't include the current user
        },
        isOnboarded: true, // only include user that have finished onboarding
        status: Status.ACTIVE, // only include active users
        role: oppRole,
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
        daysWorking: true,
        preferredName: true,
        companyAddress: true,
        companyCoordLat: true,
        companyCoordLng: true,
        startPOICoordLng: true,
        startPOICoordLat: true,
        startPOILocation: true,
        startTime: true,
        endTime: true,
      },
    });

    // creates points for each user with coordinates at company location
    const features: Feature[] = users.map((u) => {
      const feat = {
        type: "Feature" as "Feature",
        geometry: {
          type: "Point" as "Point",
          coordinates: [
            roundCoord(u.companyCoordLng),
            roundCoord(u.companyCoordLat),
          ],
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
  }),

  getDirections: protectedRouter
    .input(
      z.object({
        points: z.array(z.tuple([z.number(), z.number()])), // Array of tuples containing longitude and latitude
      })
    )
    .query(async ({ ctx, input }): Promise<DirectionsResponse> => {
      // Convert input to a string in the format required by the Mapbox API
      const coordinates = input.points
        .map(([lng, lat]) => `${lng},${lat}`)
        .join(";");

      const endpoint = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinates}?access_token=${serverEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`;
      const data = await fetch(endpoint)
        .then((response) => response.json())
        .then((json) => {
          if (json.code != "Ok") {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: json.message,
              cause: json,
            });
          } else {
            return json;
          }
        })
        .catch((err) => {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected error. Please try again.",
            cause: err,
          });
        });
      return data;
    }),
});
