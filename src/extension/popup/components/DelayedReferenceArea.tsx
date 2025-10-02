import React, { useEffect, useState } from "react";
import { ReferenceArea } from "recharts";
import { REFERENCE_AREAS, ANIMATION_CONFIG } from "../config/glucoseConfig";

type Props = {
  y1: number;
  y2: number;
  fill?: string;
  fillOpacity?: number;
};

export const DelayedReferenceArea: React.FC<Props> = ({
  y1,
  y2,
  fill = REFERENCE_AREAS.NORMAL.fill,
  fillOpacity = REFERENCE_AREAS.NORMAL.fillOpacity,
}) => {
  const [showArea, setShowArea] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setShowArea(true),
      ANIMATION_CONFIG.referenceArea.delay,
    );
    return () => clearTimeout(timer);
  }, []);

  return (
    <ReferenceArea
      y1={y1}
      y2={y2}
      fill={fill}
      fillOpacity={fillOpacity}
      style={{
        opacity: showArea ? 1 : 0,
        transition: `opacity ${ANIMATION_CONFIG.referenceArea.duration}ms ease-in`,
      }}
    />
  );
};
