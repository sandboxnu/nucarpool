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
];

const calcScoreForBaseUser = calculateScore(relativeOrderBaseUser);
const relativeScores = _.compact(
  relativeOrderUsers.map(calcScoreForBaseUser)
).map((r) => r.score);

test("driver deprioritization", () => {
  expect(relativeScores[0]).toBeLessThan(relativeScores[1]);
});
