/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the image/video Tools FastAPI backend. */
  readonly VITE_TOOLS_API_URL?: string;
  /** Supabase project URL — safe to ship (RLS enforces access). */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon key — safe to ship (RLS enforces access). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
