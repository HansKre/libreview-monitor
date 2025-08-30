import axios from "axios";
import { API_BASE_URL, HEADERS } from "../utils/config";
import type { ApiResponse, GlucoseData } from "../types";

export async function fetchGlucoseData(auth: ApiResponse): Promise<GlucoseData[]> {
  const { data: graphResponse } = await axios.get(
    `${API_BASE_URL}/llu/connections/${auth.patientId}/graph`,
    {
      headers: {
        ...HEADERS,
        authorization: `Bearer ${auth.jwtToken}`,
        "account-id": auth.accountIdHash,
      },
    }
  );

  return graphResponse?.data?.graphData || [];
}