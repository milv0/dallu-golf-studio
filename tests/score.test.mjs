import assert from "node:assert/strict";
import test from "node:test";
import {
  classify,
  cumulativeToPar,
  hasAllScores,
  hasAnyScore,
  holesForRange,
  normalizeToParDisplay,
  rangeStats,
  roundWithScoresThrough,
  summarize,
  threeHoleWithScoresThrough,
  toParForPlayedHoles,
  toParLabel,
} from "../lib/score.js";
import { preservePlayer } from "../components/studio/studioDefaults.js";

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

test("score presence helpers distinguish empty and complete ranges", () => {
  const holes = [
    { par: 4, score: "" },
    { par: 4, score: "0" },
    { par: 4, score: 5 },
  ];

  assert.equal(hasAnyScore(holes), true);
  assert.equal(hasAllScores(holes, 3), false);
  assert.equal(hasAllScores(holes.slice(1), 2), true);
  assert.equal(hasAllScores([], 0), false);
});

test("holesForRange selects the requested nine-hole segment", () => {
  const holes = Array.from({ length: 18 }, (_, index) => ({ hole: index + 1 }));

  assert.deepEqual(holesForRange(holes, "front").map((hole) => hole.hole), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(holesForRange(holes, "back").map((hole) => hole.hole), [10, 11, 12, 13, 14, 15, 16, 17, 18]);
  assert.equal(holesForRange(holes).length, 18);
});

test("to-par helpers normalize manual values and calculate played holes only", () => {
  assert.equal(normalizeToParDisplay("0"), "E");
  assert.equal(normalizeToParDisplay("+2"), "+2");
  assert.equal(normalizeToParDisplay("", "–"), "–");
  assert.equal(normalizeToParDisplay("CUT"), "CUT");
  assert.equal(toParForPlayedHoles([
    { par: 4, score: 3 },
    { par: 5, score: "" },
    { par: 3, score: 4 },
  ]), "E");
  assert.equal(toParForPlayedHoles([{ par: 4, score: "" }]), "");
});

test("progress helpers clear only scores after the requested progress", () => {
  const round = {
    player: "PLAYER",
    holes: Array.from({ length: 18 }, (_, index) => ({ par: 4, score: String(index + 1) })),
  };
  const nineProgress = roundWithScoresThrough(round, 9, 9, 2);

  assert.equal(nineProgress.holes[8].score, "9");
  assert.equal(nineProgress.holes[9].score, "10");
  assert.equal(nineProgress.holes[10].score, "11");
  assert.equal(nineProgress.holes[11].score, "");
  assert.equal(round.holes[11].score, "12");

  const threeProgress = threeHoleWithScoresThrough({
    total: "12",
    toPar: "E",
    holes: [
      { par: 4, score: "4" },
      { par: 4, score: "5" },
      { par: 4, score: "3" },
    ],
  }, 1);

  assert.deepEqual(threeProgress.holes.map((hole) => hole.score), ["4", "", ""]);
  assert.equal(threeProgress.total, "");
  assert.equal(threeProgress.toPar, "");
});

test("custom reset helper keeps only the current player value", () => {
  assert.deepEqual(
    preservePlayer({ player: "", holes: [{ score: "" }] }, { player: "DALLU", holes: [{ score: "4" }] }),
    { player: "DALLU", holes: [{ score: "" }] }
  );
});
