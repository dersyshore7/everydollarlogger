import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { EveryDollarTransaction } from "./types";

export const runEveryDollarEntry = async (
  transactions: EveryDollarTransaction[],
  enteredOutputPath: string,
  errorsOutputPath: string
): Promise<void> => {
  const browser = await chromium.launch({ headless: false, channel: "chrome" });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://www.everydollar.com", { waitUntil: "domcontentloaded" });

  console.log("Please log in to EveryDollar manually in the opened Chrome window.");
  console.log("After login, open the Add Expense form if it is not already open.");
  console.log("Press Enter here when you are ready to continue...");

  await new Promise<void>((resolve) => {
    process.stdin.resume();
    process.stdin.once("data", () => resolve());
  });

  // TODO: Paste codegen-derived locators here.
  // Generate them using:
  // npx playwright codegen https://www.everydollar.com
  //
  // Example patterns to use (do not guess current selectors):
  // - page.getByRole("button", { name: "Add Expense" })
  // - page.getByPlaceholder("Description")
  // - page.getByPlaceholder("0.00")
  // - page.getByRole("button", { name: "Save" })
  //
  // IMPORTANT:
  // - Do not use x/y coordinates.
  // - Do not select account or budget item in this script.

  console.log("EveryDollar selectors need to be added from codegen before entries can be automated.");

  const entered = transactions.map((t) => ({ ...t, status: "skipped" as const }));
  const errors = [
    {
      message: "Selectors not implemented. Run Playwright codegen and add locators.",
      occurredAt: new Date().toISOString()
    }
  ];

  fs.mkdirSync(path.dirname(enteredOutputPath), { recursive: true });
  fs.writeFileSync(enteredOutputPath, JSON.stringify(entered, null, 2));
  fs.writeFileSync(errorsOutputPath, JSON.stringify(errors, null, 2));

  await browser.close();
};
