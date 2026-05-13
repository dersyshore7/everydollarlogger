import fs from "node:fs";
import path from "node:path";
import { runEveryDollarEntry } from "./everydollarBot";
import { EveryDollarTransaction } from "./types";

const previewPath = path.resolve("output/transactions-preview.json");
const enteredPath = path.resolve("output/entered-transactions.json");
const errorsPath = path.resolve("output/errors.json");

const run = async (): Promise<void> => {
  if (!fs.existsSync(previewPath)) {
    throw new Error(`Missing preview file at ${previewPath}. Run 'npm run preview' first.`);
  }

  const parsed = JSON.parse(fs.readFileSync(previewPath, "utf8")) as EveryDollarTransaction[];
  await runEveryDollarEntry(parsed, enteredPath, errorsPath);
};

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`runEnter failed: ${message}`);
  process.exit(1);
});
