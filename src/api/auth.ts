import axios from "axios";
import * as crypto from "crypto";
import { API_BASE_URL, HEADERS } from "../utils/config";
import type { ApiResponse } from "../types";

export async function authenticate(): Promise<ApiResponse> {
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  if (!email || !password) {
    throw new Error("EMAIL and PASSWORD environment variables must be set");
  }

  const { data: loginResponse } = await axios.post(
    `${API_BASE_URL}/llu/auth/login`,
    { email, password },
    { headers: HEADERS }
  );

  const jwtToken = loginResponse?.data?.authTicket?.token;
  const accountId = loginResponse?.data?.user?.id;

  if (!jwtToken) throw new Error("Authentication failed");
  if (!accountId) throw new Error("Account ID not found");

  const accountIdHash = crypto.createHash("sha256").update(accountId).digest("hex");

  const { data: connectionsResponse } = await axios.get(
    `${API_BASE_URL}/llu/connections`,
    {
      headers: {
        ...HEADERS,
        authorization: `Bearer ${jwtToken}`,
        "account-id": accountIdHash,
      },
    }
  );

  const patientId = connectionsResponse?.data[0]?.patientId;
  if (!patientId) throw new Error("No patient ID found");

  return { jwtToken, accountIdHash, patientId };
}