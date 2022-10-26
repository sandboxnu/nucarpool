import { PrismaClient, Role, Prisma } from "@prisma/client";
import Random from "random-seed"

const prisma = new PrismaClient();

type GenerateUserInput = {
  companyCoordLng: number,
  companyCoordLat: number,
  startCoordLng: number,
  startCoordLat: number,
  daysWorking: string, // Format: S,M,T,W,R,F,S
  startTime: string,
  endTime: string
} & ({
  role: "RIDER"
  seatAvail?: undefined
} | {
  role: "DRIVER",
  seatAvail: number
})

const generateUser = ({
  id,
  role,
  seatAvail = undefined,
  companyCoordLng,
  companyCoordLat,
  startCoordLng,
  startCoordLat,
  daysWorking,
  startTime,
  endTime
}: GenerateUserInput & {id: string}): Prisma.UserUpsertArgs => {
  if (daysWorking.length != 13) {
    throw new Error("Given an invalid string for daysWorking");
  }
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
      daysWorking: "0,1,1,1,1,1,0"
    },
    {
      role: "RIDER",
      startTime: "09:00",
      startCoordLat: 42.15,
      startCoordLng: -71.30,
      endTime: "17:00",
      companyCoordLat: 42.38,
      companyCoordLng: -71,
      daysWorking: "0,0,1,1,0,1,0"
    },
    {
      role: "RIDER",
      startTime: "09:00",
      startCoordLat: 42.17,
      startCoordLng: -71.34,
      endTime: "17:00",
      companyCoordLat: 42.31,
      companyCoordLng: -71.12,
      daysWorking: "0,1,1,1,1,1,0"
    }, 
    {
      role: "RIDER",
      startTime: "09:00",
      startCoordLat: 42.2,
      startCoordLng: -71,
      endTime: "17:00",
      companyCoordLat: 42.32,
      companyCoordLng: -71,
      daysWorking: "0,0,1,0,1,1,0"
    },
    {
      role: "DRIVER",
      seatAvail: 3,
      startTime: "09:00",
      startCoordLat: 42.1,
      startCoordLng: -70.9,
      endTime: "17:30",
      companyCoordLat: 42.3,
      companyCoordLng: -71.5,
      daysWorking: "0,0,1,0,1,1,0"
    },
    {
      role: "DRIVER",
      seatAvail: 1,
      startTime: "08:45",
      startCoordLat: 41.6,
      startCoordLng: -70.3,
      endTime: "17:15",
      companyCoordLat: 42.3,
      companyCoordLng: -71,
      daysWorking: "0,0,1,0,1,1,0"
    }, 
    {
      role: "RIDER",
      startTime: "08:00",
      startCoordLat: 41.2,
      startCoordLng: -70.4,
      endTime: "16:00",
      companyCoordLat: 42.5,
      companyCoordLng: -71,
      daysWorking: "0,0,1,0,1,1,0"
    }, 
    {
      role: "RIDER",
      startTime: "08:15",
      startCoordLat: 41.25,
      startCoordLng: -70.42,
      endTime: "16:30",
      companyCoordLat: 42.5,
      companyCoordLng: -71,
      daysWorking: "0,0,1,1,1,1,0"
    }, 
    {
      role: "DRIVER",
      seatAvail: 6,
      startTime: "08:45",
      startCoordLat: 41,
      startCoordLng: -70.37,
      endTime: "17:00",
      companyCoordLat: 42.5,
      companyCoordLng: -71,
      daysWorking: "0,1,1,1,1,1,0"
    }, 
    {
      role: "DRIVER",
      seatAvail: 0,
      startTime: "08:00",
      startCoordLat: 41.2,
      startCoordLng: -70.4,
      endTime: "16:00",
      companyCoordLat: 42.5,
      companyCoordLng: -71,
      daysWorking: "0,0,1,0,1,1,0"
    }, 
  ]

  await Promise.all(users.map(async (user, index) => {
    await prisma.user.upsert(generateUser({id: index.toString(), ...user}))
  }))
}

const genRandomUsers = ({
  startCoordLat,
  startCoordLng,
  endCoordLat,
  endCoordLng,
  coordOffset = 0.03,
  count,
  seed
} : {
  startCoordLat: number,
  startCoordLng: number,
  endCoordLat: number,
  endCoordLng: number,
  coordOffset?: number,
  count: number,
  seed: string
}): GenerateUserInput[] => {
  const random = Random.create(seed)
  const doubleOffset = coordOffset * 2;
  // rand(num): When given a number, returns a random number in the range [0-num]
  const rand = (max: number) => max * random.random();
  return new Array(count).fill(undefined).map((_, index) => {
    const startMin = (15 * Math.floor(rand(3.9)));
    const endMin = (15 * Math.floor(rand(3.9)));
    const output: GenerateUserInput = {
      role: "RIDER",
      // Generates a start time between 8:00 - 11:45
      startTime: (8 + Math.floor(rand(3))) + ":" + ((startMin == 0) ? "00" : startMin),
      startCoordLat: startCoordLat - coordOffset + rand(doubleOffset),
      startCoordLng: startCoordLng - coordOffset + rand(doubleOffset),
      // Generates an end time between 16:00 - 19:45
      endTime: (16 + Math.floor(rand(3))) + ":" + ((endMin == 0) ? "00" : endMin),
      companyCoordLat: endCoordLat - coordOffset + rand(doubleOffset),
      companyCoordLng: endCoordLng - coordOffset + rand(doubleOffset),
      daysWorking: new Array(7)
        .fill(undefined)
        .map((_, ind) => (rand(1) < 0.5) ? "0" : "1")
        .join(",")
    };
    if (rand(1) < 0.5) {
      return {
        ...output,
        role: "DRIVER",
        seatAvail: Math.ceil(rand(3))
      };
    }
    return output;
  });
};

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


