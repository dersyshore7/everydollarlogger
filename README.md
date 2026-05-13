# everydollar-entry-bot

Small local TypeScript + Playwright automation helper that reads a downloaded bank statement CSV and prepares expense transactions for manual/assisted entry into EveryDollar in a visible Chrome browser.

## What this project does

- Reads `input/statement.csv`
- Parses expense transactions only
- Builds EveryDollar-ready transaction objects
- Writes preview output to `output/transactions-preview.json`
- Opens EveryDollar in visible Chrome and pauses for manual login during `npm run enter`

## What this project does NOT do

- No database
- No web app / Next.js
- No bank login automation
- No merchant/category rules
- No account selection
- No budget item selection
- No credential storage (bank or EveryDollar)

## Install

```bash
npm install
```

## Input CSV location

Put your downloaded statement CSV at:

- `input/statement.csv`

Supported column names:

- Date: `Date`, `Transaction Date`, `Posted Date`
- Description: `Description`, `Merchant`, `Name`
- Amount styles:
  - `Amount` (negative values are expenses)
  - `Debit` / `Credit` (debit values are expenses)

Parser is tolerant of dollar signs, commas, and parentheses.

## Run preview

```bash
npm run preview
```

This will print a summary:

- total rows read
- expenses found
- transactions prepared
- skipped rows
- preview output path

Then review:

- `output/transactions-preview.json`

## Transaction rounding rule

EveryDollar amount is always rounded to the next whole dollar above the absolute actual amount:

```ts
Math.floor(Math.abs(actualAmount)) + 1
```

Examples:

- `-16.75` -> `17.00`
- `-16.00` -> `17.00`
- `-17.00` -> `18.00`

EveryDollar description format:

```text
[Bank Description] - $[Actual Amount With 2 Decimals]
```

## Capture EveryDollar locators with Playwright codegen

Use codegen to capture selectors:

```bash
npx playwright codegen https://www.everydollar.com
```

Paste generated locator logic into `src/everydollarBot.ts` where TODO notes are located.

Use Playwright locators (`getByRole`, `getByPlaceholder`, `getByText`, and `locator` only when needed).
Do not use x/y coordinates.

## Run enter

```bash
npm run enter
```

Flow:

- Reads `output/transactions-preview.json`
- Opens visible Chrome (`chromium.launch({ headless: false, channel: "chrome" })`)
- Navigates to EveryDollar
- Waits for manual login
- Pauses for you to open Add Expense form if needed
- Currently prints a placeholder message until selectors are added

## Security note

This script does not store bank credentials or EveryDollar login credentials.
