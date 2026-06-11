"use client";

import { encryptJson, decryptJson, type EncryptedPayload } from "@/lib/crypto";
import { getStatements, saveStatement, type StoredStatement } from "@/lib/statements-db";

export async function pushBackup(userId: string, dek: CryptoKey): Promise<void> {
  const statements = await getStatements(userId);
  const payload = await encryptJson<StoredStatement[]>(statements, dek);
  await fetch("/api/backup", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ encryptedData: payload.data, dataIv: payload.iv }),
  });
}

export async function mergeBackup(
  userId: string,
  encrypted: EncryptedPayload,
  dek: CryptoKey
): Promise<void> {
  const remote = await decryptJson<StoredStatement[]>(encrypted, dek);
  const local = await getStatements(userId);
  const localByMonth = new Map(local.map((s) => [s.month, s]));

  for (const r of remote) {
    const l = localByMonth.get(r.month);
    if (!l || new Date(r.uploadedAt) > new Date(l.uploadedAt)) {
      await saveStatement(userId, r.budget);
    }
  }
}
