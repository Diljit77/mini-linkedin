import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET_KEY = crypto
  .createHash("sha256")
  .update(process.env.MESSAGE_SECRET || "super-secret-key")
  .digest(); // 32 bytes
const IV_LENGTH = 16;

// Encrypt text
export function encryptMessage(text) {
  if (!text) return null;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return {
    encryptedContent: encrypted,
    iv: iv.toString("hex"),
    authTag,
  };
}

// Decrypt text
export function decryptMessage({ encryptedContent, iv, authTag }) {
  if (!encryptedContent) return null;

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    SECRET_KEY,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(encryptedContent, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
