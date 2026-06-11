"use client";

const PBKDF2_ITERATIONS = 210_000;

function bufToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBuf(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function randomBytes(len: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(new ArrayBuffer(len)));
}

export function generateSalt(): string {
  return bufToBase64(randomBytes(16));
}

export async function deriveKek(password: string, saltB64: string): Promise<CryptoKey> {
  const salt = base64ToBuf(saltB64);
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function generateDek(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function exportDekRaw(dek: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", dek);
  return bufToBase64(raw);
}

export async function importDekRaw(b64: string): Promise<CryptoKey> {
  const raw = base64ToBuf(b64);
  return crypto.subtle.importKey("raw", raw, "AES-GCM", true, ["encrypt", "decrypt"]);
}

export interface WrappedDek {
  wrappedDek: string;
  wrappedDekIv: string;
}

export async function wrapDek(dek: CryptoKey, kek: CryptoKey): Promise<WrappedDek> {
  const iv = randomBytes(12);
  const rawDek = await crypto.subtle.exportKey("raw", dek);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, kek, rawDek);
  return { wrappedDek: bufToBase64(ciphertext), wrappedDekIv: bufToBase64(iv) };
}

export async function unwrapDek(wrapped: WrappedDek, kek: CryptoKey): Promise<CryptoKey> {
  const iv = base64ToBuf(wrapped.wrappedDekIv);
  const ciphertext = base64ToBuf(wrapped.wrappedDek);
  const rawDek = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, kek, ciphertext);
  return crypto.subtle.importKey("raw", rawDek, "AES-GCM", true, ["encrypt", "decrypt"]);
}

export interface EncryptedPayload {
  data: string;
  iv: string;
}

export async function encryptJson<T>(payload: T, dek: CryptoKey): Promise<EncryptedPayload> {
  const iv = randomBytes(12);
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, dek, plaintext);
  return { data: bufToBase64(ciphertext), iv: bufToBase64(iv) };
}

export async function decryptJson<T>(payload: EncryptedPayload, dek: CryptoKey): Promise<T> {
  const iv = base64ToBuf(payload.iv);
  const ciphertext = base64ToBuf(payload.data);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, dek, ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}
