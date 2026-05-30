import { useState, useRef } from "react";
import userService from "../services/userService";

const API_BASE = "http://localhost:5000";

export const useChatAttachment = (onSendPayload, setIsAttachOpen, setShowContactModal, setShowPollModal, setShowEventModal) => {
  const fileInputRef = useRef(null);
  const [fileType, setFileType] = useState("image");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileAction = (type) => {
    setFileType(type);
    setIsAttachOpen(false);

    if (type === "contact") {
      setShowContactModal(true);
      return;
    }
    if (type === "poll") {
      setShowPollModal(true);
      return;
    }
    if (type === "event") {
      setShowEventModal(true);
      return;
    }

    if (type === "camera") {
      fileInputRef.current?.setAttribute("capture", "environment");
      fileInputRef.current?.setAttribute("accept", "image/*,video/*");
    } else if (type === "audio") {
      fileInputRef.current?.removeAttribute("capture");
      fileInputRef.current?.setAttribute("accept", "audio/*");
    } else if (type === "sticker") {
      fileInputRef.current?.removeAttribute("capture");
      fileInputRef.current?.setAttribute("accept", "image/png,image/webp,image/gif,image/jpeg");
    } else {
      fileInputRef.current?.removeAttribute("capture");
      fileInputRef.current?.setAttribute(
        "accept",
        type === "photos" ? "image/*,video/*" : type === "document" ? ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx" : "*/*"
      );
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 16 * 1024 * 1024; // 16MB
    if (file.size > MAX_SIZE) {
      alert("File too large. Max 16MB.");
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const isAudio = file.type.startsWith("audio/");

    // Check if isDocument based on file type or extension
    const documentExtensions = [".pdf", ".doc", ".docx", ".txt", ".xls", ".xlsx", ".ppt", ".pptx"];
    const isDoc = documentExtensions.some(ext => file.name.toLowerCase().endsWith(ext)) ||
                  file.type === "application/pdf" ||
                  file.type.startsWith("application/vnd.") ||
                  file.type.startsWith("text/");

    let msgType;
    if (fileType === "sticker") {
      if (!isImage) {
        alert("Stickers must be image files (png, webp, gif, jpeg).");
        e.target.value = "";
        return;
      }
      msgType = "sticker";
    } else if (fileType === "audio") {
      if (!isAudio) {
        alert("Please select an audio file (mp3, wav, ogg, etc.).");
        e.target.value = "";
        return;
      }
      msgType = "audio";
    } else if (fileType === "photos" || fileType === "camera") {
      if (!isImage && !isVideo) {
        alert("Please select a photo or video file.");
        e.target.value = "";
        return;
      }
      msgType = isImage ? "image" : "video";
    } else if (fileType === "document") {
      if (!isDoc) {
        alert("Please select a valid document file (.pdf, .doc, .docx, .txt, .xls, .xlsx, .ppt, .pptx).");
        e.target.value = "";
        return;
      }
      msgType = "document";
    } else {
      msgType = isImage ? "image" : isVideo ? "video" : isAudio ? "audio" : "document";
    }

    setIsUploading(true);
    try {
      const uploadedData = await userService.uploadFile(file);
      const serverUrl = uploadedData.url.startsWith("http")
        ? uploadedData.url
        : `${API_BASE}${uploadedData.url}`;

      onSendPayload({
        text: file.name,
        messageType: msgType,
        mediaUrl: serverUrl,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Upload failed:", err);
      const localUrl = URL.createObjectURL(file);
      onSendPayload({
        text: file.name,
        messageType: msgType,
        mediaUrl: localUrl,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return {
    fileInputRef,
    isUploading,
    handleFileAction,
    handleFileChange
  };
};
