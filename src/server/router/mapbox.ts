import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedRouter, router } from "./createRouter";
import { Feature, FeatureCollection } from "geojson";
import { serverEnv } from "../../utils/env/server";
import { Role, Status, CarpoolSearch, Location } from "@prisma/client";
import { DirectionsResponse } from "../../utils/types";
import { convertCarpoolSearchToPublic, roundCoord } from "../../utils/publicUser";
import _ from "lodash";
import { calculateScore, Recommendation } from "../../utils/recommendation";
import { parseMapboxFeature } from "../../utils/map/parseAddress";

// router for interacting with the Mapbox API
export const mapboxRouter = router({
  //search address query
  search: protectedRouter
    .input(
      z.object({
        value: z.string(),
        types: z
          .string()
          .refine(
            (val) =>
              val === "address%2Cpostcode" || val === "neighborhood%2Cplace",
          ),
        proximity: z.string().refine((val) => val === "ip"),
        country: z.string().refine((val) => val === "us"),
        autocomplete: z.boolean().refine((val) => val === true),
      }),
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

      // parse features to include structured address components
      const parsedFeatures = data.features.map((feature: any) =>
        parseMapboxFeature(feature),
      );

      return {
        ...data,
        features: parsedFeatures,
      };
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
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id;
      
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated.",
        });
      }

      const currentUserSearch = await ctx.prisma.carpoolSearch.findFirst({
        where: { userId },
        include: {
          user: {
            include: {
              favorites: input.favorites,
              sentRequests: !input.messaged,
              receivedRequests: !input.messaged,
            }
          },
          homeLocation: true,
          companyLocation: true,
        },
      });

      if (!currentUserSearch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No carpool search found for user ${userId}.`,
        });
      }

      const { favorites, sentRequests, receivedRequests } = currentUserSearch.user;

      let excludedUserIds: string[] = [userId];
      
      // Hide users user has messaged
      if (!input.messaged) {
        excludedUserIds.push(
          ...sentRequests.map((r) => r.toUserId),
          ...receivedRequests.map((r) => r.fromUserId)
        );
      }

      // construct Query with Filters
      let carpoolSearchQuery: any = {
        userId: { notIn: excludedUserIds },
        status: Status.ACTIVE,
        user: {
          isOnboarded: true,
        }
      };

      // Favorites filter
      if (input.favorites) {
        carpoolSearchQuery.userId = {
          ...carpoolSearchQuery.userId,
          in: favorites.map((f) => f.id)
        };
      }

      const carpoolSearches = await ctx.prisma.carpoolSearch.findMany({
        where: carpoolSearchQuery,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              bio: true,
              preferredName: true,
              pronouns: true,
              isOnboarded: true,
            }
          },
          homeLocation: true,
          companyLocation: true,
        },
      });

      const filtered: Recommendation[] = _.compact(
        carpoolSearches.map(calculateScore(currentUserSearch, input, "distance")),
      );
      filtered.sort((a: Recommendation, b: Recommendation) => a.score - b.score);
      const sortedSearches = _.compact(
        filtered.map((rec) => carpoolSearches.find((search) => search.user.id === rec.id)),
      );
      const finalSearches =
        currentUserSearch.role === Role.VIEWER ? sortedSearches : sortedSearches.slice(0, 150);

      const finalPublicUsers = finalSearches.map(convertCarpoolSearchToPublic);

      // creates points for each user with coordinates at company location
      const features: Feature[] = finalPublicUsers.map((u) => {
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
      }),
    )
    .query(async ({ input }): Promise<DirectionsResponse> => {
      // Convert input to a string in the format required by the Mapbox API
      const coordinates = input.points
        .map(([lng, lat]) => `${lng},${lat}`)
        .join(";");

      const endpoint = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?access_token=${serverEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`;
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