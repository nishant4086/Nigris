import crypto from "crypto";

const getEncryptionKey = () => {
  const secret = process.env.SMTP_ENCRYPTION_SECRET || process.env.JWT_SECRET || "nigris_smtp_fallback_secret";
  return crypto.createHash("sha256").update(secret).digest();
};

export const encryptPassword = (password) => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(password, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encryptedPassword: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
};

export const decryptPassword = ({ encryptedPassword, iv, tag }) => {
  const key = getEncryptionKey();
  const ivBuffer = Buffer.from(iv, "base64");
  const tagBuffer = Buffer.from(tag, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, ivBuffer);
  decipher.setAuthTag(tagBuffer);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPassword, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};
