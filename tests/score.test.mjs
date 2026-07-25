import assert from "node:assert/strict";
import test from "node:test";
import { classify, cumulativeToPar, rangeStats, summarize, toParLabel } from "../lib/score.js";

test("toParLabel formats common golf score labels", () => {
  assert.equal(toParLabel(null), "–");
  assert.equal(toParLabel(0), "E");
  assert.equal(toParLabel(2), "+2");
  assert.equal(toParLabel(-3), "-3");
});

test("classify maps score differences to broadcast result kinds", () => {
  assert.deepEqual(classify(5, 3), { kind: "eagle", diff: -2 });
  assert.deepEqual(classify(4, 3), { kind: "birdie", diff: -1 });
  assert.deepEqual(classify(4, 4), { kind: "par", diff: 0 });
  assert.deepEqual(classify(4, 5), { kind: "bogey", diff: 1 });
  assert.deepEqual(classify(4, 6), { kind: "double", diff: 2 });
});

test("summary and range stats count only played holes for to-par", () => {
  const holes = Array.from({ length: 18 }, () => ({ par: 4, score: "" }));
  holes[0].score = "3";
  holes[1].score = "4";
  holes[9].score = "5";

  assert.equal(cumulativeToPar(holes, 9), 0);
  assert.deepEqual(
    summarize(holes),
    {
      outScore: 7,
      inScore: 5,
      totalScore: 12,
      outPar: 36,
      inPar: 36,
      totalPar: 72,
      toPar: 0,
      thru: 3,
      hasFront: true,
      hasBack: true,
    }
  );
  assert.deepEqual(rangeStats(holes, "front"), {
    par: 36,
    score: 7,
    thru: 2,
    toPar: -1,
    hasAny: true,
    start: 0,
    end: 9,
  });
});
