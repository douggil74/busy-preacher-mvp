// lib/version.ts
// Centralized version number - reads from .env.local
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "5.0";
