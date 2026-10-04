import { API_URL, expireSession, getToken } from "@/lib/auth"

type StrapiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
}

export class StrapiApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = "StrapiApiError"
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function errorMessage(payload: unknown, status: number): string {
  if (status === 401) return "La sesión venció. Iniciá sesión nuevamente."
  if (isRecord(payload) && isRecord(payload.error) && typeof payload.error.message === "string") {
    return payload.error.message
  }

  if (status === 403) return "No tenés permiso para realizar esta operación."
  if (status === 404) return "No se encontró el recurso solicitado."
  return "No se pudo completar la solicitud a Strapi."
}

async function request(path: string, options: StrapiRequestOptions = {}): Promise<unknown> {
  const token = getToken()
  if (!token) {
    throw new StrapiApiError("Iniciá sesión para consultar los datos.", 401)
  }

  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  })
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json")
  }

  let response: Response
  try {
    response = await fetch(`${API_URL.replace(/\/+$/, "")}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    })
  } catch (error) {
    if (!(error instanceof TypeError)) throw error
    throw new StrapiApiError(
      "No se pudo conectar con Strapi. Revisá que el CMS esté iniciado y la URL configurada.",
      0
    )
  }
  const text = await response.text()
  let payload: unknown

  if (text) {
    try {
      payload = JSON.parse(text) as unknown
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error
      if (!response.ok) {
        throw new StrapiApiError(errorMessage(undefined, response.status), response.status)
      }
      throw new Error("Strapi devolvió una respuesta que no es JSON válido.")
    }
  }

  if (response.status === 401) {
    expireSession()
  }

  if (!response.ok) {
    throw new StrapiApiError(errorMessage(payload, response.status), response.status)
  }

  return payload
}

function responseData(payload: unknown): unknown {
  if (!isRecord(payload) || !("data" in payload)) {
    throw new Error("Strapi devolvió una respuesta con un formato inesperado.")
  }
  return payload.data
}

export async function strapiRequest<T>(
  path: string,
  parse: (data: unknown) => T,
  options: StrapiRequestOptions = {}
): Promise<T> {
  return parse(responseData(await request(path, options)))
}

export function strapiCollection<T>(
  path: string,
  parseItem: (item: unknown) => T
): Promise<T[]> {
  return strapiRequest(path, (data) => {
    if (!Array.isArray(data)) {
      throw new Error("Strapi devolvió una colección con un formato inesperado.")
    }
    return data.map(parseItem)
  })
}

export async function strapiDelete(path: string): Promise<void> {
  await request(path, { method: "DELETE" })
}
