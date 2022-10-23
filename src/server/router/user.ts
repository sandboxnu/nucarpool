import { TRPCError } from "@trpc/server";
import { resolve } from "path";
import { z } from "zod";
import { createProtectedRouter } from "./createProtectedRouter";
import { Role, User } from "@prisma/client";
import { Status } from "@prisma/client";
import { Feature, FeatureCollection } from "geojson";
import calculateScore, { Recommendation } from "../../utils/recommendation";
import _ from "lodash";

// user router to get information about or edit users 
export const userRouter = createProtectedRouter()
  // query for information about current user 
  .query("me", {
    async resolve({ ctx }) {
      const id = ctx.session.user?.id;
      const user = await ctx.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          status: true,
          seatAvail: true,
          companyName: true,
          companyAddress: true,
          companyCoordLng: true,
          companyCoordLat: true,
          startLocation: true,
        },
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
      startLocation: z.string().min(1),
      isOnboarded: z.boolean(),
    }),
    async resolve({ ctx, input }) {
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
          startLocation: input.startLocation,
          isOnboarded: input.isOnboarded,
        },
      });

      return user;
    },
  })
  // Generates a list of recommendations for the current user
  .query("recommendations", {
    resolve: async ({ctx}) => {
      const id = ctx.session.user?.id
      const currentUser = await ctx.prisma.user.findUnique({
        where: {
          id: id
        }
      })
      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No user with id ${id}.`
        })
      }
      const users = await ctx.prisma.user.findMany({
        where: {
          id: {
            not: id, // doesn't include the current user
          },
          isOnboarded: true, // only include user that have finished onboarding
          status: Status.ACTIVE, // only include active users
        }
      })
      const recs = _.compact(users.map(calculateScore(currentUser)))
      recs.sort((a, b) => a.score - b.score)
      return recs
    }
  });
