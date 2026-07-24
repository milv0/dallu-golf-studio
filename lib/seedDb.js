// 코스 시드 DB (데이터 전용) — /admin 에서 생성. 이 파일(lib/seedDb.js)을 교체 후 배포하면 모든 사용자에게 공유됩니다.
export const SEED_DB = {
  "nines": [
    { "club": "오너스골프클럽", "nine": "Lake", "pars": [4, 4, 5, 3, 4, 4, 5, 3, 4] },
    { "club": "오너스골프클럽", "nine": "Hill", "pars": [4, 4, 3, 4, 4, 5, 3, 4, 5] },
    { "club": "엘리시안 강촌컨트리클럽", "nine": "HILL", "pars": [4, 5, 4, 3, 4, 4, 5, 3, 4] },
    { "club": "엘리시안 강촌컨트리클럽", "nine": "LAKE", "pars": [4, 5, 3, 4, 3, 5, 3, 5, 4] },
    { "club": "엘리시안 강촌컨트리클럽", "nine": "VALLEY", "pars": [4, 3, 5, 4, 4, 5, 3, 4, 4] },
    { "club": "라데나골프클럽", "nine": "NATURE", "pars": [4, 5, 3, 4, 4, 5, 3, 4, 4] },
    { "club": "라데나골프클럽", "nine": "GARDEN", "pars": [4, 4, 5, 3, 4, 4, 3, 4, 5] },
    { "club": "라데나골프클럽", "nine": "LAKE", "pars": [4, 3, 4, 5, 4, 3, 5, 4, 4] },
    { "club": "휘슬링락컨트리클럽", "nine": "TEMPLE", "pars": [4, 5, 4, 4, 4, 3, 5, 4, 4] },
    { "club": "휘슬링락컨트리클럽", "nine": "COCOON", "pars": [4, 5, 4, 4, 3, 4, 5, 3, 4] },
    { "club": "휘슬링락컨트리클럽", "nine": "CLOUD", "pars": [4, 5, 4, 3, 4, 4, 5, 3, 4] },
    { "club": "남춘천컨트리클럽", "nine": "VICTORY", "pars": [4, 4, 3, 4, 5, 3, 5, 4, 4] },
    { "club": "남춘천컨트리클럽", "nine": "CHALLENGE", "pars": [5, 4, 4, 3, 4, 4, 4, 3, 5] },
    { "club": "제이드팰리스 골프클럽", "nine": "WEST", "pars": [5, 4, 4, 5, 3, 4, 3, 4, 4] },
    { "club": "제이드팰리스 골프클럽", "nine": "EAST", "pars": [4, 4, 5, 3, 4, 3, 4, 4, 5] }
  ],
  "combos": [
    { "club": "오너스골프클럽", "out": "Hill", "in": "Lake" },
    { "club": "오너스골프클럽", "out": "Lake", "in": "Hill" },
    { "club": "엘리시안 강촌컨트리클럽", "out": "VALLEY", "in": "LAKE" },
    { "club": "엘리시안 강촌컨트리클럽", "out": "LAKE", "in": "HILL" },
    { "club": "엘리시안 강촌컨트리클럽", "out": "HILL", "in": "VALLEY" },
    { "club": "라데나골프클럽", "out": "NATURE", "in": "LAKE" },
    { "club": "라데나골프클럽", "out": "GARDEN", "in": "NATURE" },
    { "club": "라데나골프클럽", "out": "LAKE", "in": "GARDEN" },
    { "club": "휘슬링락컨트리클럽", "out": "CLOUD", "in": "TEMPLE" },
    { "club": "휘슬링락컨트리클럽", "out": "TEMPLE", "in": "COCOON" },
    { "club": "휘슬링락컨트리클럽", "out": "COCOON", "in": "CLOUD" },
    { "club": "제이드팰리스 골프클럽", "out": "WEST", "in": "EAST" },
    { "club": "남춘천컨트리클럽", "out": "CHALLENGE", "in": "VICTORY" },
    { "club": "남춘천컨트리클럽", "out": "VICTORY", "in": "CHALLENGE" },
    { "club": "제이드팰리스 골프클럽", "out": "EAST", "in": "WEST" }
  ]
};
