import * as dotenv from "dotenv";
import type { GlucoseData } from "./types";
import { authenticate } from "./api/auth";
import { fetchGlucoseData } from "./api/glucose";
import { displayChart } from "./utils/display";
import { CHART_CONFIG } from "./utils/config";

dotenv.config();

export async function main(): Promise<void> {
  console.clear();
  
  try {
    const auth = await authenticate();
    let data: GlucoseData[] = [];
    let nextUpdateTime = Date.now() + CHART_CONFIG.UPDATE_INTERVAL;
    
    const fetchAndUpdate = async () => {
      try {
        data = await fetchGlucoseData(auth);
        nextUpdateTime = Date.now() + CHART_CONFIG.UPDATE_INTERVAL;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error fetching data:", errorMessage);
      }
    };

    await fetchAndUpdate();
    
    const displayInterval = setInterval(() => displayChart(data, nextUpdateTime), CHART_CONFIG.DISPLAY_INTERVAL);
    const fetchInterval = setInterval(fetchAndUpdate, CHART_CONFIG.UPDATE_INTERVAL);
    
    process.on('SIGINT', () => {
      clearInterval(displayInterval);
      clearInterval(fetchInterval);
      console.log('\nGoodbye!');
      process.exit(0);
    });
    
    displayChart(data, nextUpdateTime);
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error:", errorMessage);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}