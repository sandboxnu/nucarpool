import { z } from "zod";
import { Role, Status } from "@prisma/client";

const custom = z.ZodIssueCode.custom;
export const onboardSchema = z
  .object({
    role: z.nativeEnum(Role),
    status: z.nativeEnum(Status),
    seatAvail: z.number().int().nonnegative().max(6).optional(),
    companyName: z.string().optional(),
    companyAddress: z.string().optional(),
    startAddress: z.string().optional(),
    preferredName: z.string().optional(),
    pronouns: z.string().optional(),
    daysWorking: z.array(z.boolean()).optional(),
    bio: z.string().optional(),
    startTime: z.date().nullable().optional(),
    endTime: z.date().nullable().optional(),
    coopStartDate: z.date().nullable().optional(),
    coopEndDate: z.date().nullable().optional(),
    timeDiffers: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== Role.VIEWER) {
      if (!data.coopEndDate) {
        ctx.addIssue({
          code: custom,
          path: ["coopEndDate"],
          message: "Cannot be empty",
        });
      }
      if (!data.coopStartDate) {
        ctx.addIssue({
          code: custom,
          path: ["coopStartDate"],
          message: "Cannot be empty",
        });
      }
      if (!data.seatAvail && data.seatAvail !== 0)
        ctx.addIssue({
          code: custom,
          path: ["seatAvail"],
          message: "Cannot be empty",
        });
      if (data.companyName?.length === 0)
        ctx.addIssue({
          code: custom,
          path: ["companyName"],
          message: "Cannot be empty",
        });
      if (data.companyAddress?.length === 0)
        ctx.addIssue({
          code: custom,
          path: ["companyAddress"],
          message: "Cannot be empty",
        });
      if (data.startAddress?.length === 0)
        ctx.addIssue({
          code: custom,
          path: ["startAddress"],
          message: "Cannot be empty",
        });
      if (!data.daysWorking?.some(Boolean))
        ctx.addIssue({
          code: custom,
          path: ["daysWorking"],
          message: "Select at least one day",
        });

      if (!data.timeDiffers) {
        if (!data.startTime)
          ctx.addIssue({
            code: custom,
            path: ["startTime"],
            message: "Start time must be provided",
          });
        if (!data.endTime)
          ctx.addIssue({
            code: custom,
            path: ["endTime"],
            message: "End time must be provided",
          });
      }
    }
  });
