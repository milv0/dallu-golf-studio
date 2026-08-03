import assert from "node:assert/strict";
import test from "node:test";
import { makeFieldSetter, makeHoleSetter, studioModeFlags } from "../lib/studioModes.js";

test("custom routes default to the custom source", () => {
  const f = studioModeFlags({ mode: "score18" });
  assert.equal(f.sourceMode, "custom");
  assert.equal(f.isFullCustom, true);
  assert.equal(f.isScore18, true);
  assert.equal(f.isRoundEditor, true);
  assert.equal(f.format, "youtube");
  assert.equal(f.usesRoundSource, false);
  assert.equal(f.activeNav, "score18");
});

test("round mode implies the round source and 18-hole editor", () => {
  const f = studioModeFlags({ mode: "round" });
  assert.equal(f.sourceMode, "round");
  assert.equal(f.isFullCustom, false);
  assert.equal(f.isScore18, true);
  assert.equal(f.activeNav, "score18");
});

test("9/3 hole modes use reels sizing", () => {
  for (const [mode, nav] of [["score9", "score9"], ["score3", "score3"]]) {
    const f = studioModeFlags({ mode, source: "custom" });
    assert.equal(f.isReelsSizedScore, true);
    assert.equal(f.format, "reels");
    assert.equal(f.reelsCustom, true);
    assert.equal(f.activeNav, nav);
  }
  assert.equal(studioModeFlags({ mode: "score3" }).reelsV3, true);
  assert.equal(studioModeFlags({ mode: "score9" }).reelsV3, false);
});

test("linked 9/3 and 1-hole modes read from the round source", () => {
  assert.equal(studioModeFlags({ mode: "score9", source: "round" }).usesRoundSource, true);
  assert.equal(studioModeFlags({ mode: "score3", source: "round" }).usesRoundSource, true);
  assert.equal(studioModeFlags({ mode: "hole", source: "round" }).usesRoundSource, true);
  // 완전 커스텀은 라운드 데이터를 참조하지 않는다.
  assert.equal(studioModeFlags({ mode: "hole", source: "custom" }).usesRoundSource, false);
});

test("home mode leaves the nav unselected", () => {
  const f = studioModeFlags();
  assert.equal(f.activeNav, "");
  assert.equal(f.isHole, false);
  assert.equal(f.isScore18, false);
});

test("makeFieldSetter updates one key without mutating the previous state", () => {
  const prev = { player: "A", course: "B" };
  let next;
  makeFieldSetter((fn) => { next = fn(prev); })("player", "C");
  assert.deepEqual(next, { player: "C", course: "B" });
  assert.equal(prev.player, "A");
});

test("makeHoleSetter updates only the target hole", () => {
  const prev = { holes: [{ par: "4", score: "" }, { par: "3", score: "" }] };
  let next;
  makeHoleSetter((fn) => { next = fn(prev); })(1, "score", "5");
  assert.deepEqual(next.holes, [{ par: "4", score: "" }, { par: "3", score: "5" }]);
  assert.equal(prev.holes[1].score, "");
  assert.notEqual(next.holes[1], prev.holes[1]);
  assert.equal(next.holes[0], prev.holes[0]);
});
