import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./createProtectedRouter";
import { Role } from "@prisma/client";
import { Status } from "@prisma/client";
import { generatePoiData } from "../../utils/publicUser";
import _ from "lodash";
import { favoritesRouter } from "./user/favorites";
import { groupsRouter } from "./user/groups";
import { requestsRouter } from "./user/requests";
import { recommendationsRouter } from "./user/recommendations";
import { convertToPublic } from "../../utils/publicUser";

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
      bio: z.string(),
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
          bio: input.bio,
        },
      });

      return user;
    },
  })
  .merge("favorites.", favoritesRouter)
  .merge("groups.", groupsRouter)
  .merge("requests.", requestsRouter)
  .merge("recommendations.", recommendationsRouter);
