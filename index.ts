import axios from "axios";
import * as dotenv from "dotenv";
import * as crypto from "crypto";

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

/**
 * api documentation:
 * https://gist.github.com/khskekec/6c13ba01b10d3018d816706a32ae8ab2
 */
async function login() {
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  if (!email || !password) {
    console.error("EMAIL and PASSWORD environment variables must be set");
    process.exit(1);
  }

  try {
    console.log("Making API requests...");

    // Retrieve auth token

    console.log("/llu/auth/login...");
    const { data: loginResponse } = await axios.post(
      `${API_BASE_URL}/llu/auth/login`,
      {
        email,
        password,
      },
      {
        headers: HEADERS,
      }
    );

    DEBUG && console.log("Login response:", loginResponse);

    const jwtToken = loginResponse?.data?.authTicket?.token;
    const accountId = loginResponse?.data?.user?.id;

    if (!jwtToken) {
      console.error("Authentication failed");
      process.exit(1);
    }

    if (!accountId) {
      console.error("Account ID not found");
      process.exit(1);
    }

    // SHA256 digest of a user's id as a 64-char hexadecimal string
    const accountIdHash = crypto
      .createHash("sha256")
      .update(accountId)
      .digest("hex");

    DEBUG && console.log("JWT Token:", jwtToken);
    DEBUG && console.log("Account ID Hash:", accountIdHash);

    // retrieve patientId

    console.log("/llu/connections...");
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

    DEBUG && console.log("Connections response:", connectionsResponse);

    const patientId = connectionsResponse?.data[0]?.patientId;

    if (!patientId) {
      console.error("No patient ID found");
      process.exit(1);
    }

    DEBUG && console.log("Patient ID:", patientId);

    // retrieve the blood glucose measurements

    console.log(`/llu/connections/${patientId}/graph...`);
    const { data: graphResponse } = await axios.get(
      `${API_BASE_URL}/llu/connections/${patientId}/graph`,
      {
        headers: {
          ...HEADERS,
          authorization: `Bearer ${jwtToken}`,
          "account-id": accountIdHash,
        },
      }
    );

    DEBUG && console.log("Graph response:", graphResponse);

    const currentMeasurementValue =
      graphResponse?.data?.connection?.glucoseMeasurement?.Value;

    if (!currentMeasurementValue) {
      console.error("No blood glucose value found");
      process.exit(1);
    }

    console.log("Blood Glucose:", currentMeasurementValue);

    // retrieve logBook data

    console.log(`/llu/connections/${patientId}/logbook...`);
    const { data: logBookResponse } = await axios.get(
      `${API_BASE_URL}/llu/connections/${patientId}/logbook`,
      {
        headers: {
          ...HEADERS,
          authorization: `Bearer ${jwtToken}`,
          "account-id": accountIdHash,
        },
      }
    );

    DEBUG && console.log("LogBook response:", logBookResponse);

    // idea: could plot graph from data.graphData
  } catch (error: any) {
    if (error.response) {
      console.error(
        "Error response:",
        error.response.config.url,
        error.response.data,
        "status:",
        error.response.status
      );
    } else {
      console.error("Error:", error.message);
    }
  }
}

login();
