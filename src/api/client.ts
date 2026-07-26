//--- API client for the Cloud-Lord demo login page ---
//Cloned from doyen's generic request<T>() fetch wrapper. BASE_URL comes from the
//build-time Vite env (VITE_API_BASE_URL), statically baked into the bundle — it is
//NOT read at runtime. Auth is Bearer-token (JWT); no credentialed CORS.

const BASE_URL = import.meta.env.VITE_API_BASE_URL //https://api-demo.cloud-lord.com

export interface ApiError {
  message: string
  status: number
}

export interface LoginRequest {
  username: string
  password: string
}

//Auth-mechanism-agnostic (backend decides cookie vs JWT). Both are handled:
//token is optional (JWT path); a cookie-only backend sets it via Set-Cookie and
//needs nothing in the body. user/message are best-effort display fields.
export interface LoginResponse {
  token?: string
  user?: string
  message?: string
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    //Prefer the backend's `error` key; || (not ??) for the final fallback so "" never survives.
    const message = body.error ?? body.message ?? res.statusText ?? ''
    throw { message: message || `Request failed (${res.status})`, status: res.status } as ApiError
  }
  return res.json() as Promise<T>
}

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

//Bearer header for any later authenticated call (JWT path).
export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}
