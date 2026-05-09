import crypto from "crypto";

const getEncryptionKey = () => {
  const secret =
    process.env.API_KEY_ENCRYPTION_SECRET ||
    process.env.JWT_SECRET ||
    process.env.SESSION_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("API_KEY_ENCRYPTION_SECRET is not configured");
    }
    return crypto.createHash("sha256").update("nigris_dev_key").digest();
  }

  return crypto.createHash("sha256").update(secret).digest();
};

export const encryptApiKey = (rawKey) => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(rawKey, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encryptedKey: encrypted.toString("base64"),
    keyIv: iv.toString("base64"),
    keyTag: tag.toString("base64"),
  };
};

export const decryptApiKey = ({ encryptedKey, keyIv, keyTag }) => {
  if (!encryptedKey || !keyIv || !keyTag) {
    throw new Error("Encrypted API key data is missing");
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(keyIv, "base64");
  const tag = Buffer.from(keyTag, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedKey, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};
