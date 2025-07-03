// src/vite-env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COGNITO_APP_CLIENT_ID: string;
  readonly VITE_API_GATEWAY_INVOKE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}