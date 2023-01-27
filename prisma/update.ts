import { PrismaClient, Role, Prisma, Status } from "@prisma/client";
const prisma = new PrismaClient();
type PrismaUser =
  | Prisma.UserUpdateManyWithoutFavoritedByNestedInput
  | Prisma.UserUncheckedUpdateManyWithoutFavoritedByNestedInput;
/**
 * Creates users and adds them to the database
 */
const updateUserData = async () => {
  const users = (await prisma.user.findMany()) as PrismaUser[];
  console.log(users);
  Promise.all(
    users.map((user, idx) =>
      prisma.user.update({
        where: {
          id: `${idx}`,
        },
        data: {
          favorites: {
            connect: { id: `${(idx + 1) % users.length}` },
          },
        },
      })
    )
  );
};
/**
 * Runs the database seeding functions
 */
const main = async () => {
  await updateUserData();
};
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
