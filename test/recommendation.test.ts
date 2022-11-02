import calculateScore, { generateUser } from "../src/utils/recommendation";
import { expect, jest, test } from "@jest/globals";
import { Prisma, User } from "@prisma/client";
import _ from "lodash";

let users: User[];

let testUser: User;

test("Test cutoffs for user 0", () => {
  const calcScoreForUser1 = calculateScore(testUser);
  const recs = _.compact(users.map(calcScoreForUser1));
  recs.sort((a, b) => a.score - b.score);
  expect(recs.length).toBe(0); //change me
  expect(recs).not.toContain(users[0]); // change me
  expect(recs).toContain(users[0]); // change
});

test("Testing the cutoffs for user x", () => {});

const relativeOrderBaseUser: User = generateUser({
  id: "0",
  role: "DRIVER",
  seatAvail: 1,
  companyCoordLng: 42.35,
  companyCoordLat: -71.06,
  startCoordLng: 42.34,
  startCoordLat: -71.09,
  daysWorking: "0,1,1,1,1,1,0",
  startTime: "9:00",
  endTime: "17:00",
}).create;

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
    startTime: new Date(Date.parse("2022-11-01T09:15:00Z")),
  },
  {
    ...relativeOrderBaseUser,
    role: "RIDER",
    endTime: new Date(Date.parse("2022-11-01T17:15:00Z")),
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

const calcScoreForBaseUser = calculateScore(relativeOrderBaseUser);
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
