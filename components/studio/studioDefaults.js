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
    { hole: "1", par: "4", score: "" },
    { hole: "2", par: "4", score: "" },
    { hole: "3", par: "4", score: "" },
  ],
});

export const emptyManualNine = () => ({
  player: "",
  holes: Array.from({ length: 9 }, (_, i) => ({ hole: String(i + 1), par: "4", score: "" })),
});

export const emptyLinkedThree = () => ({
  showHoleNumbers: false,
  holes: [0, 1, 2],
});
