import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedRouter, router } from "./createRouter";
import { Feature, FeatureCollection } from "geojson";
import { serverEnv } from "../../utils/env/server";
import { Role, Status } from "@prisma/client";
import { DirectionsResponse } from "../../utils/types";
import { roundCoord } from "../../utils/publicUser";
import _ from "lodash";
import { calculateScore } from "../../utils/recommendation";

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
    .query(async ({ input }): Promise<FeatureCollection> => {
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
  geoJsonUserList: protectedRouter
    .input(
      z.object({
        days: z.number(), /// 0 for any, 1 for exact
        daysWorking: z.string(),
        flexDays: z.number(),
        startDistance: z.number(), // max 20, greater = any
        endDistance: z.number(),
        startTime: z.number(), // max = 4 hours, greater = any
        endTime: z.number(),
        startDate: z.date(),
        endDate: z.date(),
        dateOverlap: z.number(), // 0 any, 1 partial, 2 full
        favorites: z.boolean(), // if true, only show users user has favorited
        messaged: z.boolean(), // if false, hide users user has messaged
      })
    )
    .query(async ({ ctx, input }) => {
      const id = ctx.session.user?.id;
      const currentUser = await ctx.prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          favorites: input.favorites,
          sentRequests: !input.messaged,
          receivedRequests: !input.messaged,
        },
      });

      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No user with id ${id}.`,
        });
      }

      const { favorites, sentRequests, receivedRequests, ...calcUser } =
        currentUser;

      let userQuery: { id: any; isOnboarded: boolean; status: Status } = {
        id: { not: id },
        isOnboarded: true,
        status: Status.ACTIVE,
      };

      // Hide users user has messaged
      if (!input.messaged) {
        userQuery.id["notIn"] = [
          ...sentRequests.map((r) => r.toUserId),
          ...receivedRequests.map((r) => r.fromUserId),
        ];
      }

      // Favorites filter
      if (input.favorites) {
        userQuery.id["in"] = favorites.map((f) => f.id);
      }

      // Construct Query with Filters
      const users = await ctx.prisma.user.findMany({
        where: userQuery,
      });
      const filtered = _.compact(
        users.map(calculateScore(calcUser, input, "distance"))
      );
      filtered.sort((a, b) => a.score - b.score);
      const sortedUsers = _.compact(
        filtered.map((rec) => users.find((user) => user.id === rec.id))
      );
      const finalUsers =
        calcUser.role === Role.VIEWER ? sortedUsers : sortedUsers.slice(0, 150);

      // creates points for each user with coordinates at company location
      const features: Feature[] = finalUsers.map((u) => {
        return {
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
    .query(async ({ input }): Promise<DirectionsResponse> => {
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
