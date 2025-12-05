import * as SQLite from "expo-sqlite";

export type Expense = {
  id: number;         
  title: string;
  amount: number;
  date: string;
  category: string;
};

// Use the new sync open function
const db = SQLite.openDatabaseSync("undiyal.db");

// Create table (run once at startup)
export async function initDatabase() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL
    );
  `);
}

export async function getExpenses(): Promise<Expense[]> {
  const rows = await db.getAllAsync<Expense>(
    "SELECT * FROM expenses ORDER BY datetime(date) DESC;"
  );
  return rows ?? [];
}

export async function addExpense(
  title: string,
  amount: number,
  category: string
): Promise<void> {
  const date = new Date().toISOString();

  await db.runAsync(
    "INSERT INTO expenses (title, amount, date, category) VALUES (?, ?, ?, ?);",
    [title, amount, date, category]
  );
}

export async function deleteExpense(id: number): Promise<void> {
  await db.runAsync(
    "DELETE FROM expenses WHERE id = ?;",
    [id]
  );
}

export async function getMonthlyTotal(): Promise<number> {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1; // 0 = Jan, so +1
  const result = await db.getFirstAsync<{ total: number }>(
    `SELECT SUM(amount) as total
     FROM expenses
     WHERE strftime('%Y', date) = ? AND strftime('%m', date) = ?;`,
    [String(year), month.toString().padStart(2, "0")]
  );
  return result?.total ?? 0;
}