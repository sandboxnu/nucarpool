import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedRouter, router } from "./createRouter";
import { Role } from "@prisma/client";
import { Status } from "@prisma/client";
import _ from "lodash";
import { favoritesRouter } from "./user/favorites";
import { groupsRouter } from "./user/groups";
import { requestsRouter } from "./user/requests";
import { messageRouter } from "./user/message";
import { recommendationsRouter } from "./user/recommendations";
import { emailsRouter } from "./user/email";
import {
  generatePresignedUrl,
  getPresignedImageUrl,
} from "../../utils/uploadToS3";
import { adminDataRouter } from "./user/admin";
const getPresignedDownloadUrlInput = z.object({
  userId: z.string().optional(),
});
// user router to get information about or edit users
export const userRouter = router({
  me: protectedRouter.query(async ({ ctx }) => {
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
  }),

  edit: protectedRouter
    .input(
      z.object({
        role: z.nativeEnum(Role),
        status: z.nativeEnum(Status),
        seatAvail: z.number().int().min(0).max(6),
        companyName: z.string(),
        companyAddress: z.string(),
        companyCoordLng: z.number(),
        companyCoordLat: z.number(),
        startAddress: z.string(),
        startCoordLng: z.number(),
        startCoordLat: z.number(),
        preferredName: z.string(),
        pronouns: z.string(),
        isOnboarded: z.boolean(),
        daysWorking: z.string(),
        startTime: z.optional(z.string()),
        endTime: z.optional(z.string()),
        coopStartDate: z.date().nullable(),
        coopEndDate: z.date().nullable(),
        bio: z.string(),
        licenseSigned: z.boolean(),
        startStreet: z.string(),
        startCity: z.string(),
        startState: z.string(),
        companyStreet: z.string(),
        companyCity: z.string(),
        companyState: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const startTimeDate = input.startTime
        ? new Date(Date.parse(input.startTime))
        : undefined;
      const endTimeDate = input.endTime
        ? new Date(Date.parse(input.endTime))
        : undefined;

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
          companyStreet: input.companyStreet,
          companyCity: input.companyCity,
          companyState: input.companyState,
          startStreet: input.startStreet,
          startCity: input.startCity,
          startState: input.startState,
          preferredName: input.preferredName,
          pronouns: input.pronouns,
          isOnboarded: input.isOnboarded,
          daysWorking: input.daysWorking,
          startTime: startTimeDate,
          endTime: endTimeDate,
          coopEndDate: input.coopEndDate,
          coopStartDate: input.coopStartDate,
          bio: input.bio,
          licenseSigned: input.licenseSigned,
        },
      });

      return user;
    }),

  getPresignedUrl: protectedRouter
    .input(
      z.object({
        contentType: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { contentType } = input;
      const fileName = ctx.session.user?.id;
      if (fileName) {
        try {
          const url = await generatePresignedUrl(fileName, contentType);
          return { url };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate a pre-signed URL",
          });
        }
      }
    }),
  getPresignedDownloadUrl: protectedRouter
    .input(getPresignedDownloadUrlInput)
    .query(async ({ ctx, input }) => {
      const userId = input.userId ?? ctx.session.user?.id;
      if (userId) {
        try {
          const url = await getPresignedImageUrl(userId);
          return { url };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate a pre-signed URL",
          });
        }
      }
    }),

  //merging secondary user routes
  favorites: favoritesRouter,
  messages: messageRouter,
  recommendations: recommendationsRouter,
  requests: requestsRouter,
  groups: groupsRouter,
  emails: emailsRouter,
  admin: adminDataRouter,
});
