export interface GlucoseData {
  FactoryTimestamp: string;
  Timestamp: string;
  type: number;
  ValueInMgPerDl: number;
  MeasurementColor: number;
  GlucoseUnits: number;
  Value: number;
  isHigh: boolean;
  isLow: boolean;
}

export interface ApiResponse {
  jwtToken: string;
  accountIdHash: string;
  patientId: string;
}