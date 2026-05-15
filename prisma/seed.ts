import { CarpoolGroup, PrismaClient, Role, User } from "@prisma/client";
import { range } from "lodash";
import Random from "random-seed";
import { generateUser, GenerateUserInput } from "../src/utils/recommendation";
import { timeEnd } from "console";

const prisma = new PrismaClient();

async function reverseGeocode(
  lng: number,
  lat: number,
): Promise<{
  street: string;
  city: string;
  state: string;
  address: string;
}> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=address,place,locality,region`;
    const response = await fetch(url);
    const data = await response.json();

    let street = "";
    let city = "";
    let state = "";
    let address = "";
    let buildingNumber = "";

    // Try to extract address components from the response
    for (const feature of data.features) {
      // Look for address features to get street and building number
      if (feature.place_type.includes("address")) {
        // Try to extract building/house number from address text
        const addressParts = feature.text.split(" ");
        // Check if there exists a building number
        if (addressParts.length > 0 && !isNaN(Number(addressParts[0]))) {
          buildingNumber = addressParts[0];
          street = addressParts.slice(1).join(" ");
        } else {
          street = feature.text;
        }
      }

      // Look for place features to get city name
      if (feature.place_type.includes("place") && !city) {
        city = feature.text;
      }

      // Look for region features to get state name
      if (feature.place_type.includes("region") && !state) {
        state = feature.text;
      }

      // Prefer POI names for the address field if available
      if (feature.place_type.includes("poi") && !address) {
        address = feature.text;
      }
    }

    // Append building number to street if it exists
    if (buildingNumber && street) {
      street = `${buildingNumber} ${street}`;
    }

    // If no address was found, create one from the components
    if (!address) {
      address = `${street}, ${city}, ${state}`;
    }

    return { street, city, state, address };
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return {
      street: "123 Main St",
      city: "Boston",
      state: "MA",
      address: "123 Main St, Boston, MA",
    };
  }
}

/**
 * Deletes all entries in the user table.
 */
const deleteAllData = async () => {
  await prisma.request.deleteMany({});
  await prisma.carpoolSearch.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.carpoolGroup.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.user.deleteMany({});
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
      }),
    ),
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
      }),
    ),
  );
};

/**
 * Generates requests between users in our database.
 */
const generateRequests = async (userIds: string[]) => {
  await Promise.all(
    userIds.map((_, idx) =>
      prisma.request.create({
        data: {
          message: "Hello",
          fromUser: {
            connect: { id: idx.toString() },
          },
          toUser: {
            connect: { id: pickConnection(idx, userIds.length) },
          },
        },
      }),
    ),
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
const generateFavorites = async (userIds: string[]) => {
  await Promise.all(
    userIds.map((_, idx) =>
      prisma.user.update({
        where: {
          id: `${idx}`,
        },
        data: {
          favorites: {
            connect: pickConnections(idx, userIds.length, 5),
          },
        },
      }),
    ),
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
  favoriteCount: number,
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
const generateGroups = async (userIds: string[]): Promise<Map<string, string>> => {
  const userToGroupMap = new Map<string, string>();
  const groups: string[][] = [];
  let i = 0;
  for (let j = 0; j < 10; j++) {
    for (let k = 0; k < 4; k++) {
      (groups[j] ??= []).push(userIds[i]);
      i++;
    }
  }
  await prisma.carpoolGroup.createMany({
    data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => ({
      id: idx.toString(),
      message: "hello",
    })),
  });

  // Build the mapping for later use when creating CarpoolSearch
  groups.forEach((group, idx) => {
    group.forEach((userId) => {
      userToGroupMap.set(userId, idx.toString());
    });
  });

  return userToGroupMap;
};

// Type for generated user data (includes all fields for CarpoolSearch/Location)
type GeneratedUserData = {
  id: string;
  role: Role;
  seatAvail: number;
  companyCoordLng: number;
  companyCoordLat: number;
  startCoordLng: number;
  startCoordLat: number;
  daysWorking: string;
  startTime: string;
  endTime: string;
  coopStartDate: Date | null;
  coopEndDate: Date | null;
  companyAddress: string;
  startAddress: string;
  companyStreet: string;
  companyCity: string;
  companyState: string;
  startStreet: string;
  startCity: string;
  startState: string;
};

/**
 * Creates users and adds them to the database.
 */
const createUserData = async () => {
  // updated function to handle async getRandomUsers
  const userGroups = await Promise.all([
    genRandomUsers({
      // MISSION HILL => DOWNTOWN
      startCoordLat: 42.33,
      startCoordLng: -71.1,
      companyCoordLat: 42.35,
      companyCoordLng: -71.06,
      count: 30,
      seed: "sjafdlsdjfjadljflasjkfdl;",
    }),
    genRandomUsers({
      // CAMPUS => WALTHAM
      startCoordLat: 42.34,
      startCoordLng: -71.09,
      companyCoordLat: 42.4,
      companyCoordLng: -71.26,
      count: 10,
      seed: "kajshdkfjhasdkjfhla",
    }),
    genRandomUsers({
      // MISSION HILL => CAMBRIDGE
      startCoordLat: 42.32,
      startCoordLng: -71.095,
      companyCoordLat: 42.37,
      companyCoordLng: -71.1,
      count: 15,
      seed: "asjfwieoiroqweiaof",
      timezone: "UTC",
    }),
    genRandomUsers({
      // BROOKLINE => FENWAY
      startCoordLat: 42.346,
      startCoordLng: -71.127,
      companyCoordLat: 42.344,
      companyCoordLng: -71.1,
      count: 15,
      seed: "dfsiuyisryrklewuoiadusruasi",
      timezone: "UTC",
    }),
  ]);

  const usersData: GeneratedUserData[] = userGroups.flat().map((user, index) => ({
    id: index.toString(),
    ...user,
  }));

  await clearConnections();
  await deleteAllData();
  
  // Create users with only non-migrated fields
  await Promise.all(
    usersData.map((userData) =>
      prisma.user.upsert(generateUser({ id: userData.id } as GenerateUserInput & { id: string })),
    ),
  );
  
  const userIds = usersData.map(u => u.id);
  
  // Generate groups and get the userId -> groupId mapping
  const userToGroupMap = await generateGroups(userIds);
  
  await Promise.all([
    generateFavorites(userIds),
    generateRequests(userIds),
  ]);

  // create Location and CarpoolSearch records for each user
  for (const userData of usersData) {
    try {
      // find or create home location
      let homeLocation = null;

      // only search for existing location if we have valid address data
      if (userData.startStreet && userData.startCity && userData.startState) {
        homeLocation = await prisma.location.findFirst({
          where: {
            street: userData.startStreet,
            city: userData.startCity,
            state: userData.startState,
            streetAddress: userData.startAddress || '',
          },
        });
      }

      // if not found or address was empty, create new location
      if (!homeLocation) {
        homeLocation = await prisma.location.create({
          data: {
            street: userData.startStreet || '',
            city: userData.startCity || '',
            state: userData.startState || '',
            streetAddress: userData.startAddress || '',
            coordLng: userData.startCoordLng,
            coordLat: userData.startCoordLat,
          },
        });
      }

      // find or create company location
      let companyLocation = null;

      // only search for existing location if we have valid address data
      if (userData.companyStreet && userData.companyCity && userData.companyState) {
        companyLocation = await prisma.location.findFirst({
          where: {
            street: userData.companyStreet,
            city: userData.companyCity,
            state: userData.companyState,
            streetAddress: userData.companyAddress || '',
          },
        });
      }

      // if not found or address was empty, create new location
      if (!companyLocation) {
        companyLocation = await prisma.location.create({
          data: {
            street: userData.companyStreet || '',
            city: userData.companyCity || '',
            state: userData.companyState || '',
            streetAddress: userData.companyAddress || '',
            coordLng: userData.companyCoordLng,
            coordLat: userData.companyCoordLat,
          },
        });
      }

      // get carpoolId from the mapping
      const carpoolId = userToGroupMap.get(userData.id) || null;

      // Parse time strings to Date objects
      const startTimeDate = userData.startTime ? new Date(userData.startTime) : null;
      const endTimeDate = userData.endTime ? new Date(userData.endTime) : null;

      // create CarpoolSearch
      await prisma.carpoolSearch.create({
        data: {
          userId: userData.id,
          role: userData.role as Role,
          status: "ACTIVE",
          seatsAvail: userData.seatAvail || 0,
          companyName: "Sandbox Inc.",
          daysWorking: userData.daysWorking || '',
          startTime: startTimeDate,
          endTime: endTimeDate,
          startDate: userData.coopStartDate,
          endDate: userData.coopEndDate,
          carpoolId: carpoolId,
          groupMessage: null,
          homeLocationId: homeLocation.id,
          companyLocationId: companyLocation.id,
        },
      });
    } catch (error) {
      console.error(`Failed to create CarpoolSearch for user ${userData.id}:`, error);
    }
  }
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
const genRandomUsers = async ({
  startCoordLat,
  startCoordLng,
  companyCoordLat,
  companyCoordLng,
  coordOffset = 0.03,
  count,
  seed,
  timezone,
}: {
  startCoordLat: number;
  startCoordLng: number;
  companyCoordLat: number;
  companyCoordLng: number;
  coordOffset?: number;
  count: number;
  seed?: string;
  timezone?: string;
}): Promise<any[]> => {
  const random = Random.create(seed);
  const doubleOffset = coordOffset * 2;
  const rand = (max: number) => max * random.random();

  const users = [];

  for (let i = 0; i < count; i++) {
    const startMin = 15 * Math.floor(rand(3.9));
    const endMin = 15 * Math.floor(rand(3.9));
    const startHour =
      timezone === "UTC" ? 2 + Math.floor(rand(3)) : 8 + Math.floor(rand(3));
    const endHour =
      timezone === "UTC" ? 10 + Math.floor(rand(3)) : 16 + Math.floor(rand(3));
    const startTime = new Date(2023, 0, 1, startHour, startMin).toISOString();
    const endTime = new Date(2023, 0, 1, endHour, endMin).toISOString();

    const userStartLat = startCoordLat - coordOffset + rand(doubleOffset);
    const userStartLng = startCoordLng - coordOffset + rand(doubleOffset);
    const userCompanyLat = companyCoordLat - coordOffset + rand(doubleOffset);
    const userCompanyLng = companyCoordLng - coordOffset + rand(doubleOffset);

    // Reverse geocode to get structured address data
    const [startAddress, companyAddress] = await Promise.all([
      reverseGeocode(userStartLng, userStartLat),
      reverseGeocode(userCompanyLng, userCompanyLat),
    ]);

    const output = {
      role: "RIDER" as Role,
      seatAvail: 0,
      startTime,
      startCoordLat: userStartLat,
      startCoordLng: userStartLng,
      endTime,
      companyCoordLat: userCompanyLat,
      companyCoordLng: userCompanyLng,
      daysWorking: new Array(7)
        .fill(undefined)
        .map((_, ind) => (rand(1) < 0.5 ? "0" : "1"))
        .join(","),
      coopStartDate: null,
      coopEndDate: null,
      // Add the new structured address fields
      startStreet: startAddress.street,
      startCity: startAddress.city,
      startState: startAddress.state,
      companyStreet: companyAddress.street,
      companyCity: companyAddress.city,
      companyState: companyAddress.state,
      // Keep the old address fields for backward compatibility
      startAddress: startAddress.address,
      companyAddress: companyAddress.address,
    };

    if (rand(1) < 0.5) {
      users.push({
        ...output,
        role: "DRIVER" as Role,
        seatAvail: Math.ceil(rand(3)),
      });
    } else {
      users.push(output);
    }
  }

  return users;
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
  