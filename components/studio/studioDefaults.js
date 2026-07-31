export const DEFAULT_CUSTOM_PLAYER = "PLAYER";

export function preservePlayer(next, current) {
  return { ...next, player: current?.player || "" };
}

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
  metaMode: "par",
  unit: "m",
  total: "",
  toPar: "",
  holes: [
    { hole: "1", par: "", score: "", distance: "" },
    { hole: "2", par: "", score: "", distance: "" },
    { hole: "3", par: "", score: "", distance: "" },
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
