export const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"
const TOKEN_KEY = "token"
const USER_KEY = "username"

export type AuthMode = "login" | "registro"

export type AuthFields = {
  username: string
  email: string
  password: string
}

export async function authenticate(mode: AuthMode, fields: AuthFields) {
  const path = mode === "login" ? "/api/auth/local" : "/api/auth/local/register"
  const body =
    mode === "login"
      ? { identifier: fields.email, password: fields.password }
      : fields

  const res = await fetch(API_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message ?? "No se pudo completar la operación")

  localStorage.setItem(TOKEN_KEY, json.jwt)
  localStorage.setItem(USER_KEY, json.user.username)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUsername() {
  return localStorage.getItem(USER_KEY) ?? "Usuario"
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
