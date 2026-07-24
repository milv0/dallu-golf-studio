// 코스 시드 DB (골프장 기준 nested) — /admin 에서 생성.
// 구조: { "골프장": { nines: { "코스명": [9홀 par] }, combos: [{out,in}] } }
export const SEED_DB = {
  "휘슬링락컨트리클럽": {
    "nines": {
      "Temple": [4, 5, 4, 4, 4, 3, 5, 4, 3],
      "COCOON": [4, 5, 4, 4, 3, 4, 5, 3, 4],
      "CLOUD": [4, 5, 4, 3, 4, 4, 5, 3, 4]
    },
    "combos": [{ "out": "COCOON", "in": "CLOUD" }]
  },
  "오너스골프클럽": {
    "nines": {
      "Lake": [4, 4, 5, 3, 4, 4, 5, 3, 4],
      "Hill": [4, 4, 3, 4, 4, 5, 3, 4, 5]
    },
    "combos": [{ "out": "Hill", "in": "Lake" }, { "out": "Lake", "in": "Hill" }]
  },
  "엘리시안 강촌컨트리클럽": {
    "nines": {
      "HILL": [4, 5, 4, 3, 4, 4, 5, 3, 4],
      "LAKE": [4, 5, 3, 4, 3, 5, 3, 5, 4],
      "VALLEY": [4, 3, 5, 4, 4, 5, 3, 4, 4]
    },
    "combos": [{ "out": "VALLEY", "in": "LAKE" }, { "out": "LAKE", "in": "HILL" }, { "out": "HILL", "in": "VALLEY" }]
  },
  "라데나골프클럽": {
    "nines": {
      "NATURE": [4, 5, 3, 4, 4, 5, 3, 4, 4],
      "GARDEN": [4, 4, 5, 3, 4, 4, 3, 4, 5],
      "LAKE": [4, 3, 4, 5, 4, 3, 5, 4, 4]
    },
    "combos": [{ "out": "NATURE", "in": "LAKE" }, { "out": "GARDEN", "in": "NATURE" }, { "out": "LAKE", "in": "GARDEN" }]
  },
  "남춘천컨트리클럽": {
    "nines": {
      "VICTORY": [4, 4, 3, 4, 5, 3, 5, 4, 4],
      "CHALLENGE": [5, 4, 4, 3, 4, 4, 4, 3, 5]
    },
    "combos": [{ "out": "CHALLENGE", "in": "VICTORY" }, { "out": "VICTORY", "in": "CHALLENGE" }]
  },
  "제이드팰리스 골프클럽": {
    "nines": {
      "WEST": [5, 4, 4, 5, 3, 4, 3, 4, 4],
      "EAST": [4, 4, 5, 3, 4, 3, 4, 4, 5]
    },
    "combos": [{ "out": "WEST", "in": "EAST" }, { "out": "EAST", "in": "WEST" }]
  }
};
