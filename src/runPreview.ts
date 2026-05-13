import fs from "node:fs";
import path from "node:path";
import { buildEveryDollarTransactions } from "./buildTransactions";
import { parseStatementCsv } from "./parseStatement";

const statementPath = path.resolve("input/statement.csv");
const previewOutputPath = path.resolve("output/transactions-preview.json");

const run = (): void => {
  const parsed = parseStatementCsv(statementPath);
  const transactions = buildEveryDollarTransactions(parsed.expenses);

  fs.mkdirSync(path.dirname(previewOutputPath), { recursive: true });
  fs.writeFileSync(previewOutputPath, JSON.stringify(transactions, null, 2));

  console.log("Preview complete.");
  console.log(`- total rows read: ${parsed.totalRowsRead}`);
  console.log(`- expenses found: ${parsed.expenses.length}`);
  console.log(`- transactions prepared: ${transactions.length}`);
  console.log(`- skipped rows: ${parsed.skippedRows}`);
  console.log(`- preview output path: ${previewOutputPath}`);
};

run();
