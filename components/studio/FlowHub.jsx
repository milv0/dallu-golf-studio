"use client";

import { useEffect } from "react";
import { storedFlowHref } from "./StudioNav";

const FLOW_SOURCE = {
  custom: "custom",
  round: "round",
};

export default function FlowHub({ flow = "custom" }) {
  const sourceMode = FLOW_SOURCE[flow] || "custom";

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.location.replace(storedFlowHref(sourceMode));
  }, [sourceMode]);

  return null;
}
