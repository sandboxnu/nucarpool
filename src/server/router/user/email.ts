import { z } from "zod";
import { router, protectedRouter } from "../createRouter";
import { generateEmailParams, RequestEmailSchema, MessageEmailSchema, AcceptanceEmailSchema } from "../../../utils/email";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";

const gmailEmailSchema = z.string().email().refine(
  (email) => email.toLowerCase().endsWith('@gmail.com'),
  { message: "Only gmail.com email addresses are accepted" }
);

export const emailsRouter = router({
  sendRequestNotification: protectedRouter
    .input(
      z.object({
        senderName: z.string(),
        senderEmail: gmailEmailSchema,
        receiverName: z.string(),
        receiverEmail: gmailEmailSchema,
        isDriver: z.boolean(),
        messagePreview: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const emailParams = generateEmailParams(input as RequestEmailSchema, 'request');
      const response = await ctx.sesClient.send(new SendTemplatedEmailCommand(emailParams));
      return response;
    }),

  sendMessageNotification: protectedRouter
    .input(
      z.object({
        senderName: z.string(),
        senderEmail: gmailEmailSchema,
        receiverName: z.string(),
        receiverEmail: gmailEmailSchema,
        messageText: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const emailParams = generateEmailParams(input as MessageEmailSchema, 'message');
      const response = await ctx.sesClient.send(new SendTemplatedEmailCommand(emailParams));
      return response;
    }),

  sendAcceptanceNotification: protectedRouter
    .input(
      z.object({
        senderName: z.string(),
        senderEmail: gmailEmailSchema,
        receiverName: z.string(),
        receiverEmail: gmailEmailSchema,
        isDriver: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const emailParams = generateEmailParams(input as AcceptanceEmailSchema, 'acceptance');
      const response = await ctx.sesClient.send(new SendTemplatedEmailCommand(emailParams));
      return response;
    }),
});