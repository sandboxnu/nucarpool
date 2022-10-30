import { PrismaClient, Role, Prisma } from "@prisma/client";
import Random from "random-seed";

const prisma = new PrismaClient();

type GenerateUserInput = {
  companyCoordLng: number;
  companyCoordLat: number;
  startCoordLng: number;
  startCoordLat: number;
  daysWorking: string; // Format: S,M,T,W,R,F,S
  startTime: string;
  endTime: string;
} & (
  | {
      role: "RIDER";
      seatAvail?: undefined;
    }
  | {
      role: "DRIVER";
      seatAvail: number;
    }
);

/**
 * Creates a full user object from a skeleton of critical user information
 *
 * @param userInfo an object containing user info that we want to switch up between users
 * @returns a full user object to insert into the database, with some fields hardcoded due to lack of significance
 */
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
  endTime,
}: GenerateUserInput & { id: string }): Prisma.UserUpsertArgs => {
  if (daysWorking.length != 13) {
    throw new Error("Given an invalid string for daysWorking");
  }

  const updated_obj: Prisma.UserCreateInput = {
    id: id,
    name: `User ${id}`,
    email: `user${id}@hotmail.com`,
    emailVerified: new Date("2022-10-14 19:26:21"),
    image: null,
    bio: `My name is User ${id}. I like to drive`,
    pronouns: "they/them",
    role: role,
    status: "ACTIVE",
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
    endTime: new Date(endTime),
  };
  return {
    where: { id: id },
    update: updated_obj,
    create: updated_obj,
  };
};

/**
 * Creates users and adds them to the database
 */
const createUserData = async () => {
  const users: GenerateUserInput[] = [
    ...genRandomUsers({
      // MISSION HILL => DOWNTOWN
      startCoordLat: 42.33,
      startCoordLng: -71.1,
      companyCoordLat: 42.35,
      companyCoordLng: -71.06,
      count: 30,
      seed: "sjafdlsdjfjadljflasjkfdl;",
    }),
    ...genRandomUsers({
      // CAMPUS => WALTHAM
      startCoordLat: 42.34,
      startCoordLng: -71.09,
      companyCoordLat: 42.4,
      companyCoordLng: -71.26,
      count: 10,
      seed: "kajshdkfjhasdkjfhla",
    }),
    ...genRandomUsers({
      // MISSION HILL => CAMBRIDGE
      startCoordLat: 42.32,
      startCoordLng: -71.095,
      companyCoordLat: 42.37,
      companyCoordLng: -71.1,
      count: 15,
      seed: "asjfwieoiroqweiaof",
    }),
    ...genRandomUsers({
      // BROOKLINE => FENWAY
      startCoordLat: 42.346,
      startCoordLng: -71.127,
      companyCoordLat: 42.344,
      companyCoordLng: -71.1,
      count: 15,
      seed: "dfsiuyisryrklewuoiadusruasi",
    }),
  ];

  await Promise.all(
    users.map(async (user, index) => {
      await prisma.user.upsert(generateUser({ id: index.toString(), ...user }));
    })
  );
};

/**
 * Creates randomized users that can be deployed and used for testing the app.
 *
 * @param param0 An object specifying the options of the randomization,
 *               including the start/end coordinates to congregate data
 *               around, the offset of that congregation (how spread should
 *               the points be), the num of outputs, and a random seed.
 * @returns An array of size "count" with GenerateUserInput examples.
 */
const genRandomUsers = ({
  startCoordLat,
  startCoordLng,
  companyCoordLat,
  companyCoordLng,
  coordOffset = 0.03,
  count,
  seed,
}: {
  startCoordLat: number;
  startCoordLng: number;
  companyCoordLat: number;
  companyCoordLng: number;
  coordOffset?: number;
  count: number;
  seed?: string;
}): GenerateUserInput[] => {
  const random = Random.create(seed);
  const doubleOffset = coordOffset * 2;
  // rand(num): When given a number, returns a random number in the range [0-num]
  const rand = (max: number) => max * random.random();
  // To each item in the array, generates a random user
  return new Array(count).fill(undefined).map((_, index) => {
    const startMin = 15 * Math.floor(rand(3.9));
    const endMin = 15 * Math.floor(rand(3.9));
    const output: GenerateUserInput = {
      role: "RIDER",
      // Generates a start time between 8:00 - 11:45
      startTime:
        8 + Math.floor(rand(3)) + ":" + (startMin == 0 ? "00" : startMin),
      startCoordLat: startCoordLat - coordOffset + rand(doubleOffset),
      startCoordLng: startCoordLng - coordOffset + rand(doubleOffset),
      // Generates an end time between 16:00 - 19:45
      endTime: 16 + Math.floor(rand(3)) + ":" + (endMin == 0 ? "00" : endMin),
      companyCoordLat: companyCoordLat - coordOffset + rand(doubleOffset),
      companyCoordLng: companyCoordLng - coordOffset + rand(doubleOffset),
      daysWorking: new Array(7)
        .fill(undefined)
        .map((_, ind) => (rand(1) < 0.5 ? "0" : "1"))
        .join(","),
    };
    if (rand(1) < 0.5) {
      return {
        ...output,
        role: "DRIVER",
        seatAvail: Math.ceil(rand(3)),
      };
    }
    return output;
  });
};

/**
 * Runs the database seeding functions
 */
const main = async () => {
  await createUserData();
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
