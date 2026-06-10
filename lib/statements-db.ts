import { openDB, type DBSchema } from "idb";
import type { Budget } from "@/lib/types";

export interface StoredStatement {
  id: string;
  userId: string;
  month: string;
  uploadedAt: string;
  budget: Budget;
}

interface MyThuneDB extends DBSchema {
  statements: {
    key: string;
    value: StoredStatement;
    indexes: { "by-user": string };
  };
}

const DB_NAME = "mythune";
const STORE_NAME = "statements";

function getDb() {
  return openDB<MyThuneDB>(DB_NAME, 1, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      store.createIndex("by-user", "userId");
    },
  });
}

function statementId(userId: string, month: string): string {
  return `${userId}::${month}`;
}

export async function getStatements(userId: string): Promise<StoredStatement[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex(STORE_NAME, "by-user", userId);
  return all.sort((a, b) => b.month.localeCompare(a.month));
}

export async function saveStatement(userId: string, budget: Budget): Promise<StoredStatement> {
  const db = await getDb();
  const statement: StoredStatement = {
    id: statementId(userId, budget.month),
    userId,
    month: budget.month,
    uploadedAt: budget.uploadedAt,
    budget,
  };
  await db.put(STORE_NAME, statement);
  return statement;
}

export async function deleteStatement(userId: string, id: string): Promise<void> {
  const db = await getDb();
  const statement = await db.get(STORE_NAME, id);
  if (statement?.userId !== userId) return;
  await db.delete(STORE_NAME, id);
}
