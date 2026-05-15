import { z } from "zod";
import { router, protectedRouter } from "../createRouter";
import _ from "lodash";
import { generateEmailParams } from "../../../utils/email";
import {
  SendEmailCommand,
  SendTemplatedEmailCommand,
  SendTemplatedEmailCommandInput,
} from "@aws-sdk/client-ses";
const gmailEmailSchema = z
  .string()
  .email()
  .refine(
    (email) =>
      (process.env.NEXT_PUBLIC_ENV === "staging" &&
        email.toLowerCase().endsWith("@gmail.com")) ||
      process.env.NEXT_PUBLIC_ENV !== "staging",
    {
      message:
        "Only gmail.com email addresses are accepted in the staging environment",
    },
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const emailParams = generateEmailParams(input, "request", false);
      try {
        const response = await ctx.sesClient.send(
          new SendTemplatedEmailCommand(emailParams),
        );
        console.log(
          `Request email sent successfully to ${input.receiverEmail}.`,
        );
        console.log("SES Response:", JSON.stringify(response, null, 2));
        return response;
      } catch (error) {
        console.error("Error sending email:", error);
        throw error;
      }
    }),

  sendMessageNotification: protectedRouter
    .input(
      z.object({
        senderName: z.string(),
        senderEmail: gmailEmailSchema,
        receiverName: z.string(),
        receiverEmail: gmailEmailSchema,
        messageText: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const emailParams = generateEmailParams(input, "message", false);
      try {
        const response = await ctx.sesClient.send(
          new SendTemplatedEmailCommand(emailParams),
        );
        console.log(
          `Message notification sent successfully to ${input.receiverEmail}`,
        );
        console.log("SES Response:", JSON.stringify(response, null, 2));
        return response;
      } catch (error) {
        console.error("Error sending message notification:", error);
        throw error;
      }
    }),

  sendAcceptanceNotification: protectedRouter
    .input(
      z.object({
        senderName: z.string(),
        senderEmail: gmailEmailSchema,
        receiverName: z.string(),
        receiverEmail: gmailEmailSchema,
        isDriver: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const emailParams = generateEmailParams(input, "acceptance", true);
      try {
        const response = await ctx.sesClient.send(
          new SendTemplatedEmailCommand(emailParams),
        );
        console.log(
          `Acceptance notification sent successfully to ${input.receiverEmail}. CC: ${input.senderEmail}`,
        );
        console.log("SES Response:", JSON.stringify(response, null, 2));
        return response;
      } catch (error) {
        console.error("Error sending acceptance notification:", error);
        throw error;
      }
    }),

  // Add the connectEmail mutation
  connectEmail: protectedRouter
    .input(
      z.object({
        sendingUserName: z.string(),
        sendingUserEmail: gmailEmailSchema,
        receivingUserName: z.string(),
        receivingUserEmail: gmailEmailSchema,
        body: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const emailParams = generateEmailParams(
        {
          senderName: input.sendingUserName,
          senderEmail: input.sendingUserEmail,
          receiverName: input.receivingUserName,
          receiverEmail: input.receivingUserEmail,
          messageText: input.body,
        },
        "message",
        false,
      );
      try {
        const response = await ctx.sesClient.send(
          new SendTemplatedEmailCommand(emailParams),
        );
        console.log(
          `Connect email sent successfully to ${input.receivingUserEmail}. CC: ${input.sendingUserEmail}`,
        );
        console.log("SES Response:", JSON.stringify(response, null, 2));
        return response;
      } catch (error) {
        console.error("Error sending connect email:", error);
        throw error;
      }
    }),
});
