import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedRouter } from "../createRouter";
import _ from "lodash";
import { Role, CarpoolGroup, User } from "@prisma/client";
import { convertCarpoolSearchToPublic } from "../../../utils/publicUser";

// use this router to create and manage groups
export const groupsRouter = router({
  me: protectedRouter.query(async ({ ctx }) => {
    const userId = ctx.session.user?.id;
    
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated.",
      });
    }

    const carpoolSearch = await ctx.prisma.carpoolSearch.findFirst({
      where: { userId },
    });

    // throws TRPCError if no user with ID exists
    if (!carpoolSearch) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No carpool search found for user ${userId}.`,
      });
    }

    if (!carpoolSearch.carpoolId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User does not have a carpool group",
      });
    }

    const group = await ctx.prisma.carpoolGroup.findUnique({
      where: {
        id: carpoolSearch.carpoolId,
      },
    });

    // get all CarpoolSearches that reference this group
    const memberCarpoolSearches = await ctx.prisma.carpoolSearch.findMany({
      where: {
        carpoolId: carpoolSearch.carpoolId,
      },
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
          }
        },
        homeLocation: true,
        companyLocation: true,
      },
    });

    const updatedGroup = {
      ...group,
      users: memberCarpoolSearches.map(convertCarpoolSearchToPublic),
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
      const driverSearch = await ctx.prisma.carpoolSearch.findFirst({
        where: { userId: input.driverId },
      });

      if (!driverSearch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Driver not found",
        });
      }

      const group = await ctx.prisma.carpoolGroup.create({
        data: {
          message: driverSearch.groupMessage || "",
        },
      });

      // update driver's CarpoolSearch
      await ctx.prisma.carpoolSearch.updateMany({
        where: { userId: input.driverId },
        data: { carpoolId: group.id },
      });

      // update rider's CarpoolSearch
      await ctx.prisma.carpoolSearch.updateMany({
        where: { userId: input.riderId },
        data: { carpoolId: group.id },
      });

      // decrement driver's available seats
      const existingSearch = await ctx.prisma.carpoolSearch.findFirst({
        where: { userId: input.driverId },
      });

      if (existingSearch) {
        await ctx.prisma.carpoolSearch.update({
          where: { id: existingSearch.id },
          data: {
            seatsAvail: {
              decrement: 1,
            },
          },
        });
      }

      return group;
    }),
  delete: protectedRouter
    .input(
      z.object({
        groupId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find all CarpoolSearches that reference this group
      const memberCarpoolSearches = await ctx.prisma.carpoolSearch.findMany({
        where: { carpoolId: input.groupId },
        include: { user: true },
      });

      // clear carpoolId for all group members
      await ctx.prisma.carpoolSearch.updateMany({
        where: {
          carpoolId: input.groupId,
        },
        data: { carpoolId: null },
      });

      const usrLength = memberCarpoolSearches.length - 1;

      const currentUserId = ctx.session.user?.id;
      if (!currentUserId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const currentUserSearch = await ctx.prisma.carpoolSearch.findFirst({
        where: { userId: currentUserId },
        select: { seatsAvail: true }
      });

      if (!currentUserSearch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User carpool search not found",
        });
      }

      const newSeatAvail = Math.min(currentUserSearch.seatsAvail + usrLength, 6);

      // update seats available in CarpoolSearch
      const existingSearch = await ctx.prisma.carpoolSearch.findFirst({
        where: { userId: currentUserId },
      });

      if (existingSearch) {
        await ctx.prisma.carpoolSearch.update({
          where: { id: existingSearch.id },
          data: {
            seatsAvail: newSeatAvail,
          },
        });
      }

      return await ctx.prisma.carpoolGroup.delete({
        where: {
          id: input.groupId,
        },
      });
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
      const driverSearch = await ctx.prisma.carpoolSearch.findFirst({
        where: { userId: input.driverId },
      });

      if (driverSearch && driverSearch.seatsAvail === 0 && input.add) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Driver does not have space available in their car",
        });
      }

      if (input.add) {
        // when adding rider, set carpoolId for the rider
        await ctx.prisma.carpoolSearch.updateMany({
          where: { userId: input.riderId },
          data: { carpoolId: input.groupId },
        });
      } else {
        // when removing rider, clear carpoolId for the rider
        await ctx.prisma.carpoolSearch.updateMany({
          where: { userId: input.riderId },
          data: { carpoolId: null },
        });
      }

      // Check if group should be deleted (only 1 member left)
      const remainingMembers = await ctx.prisma.carpoolSearch.findMany({
        where: { carpoolId: input.groupId },
      });

      if (remainingMembers.length === 1) {
        await ctx.prisma.carpoolGroup.delete({
          where: { id: input.groupId },
        });
      }

      if (input.add) {
        // decrement driver's available seats
        const existingSearch = await ctx.prisma.carpoolSearch.findFirst({
          where: { userId: input.driverId },
        });

        if (existingSearch) {
          await ctx.prisma.carpoolSearch.update({
            where: { id: existingSearch.id },
            data: {
              seatsAvail: {
                decrement: 1,
              },
            },
          });
        }
      } else {
        const currentDriverSearch = await ctx.prisma.carpoolSearch.findFirst({
          where: { userId: input.driverId },
          select: { seatsAvail: true }
        });

        if (!currentDriverSearch) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Driver not found",
          });
        }

        const newSeatAvail = Math.min(currentDriverSearch.seatsAvail + 1, 6);

        // increment driver's available seats
        const existingSearch = await ctx.prisma.carpoolSearch.findFirst({
          where: { userId: input.driverId },
        });

        if (existingSearch) {
          await ctx.prisma.carpoolSearch.update({
            where: { id: existingSearch.id },
            data: {
              seatsAvail: newSeatAvail,
            },
          });
        }
      }

      const group = await ctx.prisma.carpoolGroup.findUnique({
        where: { id: input.groupId },
      });

      if (!group) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Group does not exist",
        });
      }

      // Get all members via CarpoolSearch
      const memberCarpoolSearches = await ctx.prisma.carpoolSearch.findMany({
        where: { carpoolId: input.groupId },
        include: { user: true },
      });

      const updatedGroup = {
        ...group,
        users: memberCarpoolSearches.map(cs => cs.user),
      };

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
      const userId = ctx.session.user?.id;
      
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      // update groupMessage in CarpoolSearch
      const updatedSearch = await ctx.prisma.carpoolSearch.findFirst({
        where: { userId },
      });

      if (updatedSearch) {
        await ctx.prisma.carpoolSearch.update({
          where: { id: updatedSearch.id },
          data: {
            groupMessage: input.message,
          },
        });
      }

      // return user for backward compatibility
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),
});
