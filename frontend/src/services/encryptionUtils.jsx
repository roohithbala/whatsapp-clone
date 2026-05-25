export const SHARED_ENCRYPTION_SALT = "whatsapp-clone-shared-conversation-salt";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const toBase64 = (bytes) => {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return window.btoa(binary);
};

export const fromBase64 = (value) => {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

export const deriveConversationKey = async (userAId, userBId) => {
  const conversationId = [userAId, userBId].sort().join(":");
  const baseSecret = encoder.encode(`${SHARED_ENCRYPTION_SALT}:${conversationId}`);
  const keyMaterial = await window.crypto.subtle.importKey("raw", baseSecret, "PBKDF2", false, ["deriveKey"]);
  return window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: encoder.encode(conversationId), iterations: 120000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptData = async (key, iv, data) => {
  return window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(data));
};

export const decryptData = async (key, iv, data, algorithm = "AES-GCM") => {
  const decrypted = await window.crypto.subtle.decrypt({ name: algorithm, iv }, key, data);
  return decoder.decode(decrypted);
};
