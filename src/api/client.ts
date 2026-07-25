//--- API client for the Cloud-Lord demo login page ---
//Cloned from doyen's generic request<T>() fetch wrapper. Two changes for this
//cross-origin static-on-CloudFront demo:
//  1. BASE_URL comes from the build-time Vite env (VITE_API_BASE_URL), which is
//     statically baked into the bundle — it is NOT read at runtime.
//  2. every call sends credentials:'include' so an httpOnly session cookie set
//     by the backend is stored/returned across the demo↔api-demo origin split.

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
    credentials: 'include', //carry the httpOnly session cookie cross-origin
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw { message: body.message ?? res.statusText, status: res.status } as ApiError
  }
  return res.json() as Promise<T>
}

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

//Bearer header for any later authenticated call (JWT path). The cookie path
//needs no header — credentials:'include' already carries the session cookie.
export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}
