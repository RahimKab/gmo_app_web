type ApiErrorPayload = {
  detail?: string
  message?: string
}

type RequestOptions = {
  method: 'GET' | 'POST'
  body?: Record<string, unknown> | FormData
}

const TOKEN_KEY = 'auth_token'

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

function trimSlash(value: string): string {
  if (value.endsWith('/')) {
    return value.slice(0, -1)
  }

  return value
}

function normalizePath(path: string): string {
  if (path.startsWith('/')) {
    return path
  }

  return `/${path}`
}

const API_BASE_URL = trimSlash(import.meta.env.VITE_API_BASE_URL ?? '/api')

function buildUrl(path: string): string {
  return `${API_BASE_URL}${normalizePath(path)}`
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const contentType = response.headers.get('content-type') ?? ''
  const isJsonResponse = contentType.includes('application/json')

  if (isJsonResponse) {
    const payload = (await response.json()) as ApiErrorPayload
    if (payload.detail) return payload.detail
    if (payload.message) return payload.message

    // DRF field-level validation errors: { field: ["msg", ...], ... }
    const fieldErrors = Object.entries(payload as Record<string, unknown>)
      .flatMap(([field, msgs]) => {
        const messages = Array.isArray(msgs) ? msgs : [String(msgs)]
        return messages.map((m) => `${field}: ${m}`)
      })
    if (fieldErrors.length > 0) return fieldErrors.join(' | ')
  }

  const textPayload = await response.text()
  return textPayload.trim() || fallback
}

async function apiRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const token = getToken()
  const isFormDataPayload = options.body instanceof FormData
  let requestBody: BodyInit | undefined

  if (options.body instanceof FormData) {
    requestBody = options.body
  } else if (options.body) {
    requestBody = JSON.stringify(options.body)
  }

  const response = await fetch(buildUrl(path), {
    method: options.method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...(options.body && !isFormDataPayload ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(requestBody ? { body: requestBody } : {}),
  })

  const contentType = response.headers.get('content-type') ?? ''
  const isJsonResponse = contentType.includes('application/json')

  if (!response.ok) {
    const errorMessage = await readErrorMessage(
      response,
      `Request failed with status ${response.status}`,
    )

    throw new ApiError(errorMessage, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  if (!isJsonResponse) {
    throw new ApiError('Reponse JSON attendue de l\'API', response.status)
  }

  return (await response.json()) as T
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, {
    method: 'GET',
  })
}

export async function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  return apiRequest<TResponse>(path, {
    method: 'POST',
    body: body as Record<string, unknown>,
  })
}

export async function apiPostForm<TResponse>(path: string, body: FormData): Promise<TResponse> {
  return apiRequest<TResponse>(path, {
    method: 'POST',
    body,
  })
}
