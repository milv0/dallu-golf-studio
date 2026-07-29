"use client";

import { useEffect, useRef, useState } from "react";
import { readJsonStorage, STUDIO_STORAGE_KEYS, writeJsonStorage } from "../../lib/studioStorage";

export default function useStudioPersistence({
  round,
  setRound,
  holeCard,
  setHoleCard,
  linkedThree,
  setLinkedThree,
  customRound,
  setCustomRound,
  customHoleCard,
  setCustomHoleCard,
  manualNine,
  setManualNine,
  threeHole,
  setThreeHole,
}) {
  const [builtinCourses, setBuiltinCourses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [dbStatus, setDbStatus] = useState({ state: "disabled", count: 0, at: null });
  const loadedRef = useRef(false);

  const loadCourseDb = () => {
    setBuiltinCourses([]);
    setDbStatus({ state: "disabled", count: 0, at: null });
  };

  useEffect(() => {
    loadCourseDb();
    const savedFavorites = readJsonStorage(STUDIO_STORAGE_KEYS.favorites, []);
    setFavorites(Array.isArray(savedFavorites) ? savedFavorites : []);

    const savedRound = readJsonStorage(STUDIO_STORAGE_KEYS.round);
    if (savedRound && Array.isArray(savedRound.holes)) setRound(savedRound);

    const savedHoleCard = readJsonStorage(STUDIO_STORAGE_KEYS.holeCard);
    if (savedHoleCard && typeof savedHoleCard === "object") setHoleCard(savedHoleCard);

    const customSession = readJsonStorage(STUDIO_STORAGE_KEYS.customSession);
    if (customSession && typeof customSession === "object") {
      if (customSession.round && Array.isArray(customSession.round.holes)) {
        setCustomRound({ ...customSession.round, country: "", course: "", date: "" });
      }
      if (customSession.holeCard && typeof customSession.holeCard === "object") setCustomHoleCard(customSession.holeCard);
      if (customSession.threeHole && Array.isArray(customSession.threeHole.holes) && customSession.threeHole.holes.length === 3) setThreeHole(customSession.threeHole);
      if (customSession.manualNine && Array.isArray(customSession.manualNine.holes) && customSession.manualNine.holes.length === 9) setManualNine(customSession.manualNine);
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STUDIO_STORAGE_KEYS.legacyThreeHole);
      window.localStorage.removeItem(STUDIO_STORAGE_KEYS.legacyManualNine);
    }

    const savedLinkedThree = readJsonStorage(STUDIO_STORAGE_KEYS.linkedThree);
    if (savedLinkedThree && Array.isArray(savedLinkedThree.holes)) setLinkedThree({ ...savedLinkedThree, showHoleNumbers: false });

    loadedRef.current = true;
  }, [setRound, setHoleCard, setCustomRound, setCustomHoleCard, setThreeHole, setManualNine, setLinkedThree]);

  useEffect(() => {
    if (loadedRef.current) writeJsonStorage(STUDIO_STORAGE_KEYS.round, round);
  }, [round]);

  useEffect(() => {
    if (loadedRef.current) writeJsonStorage(STUDIO_STORAGE_KEYS.holeCard, holeCard);
  }, [holeCard]);

  useEffect(() => {
    if (loadedRef.current) writeJsonStorage(STUDIO_STORAGE_KEYS.linkedThree, linkedThree);
  }, [linkedThree]);

  useEffect(() => {
    if (!loadedRef.current) return;
    writeJsonStorage(STUDIO_STORAGE_KEYS.customSession, {
      round: customRound,
      manualNine,
      threeHole,
      holeCard: customHoleCard,
    });
  }, [customRound, customHoleCard, manualNine, threeHole]);

  const toggleFav = (name) => {
    setFavorites((prev) => {
      const next = prev.includes(name) ? prev.filter((n) => n !== name) : [name, ...prev];
      writeJsonStorage(STUDIO_STORAGE_KEYS.favorites, next);
      return next;
    });
  };

  return {
    builtinCourses,
    favorites,
    dbStatus,
    loadCourseDb,
    toggleFav,
  };
}
