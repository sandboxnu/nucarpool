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
    const userId = ctx.session.user?.id;

    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    // get user with CarpoolSearch data
    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      include: {
        carpoolSearches: {
          include: {
            homeLocation: true,
            companyLocation: true,
          },
        },
      },
    });

    // throws TRPCError if no user with ID exists
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No profile with id '${userId}'`,
      });
    }

    // get the first (active) CarpoolSearch
    const carpoolSearch = user.carpoolSearches[0];

    // merge CarpoolSearch data into user object for backwards compatibility
    return {
      ...user,
      // CarpoolSearch data
      role: carpoolSearch?.role ?? Role.VIEWER,
      status: carpoolSearch?.status ?? Status.ACTIVE,
      seatAvail: carpoolSearch?.seatsAvail ?? 0,
      companyName: carpoolSearch?.companyName ?? '',
      daysWorking: carpoolSearch?.daysWorking ?? '',
      startTime: carpoolSearch?.startTime ?? null,
      endTime: carpoolSearch?.endTime ?? null,
      coopStartDate: carpoolSearch?.startDate ?? null,
      coopEndDate: carpoolSearch?.endDate ?? null,
      groupMessage: carpoolSearch?.groupMessage ?? null,
      carpoolId: carpoolSearch?.carpoolId ?? null,
      // Location data (homeLocation)
      startCoordLng: carpoolSearch?.homeLocation?.coordLng ?? 0,
      startCoordLat: carpoolSearch?.homeLocation?.coordLat ?? 0,
      startStreet: carpoolSearch?.homeLocation?.street ?? '',
      startCity: carpoolSearch?.homeLocation?.city ?? '',
      startState: carpoolSearch?.homeLocation?.state ?? '',
      startAddress: carpoolSearch?.homeLocation?.streetAddress ?? '',
      // Location data (companyLocation)
      companyCoordLng: carpoolSearch?.companyLocation?.coordLng ?? 0,
      companyCoordLat: carpoolSearch?.companyLocation?.coordLat ?? 0,
      companyStreet: carpoolSearch?.companyLocation?.street ?? '',
      companyCity: carpoolSearch?.companyLocation?.city ?? '',
      companyState: carpoolSearch?.companyLocation?.state ?? '',
      companyAddress: carpoolSearch?.companyLocation?.streetAddress ?? '',
      // POI fields (empty defaults for now)
      companyPOIAddress: '',
      companyPOICoordLng: 0,
      companyPOICoordLat: 0,
      startPOILocation: '',
      startPOICoordLng: 0,
      startPOICoordLat: 0,
    };
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
      if (!id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      await ctx.prisma.user.update({
        where: { id },
        data: {
          preferredName: input.preferredName,
          pronouns: input.pronouns,
          isOnboarded: input.isOnboarded,
          bio: input.bio,
          licenseSigned: input.licenseSigned,
        },
      });

      // home location - find or create
      let homeLocation = await ctx.prisma.location.findFirst({
        where: {
          street: input.startStreet,
          city: input.startCity,
          state: input.startState,
          streetAddress: input.startAddress,
        },
      });

      if (!homeLocation) {
        homeLocation = await ctx.prisma.location.create({
          data: {
            street: input.startStreet,
            city: input.startCity,
            state: input.startState,
            streetAddress: input.startAddress,
            coordLng: input.startCoordLng,
            coordLat: input.startCoordLat,
          },
        });
      }

      // company location - find or create
      let companyLocation = await ctx.prisma.location.findFirst({
        where: {
          street: input.companyStreet,
          city: input.companyCity,
          state: input.companyState,
          streetAddress: input.companyAddress,
        },
      });

      if (!companyLocation) {
        companyLocation = await ctx.prisma.location.create({
          data: {
            street: input.companyStreet,
            city: input.companyCity,
            state: input.companyState,
            streetAddress: input.companyAddress,
            coordLng: input.companyCoordLng,
            coordLat: input.companyCoordLat,
          },
        });
      }

      // CarpoolSearch - find or create
      const existingSearch = await ctx.prisma.carpoolSearch.findFirst({
        where: { userId: id },
      });

      const carpoolSearchData = {
        role: input.role,
        status: input.status,
        seatsAvail: input.seatAvail,
        companyName: input.companyName,
        daysWorking: input.daysWorking,
        startTime: startTimeDate,
        endTime: endTimeDate,
        startDate: input.coopStartDate,
        endDate: input.coopEndDate,
        homeLocationId: homeLocation.id,
        companyLocationId: companyLocation.id,
      };

      if (existingSearch) {
        await ctx.prisma.carpoolSearch.update({
          where: { id: existingSearch.id },
          data: carpoolSearchData,
        });
      } else {
        await ctx.prisma.carpoolSearch.create({
          data: {
            userId: id,
            carpoolId: null,
            groupMessage: null,
            ...carpoolSearchData,
          },
        });
      }

      // return the updated user with CarpoolSearch data
      const updatedUser = await ctx.prisma.user.findUnique({
        where: { id },
        include: {
          carpoolSearches: {
            include: {
              homeLocation: true,
              companyLocation: true,
            },
          },
        },
      });

      return updatedUser;
    }),

  getPresignedUrl: protectedRouter
    .input(
      z.object({
        contentType: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<{ url: string } | undefined> => {
      const { contentType } = input;
      const fileName: string | undefined = ctx.session.user?.id;
      if (fileName) {
        try {
          const url: string = await generatePresignedUrl(fileName, contentType);
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
    .query(async ({ ctx, input }): Promise<{ url: string } | undefined> => {
      const userId: string | undefined = input.userId ?? ctx.session.user?.id;
      if (userId) {
        try {
          const url = await getPresignedImageUrl(userId);
          if (url) {
            return { url };
          }
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate a pre-signed URL",
          });
        }
      }
    }),

  // merging secondary user routes
  favorites: favoritesRouter,
  messages: messageRouter,
  recommendations: recommendationsRouter,
  requests: requestsRouter,
  groups: groupsRouter,
  emails: emailsRouter,
  admin: adminDataRouter,
});
