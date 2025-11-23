/**
 * Token encryption utilities for secure storage.
 * 
 * Why this exists: Encrypts sensitive Zerodha access tokens before
 * storing in database to comply with security best practices.
 */

import crypto from "crypto";
import { secret } from "encore.dev/config";

/**
 * Encryption key from environment (32 bytes for AES-256).
 * 
 * Why this exists: Required for AES encryption/decryption
 */
const ENCRYPTION_KEY = secret("EncryptionKey");

/**
 * Algorithm used for encryption.
 * 
 * Why this exists: AES-256-GCM provides authenticated encryption
 */
const ALGORITHM = "aes-256-gcm";

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * 
 * @param plaintext - The text to encrypt
 * @returns Encrypted text with IV and auth tag prepended
 * 
 * Why this exists: Securely encrypts access tokens before database storage
 */
export function encrypt(plaintext: string): string {
  const key = Buffer.from(ENCRYPTION_KEY(), "utf8").subarray(0, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts an encrypted string using AES-256-GCM.
 * 
 * @param encryptedText - The encrypted text with IV and auth tag
 * @returns Decrypted plaintext
 * 
 * Why this exists: Decrypts access tokens retrieved from database
 */
export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(":");
  
  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error("Invalid encrypted text format");
  }

  const key = Buffer.from(ENCRYPTION_KEY(), "utf8").subarray(0, 32);
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Generates a cryptographically secure random string.
 * 
 * @param length - Byte length of random data (default: 32)
 * @returns Hex-encoded random string
 * 
 * Why this exists: Creates secure OAuth state parameters for CSRF protection
 */
export function generateRandomState(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

