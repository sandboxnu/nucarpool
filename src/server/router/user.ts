import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./createProtectedRouter";
import { Role } from "@prisma/client";
import { Status } from "@prisma/client";
import calculateScore from "../../utils/recommendation";
import { convertToPublic, generatePoiData } from "../../utils/publicUser";
import _ from "lodash";

// user router to get information about or edit users
export const userRouter = createProtectedRouter()
  // query for information about current user
  .query("me", {
    async resolve({ ctx }) {
      const id = ctx.session.user?.id;
      const user = await ctx.prisma.user.findUnique({
        where: { id },
      });

      // throws TRPCError if no user with ID exists
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No profile with id '${id}'`,
        });
      }

      return user;
    },
  })
  // edits a user
  .mutation("edit", {
    input: z.object({
      role: z.nativeEnum(Role),
      status: z.nativeEnum(Status),
      seatAvail: z.number().int().min(0),
      companyName: z.string().min(1),
      companyAddress: z.string().min(1),
      companyCoordLng: z.number(),
      companyCoordLat: z.number(),
      startAddress: z.string().min(1),
      startCoordLng: z.number(),
      startCoordLat: z.number(),
      preferredName: z.string(),
      pronouns: z.string(),
      isOnboarded: z.boolean(),
      daysWorking: z.string(),
      startTime: z.optional(z.string()),
      endTime: z.optional(z.string()),
    }),

    async resolve({ ctx, input }) {
      const startTimeDate = input.startTime
        ? new Date(Date.parse(input.startTime))
        : undefined;
      const endTimeDate = input.endTime
        ? new Date(Date.parse(input.endTime))
        : undefined;
      const [startPOIData, endPOIData] = await Promise.all([
        generatePoiData(input.startCoordLng, input.startCoordLat),
        generatePoiData(input.companyCoordLng, input.companyCoordLat),
      ]);

      const id = ctx.session.user?.id;
      const user = await ctx.prisma.user.update({
        where: { id },
        data: {
          role: input.role,
          status: input.status,
          seatAvail: input.seatAvail,
          companyName: input.companyName,
          companyAddress: input.companyAddress,
          companyCoordLng: input.companyCoordLng,
          companyCoordLat: input.companyCoordLat,
          startAddress: input.startAddress,
          startCoordLng: input.startCoordLng,
          startCoordLat: input.startCoordLat,
          startPOILocation: startPOIData.location,
          startPOICoordLng: startPOIData.coordLng,
          startPOICoordLat: startPOIData.coordLat,
          companyPOIAddress: endPOIData.location,
          companyPOICoordLng: endPOIData.coordLng,
          companyPOICoordLat: endPOIData.coordLat,
          preferredName: input.preferredName,
          pronouns: input.pronouns,
          isOnboarded: input.isOnboarded,
          daysWorking: input.daysWorking,
          startTime: startTimeDate,
          endTime: endTimeDate,
        },
      });

      return user;
    },
  })
  // Generates a list of recommendations for the current user
  .query("recommendations", {
    resolve: async ({ ctx }) => {
      const id = ctx.session.user?.id;
      const currentUser = await ctx.prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No user with id ${id}.`,
        });
      }
      const users = await ctx.prisma.user.findMany({
        where: {
          id: {
            not: id, // doesn't include the current user
          },
          isOnboarded: true, // only include user that have finished onboarding
          status: Status.ACTIVE, // only include active users
        },
      });

      const recs = _.compact(users.map(calculateScore(currentUser)));
      recs.sort((a, b) => a.score - b.score);
      const sortedUsers = recs.map((rec) =>
        users.find((user) => user.id === rec.id)
      );
      return Promise.all(sortedUsers.map((user) => convertToPublic(user!)));
    },
  })
  // Returns the list of favorites for the curent user
  .query("favorites", {
    async resolve({ ctx }) {
      const id = ctx.session.user?.id;
      const user = await ctx.prisma.user.findUnique({
        where: { id },
        select: {
          favorites: true,
        },
      });

      // throws TRPCError if no user with ID exists
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No profile with id '${id}'`,
        });
      }

      return Promise.all(user.favorites.map(convertToPublic));
    },
  })
  .mutation("favorites", {
    input: z.object({
      userId: z.string(),
      favoriteId: z.string(),
      add: z.boolean(),
    }),

    async resolve({ ctx, input }) {
      await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          favorites: {
            [input.add ? "connect" : "disconnect"]: { id: input.favoriteId },
          },
        },
      });
    },
  });
