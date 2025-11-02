import crypto from "crypto";

const algorithm = "aes-256-cbc";

// Derive key from ENV safely
const key =
  process.env.ENCRYPTION_KEY?.length === 64
    ? Buffer.from(process.env.ENCRYPTION_KEY, "hex")
    : crypto.createHash("sha256").update(process.env.ENCRYPTION_KEY || "default_secret_key").digest();

const iv = Buffer.alloc(16, 0); // static IV (you can randomize if you want)

// Encrypt helper
export const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  return cipher.update(text, "utf8", "hex") + cipher.final("hex");
};

// Decrypt helper
export const decrypt = (encryptedText) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  return decipher.update(encryptedText, "hex", "utf8") + decipher.final("utf8");
};
