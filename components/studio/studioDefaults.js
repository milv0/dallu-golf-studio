export const DEFAULT_CUSTOM_PLAYER = "PLAYER";

export const emptyHoleCard = () => ({
  player: "",
  hole: "",
  par: "",
  distance: "",
  toPar: "",
  currentShot: "",
  club: "",
  unit: "m",
  showResultBanner: true,
});

export const emptyThreeHoleCard = () => ({
  showHoleNumbers: false,
  total: "",
  toPar: "",
  holes: [
    { hole: "1", par: "", score: "" },
    { hole: "2", par: "", score: "" },
    { hole: "3", par: "", score: "" },
  ],
});

export const emptyManualNine = () => ({
  player: "",
  holes: Array.from({ length: 9 }, (_, i) => ({ hole: String(i + 1), par: "", score: "" })),
});

export const emptyCustomRound = () => ({
  player: "",
  country: "",
  course: "",
  date: "",
  holes: Array.from({ length: 18 }, (_, i) => ({ par: "", score: "" })),
});

export const emptyLinkedThree = () => ({
  showHoleNumbers: false,
  holes: [0, 1, 2],
});
