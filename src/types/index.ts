export interface GlucoseData {
  FactoryTimestamp: string;
  Timestamp: string;
  type: number;
  ValueInMgPerDl: number;
  TrendArrow?: number;
  TrendMessage?: string | null;
  MeasurementColor: number;
  GlucoseUnits: number;
  Value: number;
  isHigh: boolean;
  isLow: boolean;
  alarmType?: number;
}

export interface ApiResponse {
  jwtToken: string;
  accountIdHash: string;
  patientId: string;
}

export interface LoginResponse {
  status?: number;
  data?: {
    authTicket?: { token?: string };
    user?: { id?: string };
    redirect?: boolean;
    region?: string;
  };
}

export interface ConnectionsResponse {
  data?: Array<{ patientId?: string }>;
}

export interface GraphResponse {
  data?: {
    graphData?: GlucoseData[];
    connection?: {
      glucoseMeasurement?: { Value?: number };
    };
  };
}
