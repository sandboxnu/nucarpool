import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedRouter } from "../createRouter";
import _ from "lodash";
import { Role } from "@prisma/client";
import { convertToPublic } from "../../../utils/publicUser";

// use this router to create and manage groups
export const groupsRouter = router({
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

    if (!user.carpoolId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User does not have a carpool group",
      });
    }

    const group = await ctx.prisma.carpoolGroup.findUnique({
      where: {
        id: user.carpoolId,
      },
      include: {
        users: true,
      },
    });

    const updatedGroup = {
      ...group,
      users: group?.users.map(convertToPublic),
    };
    return updatedGroup;
  }),
  create: protectedRouter
    .input(
      z.object({
        driverId: z.string(),
        riderId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const driver = await ctx.prisma.user.findUnique({
        where: { id: input.driverId },
      });

      if (!driver) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Driver not found",
        });
      }

      const group = await ctx.prisma.carpoolGroup.create({
        data: {
          users: {
            connect: { id: input.driverId },
          },
          message: driver.groupMessage || "",
        },
      });

      const nGroup = await ctx.prisma.carpoolGroup.update({
        where: { id: group.id },
        data: {
          users: {
            connect: { id: input.riderId },
          },
        },
      });

      await ctx.prisma.user.update({
        where: { id: input.driverId },
        data: {
          seatAvail: {
            decrement: 1,
          },
        },
      });
      return nGroup;
    }),
  delete: protectedRouter
    .input(
      z.object({
        groupId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.carpoolGroup.findUnique({
        where: {
          id: input.groupId,
        },
        include: {
          users: true,
        },
      });
      const usrLength = group ? group.users.length - 1 : 0;

      const currentUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user?.id },
        select: { seatAvail: true }
      });

      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const newSeatAvail = Math.min(currentUser.seatAvail + usrLength, 6);

      await ctx.prisma.user.update({
        where: { id: ctx.session.user?.id },
        data: {
          seatAvail: newSeatAvail,
        },
      });

      const deleteResult = await ctx.prisma.carpoolGroup.delete({
        where: {
          id: input.groupId,
        },
      });
      return deleteResult;
    }),
  edit: protectedRouter
    .input(
      z.object({
        driverId: z.string(),
        riderId: z.string(),
        groupId: z.string(),
        add: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const driver = await ctx.prisma.user.findUnique({
        where: { id: input.driverId },
      });

      if (driver?.seatAvail === 0 && input.add) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Driver does not have space available in their car",
        });
      }

      const group = await ctx.prisma.carpoolGroup.update({
        where: { id: input.groupId },
        data: {
          users: {
            [input.add ? "connect" : "disconnect"]: { id: input.riderId },
          },
        },
      });

      const updatedGroup = await ctx.prisma.carpoolGroup.findUnique({
        where: { id: group.id },
        include: {
          users: true,
        },
      });

      if (updatedGroup?.users.length === 1) {
        await ctx.prisma.carpoolGroup.delete({
          where: { id: updatedGroup.id },
        });
      }

      if (input.add) {
        await ctx.prisma.user.update({
          where: { id: input.driverId },
          data: {
            seatAvail: {
              decrement: 1,
            },
          },
        });
      } else {
        const currentDriver = await ctx.prisma.user.findUnique({
          where: { id: input.driverId },
          select: { seatAvail: true }
        });

        if (!currentDriver) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Driver not found",
          });
        }

        const newSeatAvail = Math.min(currentDriver.seatAvail + 1, 6);

        await ctx.prisma.user.update({
          where: { id: input.driverId },
          data: {
            seatAvail: newSeatAvail,
          },
        });
      }

      if (!updatedGroup) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Group does not exist",
        });
      }
      return updatedGroup;
    }),
  updateMessage: protectedRouter
    .input(
      z.object({
        groupId: z.string(),
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedGroup = await ctx.prisma.carpoolGroup.update({
        where: { id: input.groupId },
        data: {
          message: input.message,
        },
      });
      return updatedGroup;
    }),
  updateUserMessage: protectedRouter
    .input(
      z.object({
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.session.user?.id },
        data: {
          groupMessage: input.message,
        },
      });
      return updatedUser;
    }),
});
