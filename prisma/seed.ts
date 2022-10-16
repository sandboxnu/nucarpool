import { PrismaClient, Role, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type GenerateUserInput = {
  companyCoordLng: number,
  companyCoordLat: number,
  startCoordLng: number,
  startCoordLat: number,
  daysWorking: string
  startTime: string,
  endTime: string
} & ({
  role: "RIDER"
  seatAvail: undefined
} | {
  role: "DRIVER",
  seatAvail: number
})

const generateUser = ({
  id,
  role,
  seatAvail,
  companyCoordLng,
  companyCoordLat,
  startCoordLng,
  startCoordLat,
  daysWorking,
  startTime,
  endTime
}: GenerateUserInput & {id: string}): Prisma.UserUpsertArgs => {
  return {
    where: {id: id},
    update: {},
    create: {
      id: id,
      name: `User ${id}`,
      email: `user${id}@hotmail.com`,
      emailVerified: new Date("2022-10-14 19:26:21"),
      image: null,
      bio: `My name is User ${id}. I like to drive`,
      pronouns: "they/them",
      role: role,
      status: 'ACTIVE',
      seatAvail: seatAvail,
      companyName: "Sandbox Inc.",
      companyAddress: "360 Huntington Ave",
      companyCoordLng: companyCoordLng,
      companyCoordLat: companyCoordLat,
      startLocation: "Roxbury",
      startCoordLng: startCoordLng,
      startCoordLat: startCoordLat,
      isOnboarded: true,
      daysWorking: daysWorking,
      startTime: new Date(startTime),
      endTime: new Date(endTime)
    }
  };
};

const createUserData = async () => {
  const users: GenerateUserInput[] = [
    {
      role: "DRIVER",
      seatAvail: 2,
      startTime: "09:30",
      startCoordLat: 42.30,
      startCoordLng: -71.15,
      endTime: "16:30",
      companyCoordLat: 42.355625,
      companyCoordLng: -71.060752,
      daysWorking: "1,2,3,4,5"
    },
  ]

  return Promise.all(users.map((user, index) => {
    prisma.user.upsert(generateUser({id: index.toString(), ...user}))
  }))
}

const main = async () => {
  await createUserData();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });


