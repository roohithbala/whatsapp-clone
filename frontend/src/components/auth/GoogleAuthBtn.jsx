import React, { useEffect } from "react";

export default function GoogleAuthBtn({ buttonId, textKey = "signin_with", onResponse }) {
  useEffect(() => {
    /* global google */
    if (typeof google !== "undefined") {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn("VITE_GOOGLE_CLIENT_ID is not configured. Google Sign-In button cannot be rendered.");
        return;
      }
      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: onResponse,
        });
        const element = document.getElementById(buttonId);
        if (element) {
          google.accounts.id.renderButton(element, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: textKey,
          });
        }
      } catch (err) {
        console.error("Failed to initialize Google Sign-In:", err);
      }
    }
  }, [buttonId, textKey, onResponse]);

  const hasClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!hasClientId) return null;

  return (
    <div className="mt-4 flex flex-col items-center justify-center gap-3 w-full">
      <div className="flex items-center w-full gap-2 text-xs text-[var(--text-muted)]">
        <div className="h-px bg-[var(--border-light)] flex-1"></div>
        <span>OR</span>
        <div className="h-px bg-[var(--border-light)] flex-1"></div>
      </div>
      <div id={buttonId} className="w-full min-h-[40px] flex justify-center"></div>
    </div>
  );
}
