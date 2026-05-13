export type ParsedBankTransaction = {
  rowNumber: number;
  date: string;
  bankDescription: string;
  actualAmount: number;
};

export type EveryDollarTransaction = {
  rowNumber: number;
  date: string;
  bankDescription: string;
  actualAmount: number;
  everyDollarAmount: number;
  everyDollarDescription: string;
  status: "pending" | "entered" | "error" | "skipped";
};

export type PreviewSummary = {
  totalRowsRead: number;
  expensesFound: number;
  transactionsPrepared: number;
  skippedRows: number;
};
