"use client";

import ScoreEntryGrid from "./ScoreEntryGrid";

export default function HoleGroup({ holes, offset, setHole, scoreRefs, onScoreKey, scoreMode, parLocked }) {
  return (
    <ScoreEntryGrid
      holes={holes}
      offset={offset}
      setHole={setHole}
      scoreRefs={scoreRefs}
      onScoreKey={onScoreKey}
      scoreMode={scoreMode}
      parLocked={parLocked}
      showSum
    />
  );
}
