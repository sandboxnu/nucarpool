import calculateScore from "../src/utils/recommendation";
import { expect, jest, test } from "@jest/globals";
import { generateUser } from "../prisma/seed";
import { User } from "@prisma/client";
import _ from "lodash";

const users: User[] = [];

let testUser: User;

test("Test cutoffs for user 0", () => {
  const calcScoreForUser1 = calculateScore(testUser);
  const recs = _.compact(users.map(calcScoreForUser1));
  recs.sort((a, b) => a.score - b.score);
  expect(recs.length).toBe(0); //change me
  expect(recs).not.toContain(users[0]); // change me
  expect(recs).toContain(users[0]); // change
});

test("Test relative order for user 1", () => {});

test("Testing the cutoffs for user x", () => {});
