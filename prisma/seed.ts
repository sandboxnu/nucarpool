import { CarpoolGroup, PrismaClient, Role, User } from "@prisma/client";
import { range } from "lodash";
import Random from "random-seed";
import { generateUser, GenerateUserInput } from "../src/utils/recommendation";

const prisma = new PrismaClient();

/**
 * Deletes all entries in the user table.
 */
const deleteUsers = async () => {
  await prisma.user.deleteMany({});
  await prisma.request.deleteMany({});
  await prisma.carpoolGroup.deleteMany({});
};

/**
 * Clears connections between users.
 */
const clearConnections = async () => {
  const users = await prisma.user.findMany();

  await Promise.all(
    users.map((user) =>
      prisma.request.deleteMany({
        where: {
          OR: [{ fromUserId: user.id }, { toUserId: user.id }],
        },
      })
    )
  );

  await Promise.all(
    users.map((user) =>
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          favorites: {
            disconnect: new Array(70)
              .fill(undefined)
              .map((_, idx) => ({ id: `${idx}` })),
          },
        },
      })
    )
  );
};

/**
 * Generates requests between users in our database.
 */
const generateRequests = async (users: User[]) => {
  await Promise.all(
    users.map((_, idx) =>
      prisma.request.create({
        data: {
          message: "Hello",
          fromUser: {
            connect: { id: idx.toString() },
          },
          toUser: {
            connect: { id: pickConnection(idx, users.length) },
          },
        },
      })
    )
  );
};

/**
 * Generate a random number thats not the same as the userId
 * @param userId the userId
 * @param limit the limit of the number
 * @returns
 */
const pickConnection = (userId: number, limit: number) => {
  let rand = userId;
  while (rand === userId) {
    rand = Random.create()(limit);
  }
  return rand.toString();
};

/**
 * Generates favorites between users in our database.
 */
const generateFavorites = async (users: User[]) => {
  await Promise.all(
    users.map((_, idx) =>
      prisma.user.update({
        where: {
          id: `${idx}`,
        },
        data: {
          favorites: {
            connect: pickConnections(idx, users.length, 5),
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
 * @returns a list of objects with a single key ``id`` mapping to a int represented as a string
 */
const pickConnections = (
  userId: number,
  userCount: number,
  favoriteCount: number
) => {
  const random = Random.create();
  return range(favoriteCount)
    .map(() => random(userCount))
    .filter((i) => i !== userId)
    .map((i) => {
      return { id: `${i}` };
    });
};

/**
 * Generates favorites between users in our database.
 */
const generateGroups = async (users: User[]) => {
  const groups: User[][] = [];
  let i = 0;
  for (let j = 0; j < 10; j++) {
    for (let k = 0; k < 4; k++) {
      (groups[j] ??= []).push(users[i]);
      i++;
    }
  }
  await prisma.carpoolGroup.createMany({
    data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => ({ id: idx.toString() })),
  });

  await Promise.all(
    groups.map((group, idx) =>
      Promise.all(
        group.map((user) =>
          prisma.user.update({
            where: { id: user.id },
            data: { carpool: { connect: { id: idx.toString() } } },
          })
        )
      )
    )
  );
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

  await clearConnections();
  await deleteUsers();
  await Promise.all(
    users.map((user, index) =>
      prisma.user.upsert(generateUser({ id: index.toString(), ...user }))
    )
  );
  const dbUsers = await prisma.user.findMany();
  await Promise.all([
    generateFavorites(dbUsers),
    generateRequests(dbUsers),
    generateGroups(dbUsers),
  ]);
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
      startPOICoordLat: startCoordLat,
      startCoordLng: startCoordLng - coordOffset + rand(doubleOffset),
      startPOICoordLng: startCoordLat,
      // Generates an end time between 16:00 - 19:45
      endTime: 16 + Math.floor(rand(3)) + ":" + (endMin == 0 ? "00" : endMin),
      companyCoordLat: companyCoordLat - coordOffset + rand(doubleOffset),
      companyPOICoordLat: companyCoordLat,
      companyCoordLng: companyCoordLng - coordOffset + rand(doubleOffset),
      companyPOICoordLng: companyCoordLng,
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
 * Updates the favorites of the user associated with the given ID.
 *
 * @param userId id for the user we're updating.
 * @param ids the ids to add to the current user
 */
const addFavorites = async (userId: string, ids: string[]) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      favorites: {
        connect: ids.map((id) => ({ id })),
      },
    },
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
