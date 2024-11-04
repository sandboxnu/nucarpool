import { TRPCError } from "@trpc/server";
import { router, protectedRouter } from "../createRouter";
import _ from "lodash";
import { convertToPublic } from "../../../utils/publicUser";
import { Status } from "@prisma/client";
import { calculateScore } from "../../../utils/recommendation";
import { z } from "zod";

// use this router to manage invitations
export const recommendationsRouter = router({
  me: protectedRouter
    .input(
      z.object({
        days: z.number(), /// 0 for any, 1 for exact
        daysWorking: z.string(),
        flexDays: z.number(),
        startDistance: z.number(), // max 20, greater = any
        endDistance: z.number(),
        startTime: z.number(), // max = 4 hours, greater = any
        endTime: z.number(),
        sort: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        dateOverlap: z.number(), // 0 any, 1 partial, 2 full
      })
    )
    .query(async ({ input, ctx }) => {
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

      const recs = _.compact(users.map(calculateScore(currentUser, input)));
      recs.sort((a, b) => a.score - b.score);
      const sortedUsers = recs.map((rec) =>
        users.find((user) => user.id === rec.id)
      );
      const finalUsers = sortedUsers.slice(0, 20);

      return Promise.all(finalUsers.map((user) => convertToPublic(user!)));
    }),
});
