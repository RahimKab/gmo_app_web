/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_HEALTHCHECK_PATH?: string
  readonly VITE_DJANGO_DEV_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
