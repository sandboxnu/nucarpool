import { PrismaClient } from "@prisma/client";
import { range } from "lodash";
import Random from "random-seed";
import { generateUser, GenerateUserInput } from "../src/utils/recommendation";

const prisma = new PrismaClient();

/**
 * Generates favorites for users in our database.
 */
const generateFavorites = async () => {
  const users = await prisma.user.findMany();

  Promise.all(
    users.map((user, idx) =>
      prisma.user.update({
        where: {
          id: `${idx}`,
        },
        data: {
          favorites: {
            connect: pickConnections(idx, users.length, 5, "poolPanArtemis"),
          },
        },
      })
    )
  );
};

/**
 * Returns a list of connections for a given user.
 *
 * @param userId the user we're picking favorites for
 * @param userCount the total amount of users in our database
 * @param favoriteCount the number of favorites each user should have
 * @param seed the seed we're using to generate random ints
 * @returns a list of objects with a single key ``id`` mapping to a int represented as a string
 */
const pickConnections = (
  userId: number,
  userCount: number,
  favoriteCount: number,
  seed: string
) => {
  const random = Random.create(seed);
  return range(favoriteCount)
    .map(() => random(userCount))
    .filter((i) => i !== userId)
    .map((i) => {
      return { id: `${i}` };
    });
};

/**
 * Creates users and adds them to the database.
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

  await generateFavorites();
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
 * Populates our database with fake data.
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
    await prisma.$disconnect();
  });
