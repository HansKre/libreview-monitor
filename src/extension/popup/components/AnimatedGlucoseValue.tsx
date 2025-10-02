import React, { useState } from "react";
import { AnimatedCounter } from "react-animated-counter";
import { getGlucoseStatus } from "../utils/glucoseUtils";

type Props = {
  value?: number;
  isStale?: boolean;
};

export const AnimatedGlucoseValue: React.FC<Props> = ({
  value,
  isStale = false,
}) => {
  const [animationKey, setAnimationKey] = useState(0);
  const status = value ? getGlucoseStatus(value) : null;

  const handleDigitsClick = () => {
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div
      data-testid="animated-glucose-value"
      style={{
        display: "flex",
        alignItems: "flex-end",
        fontWeight: "bold",
        color: value ? (isStale ? "#808080" : status?.color) : "#666",
        lineHeight: "1",
        marginBottom: "-2px",
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={handleDigitsClick}
    >
      {value ? (
        <AnimatedCounter
          key={animationKey}
          value={value}
          fontSize="52px"
          decimalPrecision={0}
          color={isStale ? "#808080" : status?.color || "#666"}
          incrementColor={status?.color || "#666"}
          decrementColor={status?.color || "#666"}
          containerStyles={{
            fontFamily: "monospace",
          }}
        />
      ) : (
        "--"
      )}
      <span
        style={{
          fontSize: "20px",
          lineHeight: "30px",
          fontWeight: "normal",
          marginLeft: "4px",
        }}
      >
        mg/dL
      </span>
    </div>
  );
};
