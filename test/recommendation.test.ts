import { calculateScore, generateUser } from "../src/utils/recommendation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { expect, test } from "@jest/globals";
import { Role, User } from "@prisma/client";
import _ from "lodash";

dayjs.extend(utc);
dayjs.extend(timezone);

const relativeOrderBaseDriver: User = generateUser({
  id: "0",
  role: Role.DRIVER,
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

const relativeOrderBaseRider = {
  ...relativeOrderBaseDriver,
  role: Role.RIDER,
};

const calcScoreForBaseDriver = calculateScore(relativeOrderBaseDriver);
const calcScoreForBaseRider = calculateScore(relativeOrderBaseRider);

const usersToBeCutoff: User[] = [
  {
    ...relativeOrderBaseRider,
    daysWorking: "1,1,0,0,0,0,1",
  },
  {
    ...relativeOrderBaseRider,
    startTime: dayjs.tz("2022-11-01 07:59:00", "UTC").toDate(),
  },
  {
    ...relativeOrderBaseRider,
    endTime: dayjs.tz("2022-11-01 18:01:00", "UTC").toDate(),
  },
  {
    ...relativeOrderBaseRider,
    startCoordLat: relativeOrderBaseDriver.startCoordLat + 0.05,
  },
  {
    ...relativeOrderBaseRider,
    startCoordLng: relativeOrderBaseDriver.startCoordLng + 0.05,
  },
  {
    ...relativeOrderBaseRider,
    companyCoordLat: relativeOrderBaseDriver.companyCoordLat + 0.05,
  },
  {
    ...relativeOrderBaseRider,
    companyCoordLng: relativeOrderBaseRider.companyCoordLng + 0.05,
  },
];

const usersToNotBeCutoff: User[] = [
  {
    ...relativeOrderBaseRider,
    daysWorking: "1,1,0,0,0,1,1",
  },
  {
    ...relativeOrderBaseRider,
    startTime: dayjs.tz("2022-11-01 08:00:00", "UTC").toDate(),
  },
  {
    ...relativeOrderBaseRider,
    endTime: dayjs.tz("2022-11-01 18:00:00", "UTC").toDate(),
  },
  {
    ...relativeOrderBaseRider,
    startCoordLat: relativeOrderBaseDriver.startCoordLat + 0.04,
  },
  {
    ...relativeOrderBaseRider,
    startCoordLng: relativeOrderBaseDriver.startCoordLng + 0.04,
  },
  {
    ...relativeOrderBaseRider,
    companyCoordLat: relativeOrderBaseDriver.companyCoordLat + 0.04,
  },
  {
    ...relativeOrderBaseRider,
    companyCoordLng: relativeOrderBaseDriver.companyCoordLng + 0.04,
  },
];

test("Test that users outside of cutoffs are not included", () => {
  const recs = _.compact(usersToBeCutoff.map(calcScoreForBaseDriver));
  expect(recs.length).toEqual(0);
});

test("Test that users inside of cutoffs are included", () => {
  const recs = _.compact(usersToNotBeCutoff.map(calcScoreForBaseDriver));
  expect(recs.length).toEqual(usersToNotBeCutoff.length);
});

const relativeOrderUsers: User[] = [
  {
    ...relativeOrderBaseRider,
  },
  {
    ...relativeOrderBaseRider,
    daysWorking: "0,1,0,1,1,1,0",
  },
  {
    ...relativeOrderBaseRider,
    startTime: dayjs.tz("2022-11-01 09:15:00", "UTC").toDate(),
  },
  {
    ...relativeOrderBaseRider,
    endTime: dayjs.tz("2022-11-01 17:15:00", "UTC").toDate(),
  },
  {
    ...relativeOrderBaseRider,
    startCoordLat: relativeOrderBaseDriver.startCoordLat + 0.001,
    startCoordLng: relativeOrderBaseDriver.startCoordLng + 0.001,
  },
  {
    ...relativeOrderBaseRider,
    companyCoordLat: relativeOrderBaseDriver.companyCoordLat + 0.001,
    companyCoordLng: relativeOrderBaseDriver.companyCoordLng + 0.001,
  },
  {
    ...relativeOrderBaseRider,
    daysWorking: "0,1,0,1,1,1,1",
  },
  {
    ...relativeOrderBaseRider,
    daysWorking: "0,1,0,1,1,1,1",
    startTime: null,
  },
  {
    ...relativeOrderBaseDriver,
  },
  {
    ...relativeOrderBaseDriver,
    startTime: null,
    daysWorking: "0,1,0,1,1,1,0",
  },
  {
    ...relativeOrderBaseDriver,
    endTime: null,
    daysWorking: "0,1,0,1,1,1,0",
  },
];

const relativeDriverScores = _.compact(
  relativeOrderUsers.map(calcScoreForBaseDriver)
).map((r) => r.score);

const relativeRiderScores = _.compact(
  relativeOrderUsers.map(calcScoreForBaseRider)
).map((r) => r.score);

test("all relative order users within cutoffs", () => {
  expect(relativeDriverScores).toHaveLength(
    relativeOrderUsers.filter((user) => user.role == Role.RIDER).length
  );
});

test("perfect match", () => {
  expect(relativeDriverScores[0]).toEqual(0);
});

test("driver deprioritization", () => {
  expect(relativeDriverScores[0]).toBeLessThan(relativeDriverScores[1]);
});

test("less shared daysWorking raises score", () => {
  expect(relativeDriverScores[0]).toBeLessThan(relativeDriverScores[2]);
});

test("extra daysWorking doesn't affect score", () => {
  expect(relativeDriverScores[1]).toEqual(relativeDriverScores[6]);
});

test("differing startTime raises score", () => {
  expect(relativeDriverScores[0]).toBeLessThan(relativeDriverScores[3]);
});

test("differing endTime raises score", () => {
  expect(relativeDriverScores[0]).toBeLessThan(relativeDriverScores[4]);
});

test("start and endTime have same effect on score", () => {
  expect(relativeRiderScores[1]).toEqual(relativeRiderScores[2]);
});

test("differing start location raises score", () => {
  expect(relativeDriverScores[0]).toBeLessThan(relativeDriverScores[5]);
});

test("differing company location raises score", () => {
  expect(relativeDriverScores[0]).toBeLessThan(relativeDriverScores[6]);
});

test("Company location difference has larger effect on score", () => {
  expect(relativeDriverScores[5]).toBeLessThan(relativeDriverScores[6]);
});

test("Missing start time is worse than same time when other details differ", () => {
  expect(relativeDriverScores[1]).toBeLessThan(relativeDriverScores[7]);
});
