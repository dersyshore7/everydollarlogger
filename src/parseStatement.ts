import fs from "node:fs";
import { ParsedBankTransaction } from "./types";

const DATE_COLUMNS = ["Date", "Transaction Date", "Posted Date"];
const DESCRIPTION_COLUMNS = ["Description", "Merchant", "Name"];

const parseCsvLine = (line: string): string[] => {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
};

const toNumber = (raw: string): number | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const isParenNegative = trimmed.startsWith("(") && trimmed.endsWith(")");
  const normalized = trimmed
    .replace(/[,$\s]/g, "")
    .replace(/^\(/, "-")
    .replace(/\)$/, "");

  if (!normalized || normalized === "-" || normalized === ".") return null;

  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) return null;

  if (isParenNegative && parsed > 0) {
    return -parsed;
  }

  return parsed;
};

const getColumnIndex = (headers: string[], candidates: string[]): number => {
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());
  for (const candidate of candidates) {
    const idx = normalizedHeaders.indexOf(candidate.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
};

export const parseStatementCsv = (
  csvPath: string
): { expenses: ParsedBankTransaction[]; totalRowsRead: number; skippedRows: number } => {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }

  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    throw new Error("Statement CSV is empty.");
  }

  const headers = parseCsvLine(lines[0]);
  const dateIdx = getColumnIndex(headers, DATE_COLUMNS);
  const descriptionIdx = getColumnIndex(headers, DESCRIPTION_COLUMNS);
  const amountIdx = getColumnIndex(headers, ["Amount"]);
  const debitIdx = getColumnIndex(headers, ["Debit"]);
  const creditIdx = getColumnIndex(headers, ["Credit"]);

  if (dateIdx === -1) {
    throw new Error(`Missing required date column. Expected one of: ${DATE_COLUMNS.join(", ")}`);
  }

  if (descriptionIdx === -1) {
    throw new Error(
      `Missing required description column. Expected one of: ${DESCRIPTION_COLUMNS.join(", ")}`
    );
  }

  if (amountIdx === -1 && debitIdx === -1) {
    throw new Error("Missing amount columns. Expected either 'Amount' or 'Debit'/'Credit'.");
  }

  const expenses: ParsedBankTransaction[] = [];
  let skippedRows = 0;

  lines.slice(1).forEach((line, i) => {
    const rowNumber = i + 2;
    const row = parseCsvLine(line);
    const date = (row[dateIdx] ?? "").trim();
    const bankDescription = (row[descriptionIdx] ?? "").trim();

    if (!date || !bankDescription) {
      skippedRows += 1;
      return;
    }

    let actualAmount: number | null = null;

    if (amountIdx !== -1) {
      const parsedAmount = toNumber(row[amountIdx] ?? "");
      if (parsedAmount !== null && parsedAmount < 0) {
        actualAmount = parsedAmount;
      }
    } else if (debitIdx !== -1) {
      const parsedDebit = toNumber(row[debitIdx] ?? "");
      if (parsedDebit !== null && parsedDebit !== 0) {
        actualAmount = parsedDebit < 0 ? parsedDebit : -Math.abs(parsedDebit);
      }

      if (actualAmount === null && creditIdx !== -1) {
        // Explicitly ignoring credits/income rows for this version.
        skippedRows += 1;
        return;
      }
    }

    if (actualAmount === null) {
      skippedRows += 1;
      return;
    }

    expenses.push({
      rowNumber,
      date,
      bankDescription,
      actualAmount
    });
  });

  return {
    expenses,
    totalRowsRead: lines.length - 1,
    skippedRows
  };
};
