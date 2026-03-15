import { apiGet } from './client'

type DjangoHealthPayload = {
  status?: string
  detail?: string
}

function normalizeHealthPath(path: string): string {
  if (path.startsWith('/')) {
    return path
  }

  return `/${path}`
}

const HEALTHCHECK_PATH = normalizeHealthPath(
  import.meta.env.VITE_HEALTHCHECK_PATH ?? '/health/',
)

export async function getBackendHealth(): Promise<string> {
  const payload = await apiGet<DjangoHealthPayload>(HEALTHCHECK_PATH)

  return payload.status ?? payload.detail ?? 'ok'
}
