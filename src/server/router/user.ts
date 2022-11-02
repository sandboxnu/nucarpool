import { TRPCError } from "@trpc/server";
import { resolve } from "path";
import { z } from "zod";
import { createProtectedRouter } from "./createProtectedRouter";
import { Role } from "@prisma/client";
import { Status } from "@prisma/client";
import { Feature, FeatureCollection } from "geojson";

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
          daysWorking: true,
          startTime: true,
          endTime: true,
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
      daysWorking: z.string(),
      startTime: z.string(),
      endTime: z.string(),
    }),

    async resolve({ ctx, input }) {
      const [startHour, startMinute] = input.startTime.split(":");
      const startTimeDate = new Date();
      startTimeDate.setHours(Number(startHour));
      startTimeDate.setMinutes(Number(startMinute));

      const [endHour, endMinute] = input.endTime.split(":");
      const endTimeDate = new Date();
      endTimeDate.setHours(Number(endHour));
      endTimeDate.setMinutes(Number(endMinute));

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
          daysWorking: input.daysWorking,
          startTime: startTimeDate,
          endTime: endTimeDate,
        },
      });

      return user;
    },
  });
