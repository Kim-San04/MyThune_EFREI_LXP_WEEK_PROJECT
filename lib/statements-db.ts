import { openDB, type DBSchema } from "idb";
import type { Budget } from "@/lib/types";

export interface StoredStatement {
  id: string;
  userId: string;
  month: string;
  uploadedAt: string;
  budget: Budget;
}

interface VaultKeyEntry {
  userId: string;
  dek: string;
}

interface MyThuneDB extends DBSchema {
  statements: {
    key: string;
    value: StoredStatement;
    indexes: { "by-user": string };
  };
  vaultKeys: {
    key: string;
    value: VaultKeyEntry;
  };
}

const DB_NAME = "mythune";
const STORE_NAME = "statements";
const VAULT_KEYS_STORE = "vaultKeys";

function getDb() {
  return openDB<MyThuneDB>(DB_NAME, 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("by-user", "userId");
      }
      if (oldVersion < 2) {
        db.createObjectStore(VAULT_KEYS_STORE, { keyPath: "userId" });
      }
    },
  });
}

export async function getCachedDek(userId: string): Promise<string | null> {
  const db = await getDb();
  const entry = await db.get(VAULT_KEYS_STORE, userId);
  return entry?.dek ?? null;
}

export async function saveCachedDek(userId: string, dek: string): Promise<void> {
  const db = await getDb();
  await db.put(VAULT_KEYS_STORE, { userId, dek });
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
