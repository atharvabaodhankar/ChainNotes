import CryptoJS from "crypto-js";

/**
 * Generate encryption key from user's wallet address
 * This ensures each user has a unique encryption key
 */
const generateEncryptionKey = (walletAddress) => {
  // Use wallet address + a secret phrase to generate key
  const secretPhrase = "Web3Notes_SecureKey_2025";
  return CryptoJS.SHA256(walletAddress + secretPhrase).toString();
};

/**
 * Encrypt note data before uploading to IPFS
 */
export const encryptNoteData = (noteData, walletAddress) => {
  try {
    const key = generateEncryptionKey(walletAddress);
    const dataString = JSON.stringify(noteData);

    // Encrypt using AES-256
    const encrypted = CryptoJS.AES.encrypt(dataString, key).toString();

    return {
      encrypted: true,
      data: encrypted,
      version: "1.0",
    };
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt note data");
  }
};

/**
 * Decrypt note data after fetching from IPFS
 */
export const decryptNoteData = (encryptedData, walletAddress) => {
  try {
    // Check if data is encrypted
    if (!encryptedData.encrypted) {
      // Handle legacy unencrypted data
      return encryptedData;
    }

    const key = generateEncryptionKey(walletAddress);

    // Decrypt using AES-256
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData.data, key);
    const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      throw new Error("Failed to decrypt - invalid key or corrupted data");
    }

    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption error:", error);
    return {
      title: "🔒 Encrypted Note",
      content:
        "Unable to decrypt this note. It may have been created with a different wallet.",
    };
  }
};

/**
 * Generate a secure random salt for additional security
 */
export const generateSalt = () => {
  return CryptoJS.lib.WordArray.random(128 / 8).toString();
};

/**
 * Hash sensitive data for verification without exposing content
 */
export const hashData = (data) => {
  return CryptoJS.SHA256(JSON.stringify(data)).toString();
};
