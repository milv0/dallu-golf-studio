// 코스 시드 DB (데이터 전용) — /admin 에서 생성. 이 파일(lib/seedDb.js)을 교체 후 배포하면 모든 사용자에게 공유됩니다.
export const SEED_DB = {
  "nines": [
    { "club": "엘리시안 강촌컨트리클럽", "nine": "HILL", "pars": [4, 5, 4, 3, 4, 4, 5, 3, 4] },
    { "club": "엘리시안 강촌컨트리클럽", "nine": "LAKE", "pars": [4, 5, 3, 4, 3, 5, 3, 5, 4] },
    { "club": "엘리시안 강촌컨트리클럽", "nine": "VALLEY", "pars": [4, 3, 5, 4, 4, 5, 3, 4, 4] },
    { "club": "라데나골프클럽", "nine": "NATURE", "pars": [4, 5, 3, 4, 4, 5, 3, 4, 4] },
    { "club": "라데나골프클럽", "nine": "GARDEN", "pars": [4, 4, 5, 3, 4, 4, 3, 4, 5] },
    { "club": "라데나골프클럽", "nine": "LAKE", "pars": [4, 3, 4, 5, 4, 3, 5, 4, 4] }
  ],
  "combos": [
    { "club": "엘리시안 강촌컨트리클럽", "out": "VALLEY", "in": "LAKE" },
    { "club": "엘리시안 강촌컨트리클럽", "out": "LAKE", "in": "HILL" },
    { "club": "엘리시안 강촌컨트리클럽", "out": "HILL", "in": "VALLEY" },
    { "club": "라데나골프클럽", "out": "NATURE", "in": "LAKE" },
    { "club": "라데나골프클럽", "out": "GARDEN", "in": "NATURE" },
    { "club": "라데나골프클럽", "out": "LAKE", "in": "GARDEN" }
  ]
};
