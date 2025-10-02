import React from "react";

type Props = {
  error?: string | null;
  loading: boolean;
  hasData: boolean;
};

export const ChartLoadingStates: React.FC<Props> = ({
  error,
  loading,
  hasData,
}) => {
  if (error) {
    return <div className="error">{error}</div>;
  }

  if (loading) {
    return <div className="loading">Loading glucose data...</div>;
  }

  if (!hasData) {
    return <div className="loading">No glucose data available</div>;
  }

  return null;
};
