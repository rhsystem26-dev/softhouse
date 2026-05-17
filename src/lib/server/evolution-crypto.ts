import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from "crypto";

const ENV_KEY = "EVOLUTION_ENCRYPTION_KEY";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

let cachedKey: Buffer | null = null;

function loadKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw = process.env[ENV_KEY];
  if (!raw || raw.length === 0) {
    throw new Error(
      `${ENV_KEY} is required. Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`,
    );
  }

  let key: Buffer;
  try {
    key = Buffer.from(raw, "base64");
  } catch {
    throw new Error(`${ENV_KEY} must be valid base64`);
  }

  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `${ENV_KEY} must decode to ${KEY_LENGTH} bytes (base64-encoded 256-bit key). Got ${key.length} bytes.`,
    );
  }

  cachedKey = key;
  return key;
}

export function encryptSecret(value: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error("encryptSecret: value must be a non-empty string");
  }

  const key = loadKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

export function decryptSecret(value: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error("decryptSecret: value must be a non-empty string");
  }

  const key = loadKey();
  const raw = Buffer.from(value, "base64");

  if (raw.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error("decryptSecret: ciphertext too short");
  }

  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    throw new Error("decryptSecret: authentication failed (corrupted ciphertext or wrong key)");
  }
}

export function compareSecrets(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
