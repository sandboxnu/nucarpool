import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedRouter } from "../createRouter";
import _ from "lodash";
import { Request, User } from "@prisma/client";
import { convertToPublic } from "../../../utils/publicUser";
import { PublicUser, ResolvedRequest } from "../../../utils/types";

// use this router to manage invitations
export const requestsRouter = router({
  me: protectedRouter.query(async ({ ctx }) => {
    const userId = ctx.session.user?.id;

    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
    });

    // Throw error if no user with ID exists
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No profile with id '${userId}'`,
      });
    }

    const resolveRequest = async (req: Request) => {
      const [from, to] = await Promise.all([
        ctx.prisma.user.findUnique({
          where: { id: req.fromUserId },
        }),
        ctx.prisma.user.findUnique({
          where: { id: req.toUserId },
        }),
      ]);

      if (!from) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No user with id '${req.fromUserId}'`,
        });
      }

      if (!to) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No user with id '${req.toUserId}'`,
        });
      }

      let toUser: User | PublicUser;
      let fromUser: User | PublicUser;

      if (from.id === userId) {
        fromUser = from;
      } else {
        fromUser = convertToPublic(from);
      }

      if (to.id === userId) {
        toUser = to;
      } else {
        toUser = convertToPublic(to);
      }

      // Fetch conversation and messages associated with the request
      const conversation = await ctx.prisma.conversation.findUnique({
        where: { requestId: req.id },
        include: {
          messages: {
            orderBy: { dateCreated: "asc" },
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  preferredName: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return { ...req, fromUser, toUser, conversation };
    };
    // Fetch sent and received requests and include conversations and messages
    const [sent, received] = await Promise.all([
      ctx.prisma.request
        .findMany({
          where: { fromUserId: userId },
        })
        .then((reqs) => Promise.all(reqs.map(resolveRequest))),
      ctx.prisma.request
        .findMany({
          where: { toUserId: userId },
        })
        .then((reqs) => Promise.all(reqs.map(resolveRequest))),
    ]);

    return { sent, received };
  }),

  create: protectedRouter
    .input(
      z.object({
        fromId: z.string(),
        toId: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingRequests = await ctx.prisma.request.findMany({
        where: {
          OR: [
            {
              fromUserId: input.fromId,
              toUserId: input.toId,
            },
            {
              fromUserId: input.toId,
              toUserId: input.fromId,
            },
          ],
        },
      });

      if (existingRequests.length != 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Existing request between '${input.toId} and ${input.fromId}'`,
        });
      }

      await ctx.prisma.request.create({
        data: {
          message: input.message,
          fromUser: {
            connect: { id: input.fromId },
          },
          toUser: {
            connect: { id: input.toId },
          },
        },
      });
    }),

  delete: protectedRouter
    .input(
      z.object({
        invitationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.prisma.request.findUnique({
        where: { id: input.invitationId },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No invitation with id '${input.invitationId}'`,
        });
      }

      await ctx.prisma.request.delete({
        where: {
          id: input.invitationId,
        },
      });
    }),
  edit: protectedRouter
    .input(
      z.object({
        invitationId: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.request.update({
        where: { id: input.invitationId },
        data: {
          message: input.message,
        },
      });
      return user;
    }),
});
