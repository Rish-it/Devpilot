import crypto from "crypto";
import type { NextRequest } from "next/server";

export const COOKIE_NAME = "devpilot-auth";
const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const key = process.env.AUTH_ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error("AUTH_ENCRYPTION_KEY must be at least 32 characters");
  }
  return Buffer.from(key.slice(0, 32), "utf-8");
}

export function encryptToken(token: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(token, "utf-8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptToken(encryptedStr: string): string {
  const key = getEncryptionKey();
  const [ivHex, authTagHex, encrypted] = encryptedStr.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  try {
    return decryptToken(cookie.value);
  } catch {
    return null;
  }
}
