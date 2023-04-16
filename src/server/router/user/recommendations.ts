import { TRPCError } from "@trpc/server";
import { createProtectedRouter } from "../createProtectedRouter";
import _ from "lodash";
import { convertToPublic } from "../../../utils/publicUser";
import { Status } from "@prisma/client";
import calculateScore from "../../../utils/recommendation";

// use this router to manage invitations
export const recommendationsRouter = createProtectedRouter()
  // Generates a list of recommendations for the current user
  .query("me", {
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
  });
