import axios from "axios";
import * as dotenv from "dotenv";
import * as crypto from "crypto";
import * as asciichart from "asciichart";

dotenv.config();

const DEBUG = false;
const API_BASE_URL = "https://api.libreview.io";
const HEADERS = {
  "accept-encoding": "gzip",
  "cache-control": "no-cache",
  connection: "Keep-Alive",
  "content-type": "application/json",
  product: "llu.android",
  version: "4.13.0",
};

interface GlucoseData {
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

interface ApiResponse {
  jwtToken: string;
  accountIdHash: string;
  patientId: string;
}

/**
 * api documentation:
 * https://gist.github.com/khskekec/6c13ba01b10d3018d816706a32ae8ab2
 */
async function authenticate(): Promise<ApiResponse> {
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  if (!email || !password) {
    throw new Error("EMAIL and PASSWORD environment variables must be set");
  }

  // Retrieve auth token
  const { data: loginResponse } = await axios.post(
    `${API_BASE_URL}/llu/auth/login`,
    { email, password },
    { headers: HEADERS }
  );

  const jwtToken = loginResponse?.data?.authTicket?.token;
  const accountId = loginResponse?.data?.user?.id;

  if (!jwtToken) throw new Error("Authentication failed");
  if (!accountId) throw new Error("Account ID not found");

  // SHA256 digest of a user's id as a 64-char hexadecimal string
  const accountIdHash = crypto.createHash("sha256").update(accountId).digest("hex");

  // retrieve patientId
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

async function fetchGlucoseData(auth: ApiResponse): Promise<GlucoseData[]> {
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

function displayGlucoseChart(data: GlucoseData[]) {
  const values = data.map(d => d.Value);
  const latest = values[values.length - 1];
  
  const chart = asciichart.plot(values, {
    height: 15,
    colors: [asciichart.blue]
  });

  console.clear();
  console.log('🩸 Blood Glucose Monitor');
  console.log(`Current: ${latest} mg/dL`);
  console.log(`Readings: ${values.length}`);
  console.log(chart);
  console.log(`Last updated: ${new Date().toLocaleTimeString()}`);
}

async function main() {
  try {
    console.log("Authenticating...");
    const auth = await authenticate();
    
    let data: GlucoseData[] = [];
    
    const fetchAndUpdate = async () => {
      try {
        data = await fetchGlucoseData(auth);
        displayGlucoseChart(data);
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
      }
    };

    // Initial fetch
    await fetchAndUpdate();
    
    // Refetch every minute
    setInterval(fetchAndUpdate, 60000);
    
  } catch (error: any) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
