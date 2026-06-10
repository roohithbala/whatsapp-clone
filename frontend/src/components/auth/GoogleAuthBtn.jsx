import React, { useEffect, useRef } from "react";

let googleInitializedClientId = null;
let latestGoogleResponseHandler = null;

export default function GoogleAuthBtn({ buttonId, textKey = "signin_with", onResponse }) {
  const containerRef = useRef(null);

  useEffect(() => {
    latestGoogleResponseHandler = onResponse;
  }, [onResponse]);

  useEffect(() => {
    /* global google */
    if (typeof google !== "undefined") {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn("VITE_GOOGLE_CLIENT_ID is not configured. Google Sign-In button cannot be rendered.");
        return;
      }
      try {
        if (googleInitializedClientId !== clientId) {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => latestGoogleResponseHandler?.(response),
          });
          googleInitializedClientId = clientId;
        }
        const element = containerRef.current;
        if (element) {
          element.replaceChildren();
          google.accounts.id.renderButton(element, {
            theme: "outline",
            size: "large",
            width: Math.max(240, Math.floor(element.getBoundingClientRect().width || 320)),
            text: textKey,
          });
        }
      } catch (err) {
        console.error("Failed to initialize Google Sign-In:", err);
      }
    }
  }, [buttonId, textKey]);

  const hasClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!hasClientId) return null;

  return (
    <div className="mt-4 flex flex-col items-center justify-center gap-3 w-full">
      <div className="flex items-center w-full gap-2 text-xs text-[var(--text-muted)]">
        <div className="h-px bg-[var(--border-light)] flex-1"></div>
        <span>OR</span>
        <div className="h-px bg-[var(--border-light)] flex-1"></div>
      </div>
      <div ref={containerRef} id={buttonId} className="w-full min-h-[40px] flex justify-center"></div>
    </div>
  );
}
