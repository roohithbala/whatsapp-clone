import React from "react";

export const DURATIONS = [
  {
    value: "off",
    label: "Off",
    sublabel: "Messages won't automatically disappear",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M11.5 4a8 8 0 0 1 8 8" />
        <path d="M12 20a8 8 0 0 1-8-8 8 8 0 0 1 .53-2.89" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    value: "24h",
    label: "24 hours",
    sublabel: "Messages disappear after 1 day",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    value: "7d",
    label: "7 days",
    sublabel: "Messages disappear after 1 week",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    value: "90d",
    label: "90 days",
    sublabel: "Messages disappear after 3 months",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];
