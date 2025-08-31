import React, { useEffect, useState } from "react";
import { ReferenceArea } from "recharts";

type props = {
  y1: number;
  y2: number;
};

export const DelayedReferenceArea: React.FC<props> = ({ y1, y2 }) => {
  const [showArea, setShowArea] = useState(false);

  // Show the reference area after the actual and projected lines have been drawn
  useEffect(() => {
    const timer = setTimeout(() => setShowArea(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ReferenceArea
      y1={y1}
      y2={y2}
      fill="#4caf50"
      fillOpacity={0.2}
      style={{
        opacity: showArea ? 1 : 0,
        transition: "opacity 0.25s ease-in",
      }}
    />
  );
};
