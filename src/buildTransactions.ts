import { EveryDollarTransaction, ParsedBankTransaction } from "./types";

export const buildEveryDollarTransactions = (
  expenses: ParsedBankTransaction[]
): EveryDollarTransaction[] => {
  return expenses.map((expense) => {
    const absAmount = Math.abs(expense.actualAmount);
    const everyDollarAmount = Math.floor(absAmount) + 1;

    return {
      rowNumber: expense.rowNumber,
      date: expense.date,
      bankDescription: expense.bankDescription,
      actualAmount: expense.actualAmount,
      everyDollarAmount,
      everyDollarDescription: `${expense.bankDescription} - $${absAmount.toFixed(2)}`,
      status: "pending"
    };
  });
};
