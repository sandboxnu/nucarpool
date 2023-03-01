import calculateScore, { generateUser } from "../src/utils/recommendation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { expect, jest, test } from "@jest/globals";
import { Prisma, User } from "@prisma/client";
import _ from "lodash";

dayjs.extend(utc);
dayjs.extend(timezone);

const relativeOrderBaseUser: User = generateUser({
  id: "0",
  role: "DRIVER",
  seatAvail: 1,
  companyCoordLng: 42.35,
  companyCoordLat: -71.06,
  startCoordLng: 42.34,
  startCoordLat: -71.09,
  companyPOICoordLng: 42.35,
  companyPOICoordLat: -71.06,
  startPOICoordLng: 42.34,
  startPOICoordLat: -71.09,
  daysWorking: "0,1,1,1,1,1,0",
  startTime: "9:00",
  endTime: "17:00",
}).create;

const calcScoreForBaseUser = calculateScore(relativeOrderBaseUser);

const usersToBeCutoff: User[] = [
  {
    ...relativeOrderBaseUser,
    daysWorking: "1,1,0,0,0,0,1",
  },
  {
    ...relativeOrderBaseUser,
    startTime: dayjs.tz("2022-11-01 07:59:00", "UTC").toDate(),
  },
  {
    ...relativeOrderBaseUser,
    endTime: dayjs.tz("2022-11-01 18:01:00", "UTC").toDate(),
  },
  {
    ...relativeOrderBaseUser,
    startCoordLat: relativeOrderBaseUser.startCoordLat + 0.05,
  },
  {
    ...relativeOrderBaseUser,
    startCoordLng: relativeOrderBaseUser.startCoordLng + 0.05,
  },
  {
    ...relativeOrderBaseUser,
    companyCoordLat: relativeOrderBaseUser.companyCoordLat + 0.05,
  },
  {
    ...relativeOrderBaseUser,
    companyCoordLng: relativeOrderBaseUser.companyCoordLng + 0.05,
  },
];

const usersToNotBeCutoff: User[] = [
  {
    ...relativeOrderBaseUser,
    daysWorking: "1,1,0,0,0,1,1",
  },
  {
    ...relativeOrderBaseUser,
    startTime: dayjs.tz("2022-11-01 08:00:00", "UTC").toDate(),
  },
  {
    ...relativeOrderBaseUser,
    endTime: dayjs.tz("2022-11-01 18:00:00", "UTC").toDate(),
  },
  {
    ...relativeOrderBaseUser,
    startCoordLat: relativeOrderBaseUser.startCoordLat + 0.04,
  },
  {
    ...relativeOrderBaseUser,
    startCoordLng: relativeOrderBaseUser.startCoordLng + 0.04,
  },
  {
    ...relativeOrderBaseUser,
    companyCoordLat: relativeOrderBaseUser.companyCoordLat + 0.04,
  },
  {
    ...relativeOrderBaseUser,
    companyCoordLng: relativeOrderBaseUser.companyCoordLng + 0.04,
  },
];

test("Test that users outside of cutoffs are not included", () => {
  const recs = _.compact(usersToBeCutoff.map(calcScoreForBaseUser));
  expect(recs.length).toEqual(0);
});

test("Test that users inside of cutoffs are included", () => {
  const recs = _.compact(usersToNotBeCutoff.map(calcScoreForBaseUser));
  expect(recs.length).toEqual(usersToNotBeCutoff.length);
});

const relativeOrderUsers: User[] = [
  {
    ...relativeOrderBaseUser,
    role: "RIDER",
  },
  {
    ...relativeOrderBaseUser,
    role: "DRIVER",
  },
  {
    ...relativeOrderBaseUser,
    role: "RIDER",
    daysWorking: "0,1,0,1,1,1,0",
  },
  {
    ...relativeOrderBaseUser,
    role: "RIDER",
    startTime: dayjs.tz("2022-11-01 09:15:00", "UTC").toDate(),
  },
  {
    ...relativeOrderBaseUser,
    role: "RIDER",
    endTime: dayjs.tz("2022-11-01 17:15:00", "UTC").toDate(),
  },
  {
    ...relativeOrderBaseUser,
    role: "RIDER",
    startCoordLat: relativeOrderBaseUser.startCoordLat + 0.001,
    startCoordLng: relativeOrderBaseUser.startCoordLng + 0.001,
  },
  {
    ...relativeOrderBaseUser,
    role: "RIDER",
    companyCoordLat: relativeOrderBaseUser.companyCoordLat + 0.001,
    companyCoordLng: relativeOrderBaseUser.companyCoordLng + 0.001,
  },
  {
    ...relativeOrderBaseUser,
    role: "RIDER",
    daysWorking: "0,1,0,1,1,1,1",
  },
  {
    ...relativeOrderBaseUser,
    startTime: null,
    daysWorking: "0,1,0,1,1,1,0",
  },
];

const relativeScores = _.compact(
  relativeOrderUsers.map(calcScoreForBaseUser)
).map((r) => r.score);

test("all relative order users within cutoffs", () => {
  expect(relativeScores).toHaveLength(relativeOrderUsers.length);
});

test("perfect match", () => {
  expect(relativeScores[0]).toEqual(0);
});

test("driver deprioritization", () => {
  expect(relativeScores[0]).toBeLessThan(relativeScores[1]);
});

test("less shared daysWorking raises score", () => {
  expect(relativeScores[0]).toBeLessThan(relativeScores[2]);
});

test("extra daysWorking doesn't affect score", () => {
  expect(relativeScores[2]).toEqual(relativeScores[7]);
});

test("differing startTime raises score", () => {
  expect(relativeScores[0]).toBeLessThan(relativeScores[3]);
});

test("differing endTime raises score", () => {
  expect(relativeScores[0]).toBeLessThan(relativeScores[4]);
});

test("start and endTime have same effect on score", () => {
  expect(relativeScores[3]).toEqual(relativeScores[4]);
});

test("differing start location raises score", () => {
  expect(relativeScores[0]).toBeLessThan(relativeScores[5]);
});

test("differing company location raises score", () => {
  expect(relativeScores[0]).toBeLessThan(relativeScores[6]);
});

test("Company location difference has larger effect on score", () => {
  expect(relativeScores[5]).toBeLessThan(relativeScores[6]);
});

test("Missing start time is worse than same time when other details differ", () => {
  expect(relativeScores[2]).toBeLessThan(relativeScores[8]);
});
