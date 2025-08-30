import * as dotenv from "dotenv";
import React from "react";
import { render } from "ink";
import { App } from "./components/App";

dotenv.config();

export async function main(): Promise<void> {
  render(<App />);
}

if (require.main === module) {
  main();
}