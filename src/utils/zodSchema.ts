import { Role, Status, User } from "@prisma/client";
import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(1, "Cannot be empty"),
  lastName: z.string().min(1, "Cannot be empty"),
  rdStatus: z.enum(["rider", "driver"]),
  seatsAvailability: z
    .number({ invalid_type_error: "Cannot be empty" })
    .int("Must be an integer")
    .nonnegative("Must be greater or equal to 0"),
  companyName: z.string().min(1, "Cannot be empty"),
  companyAddress: z.string().min(1, "Cannot be empty"),
  status: z.enum(["active", "inactive"]),
});

// export const userSchema: z.ZodType<User> = z.lazy(() =>
//   z.object({
//     id: z.string(),
//     name: z.string(),
//     email: z.string(),
//     emailVerified: z.date(),
//     image: z.string(),
//     bio: z.string(),
//     preferredName: z.string(),
//     pronouns: z.string(),
//     role: z.nativeEnum(Role),
//     status: z.nativeEnum(Status),
//     seatAvail: z
//       .number({ invalid_type_error: "Cannot be empty" })
//       .int("Must be an integer")
//       .nonnegative("Must be greater or equal to 0"),
//     companyName: z.string().min(1, "Cannot be empty"),
//     companyAddress: z.string().min(1, "Cannot be empty"),
//     companyCoordLng: z
//       .number({ invalid_type_error: "Cannot be empty" })
//       .int("Must be an integer")
//       .nonnegative("Must be greater or equal to 0"),
//     companyCoordLat: z
//       .number({ invalid_type_error: "Cannot be empty" })
//       .int("Must be an integer")
//       .nonnegative("Must be greater or equal to 0"),
//     startLocation: z.string(),
//     startCoordLng: z
//       .number({ invalid_type_error: "Cannot be empty" })
//       .int("Must be an integer")
//       .nonnegative("Must be greater or equal to 0"),
//     startCoordLat: z
//       .number({ invalid_type_error: "Cannot be empty" })
//       .int("Must be an integer")
//       .nonnegative("Must be greater or equal to 0"),
//     isOnboarded: z.boolean(),
//     daysWorking: z.string(),
//     startTime: z.date(),
//     endTime: z.date(),
//     favorites: z.array(userSchema),
//     favoritedBy: z.array(userSchema),
//   })
// );
