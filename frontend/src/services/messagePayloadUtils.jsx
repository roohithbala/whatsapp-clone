const DEFAULTS = {
  sticker: "[Sticker]", audio: "[Voice message]", doc: "[Document]",
  img: "[Photo]", vid: "[Video]", contact: "[Contact]",
  poll: "[Poll]", event: "[Event]"
};

export const normalizePayload = (p) => {
  if (!p || typeof p !== "object") return { messageType: "text", text: "", previewText: "" };
  
  const type = p.messageType || "text";
  let text = p.text || "";
  
  if (type === "audio") text = p.text || DEFAULTS.audio;
  if (type === "document") text = p.text || DEFAULTS.doc;
  if (type === "image") text = p.text || DEFAULTS.img;
  if (type === "video") text = p.text || DEFAULTS.vid;
  
  return { ...p, messageType: type, text, previewText: text, mediaUrl: p.mediaUrl || null };
};

export const serializePayload = (p) => JSON.stringify(normalizePayload(p));

export const parsePayload = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.messageType) return normalizePayload(parsed);
  } catch (e) {}
  return normalizePayload({ messageType: "text", text: raw });
};
