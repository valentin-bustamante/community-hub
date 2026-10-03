import { strapiCollection, strapiRequest } from "@/lib/strapi"

export type Comunidad = {
  id: number
  documentId: string
  nombre: string
}

export type Canal = {
  id: number
  documentId: string
  nombre: string
}

export type RolMembresia = "propietario" | "moderador" | "miembro"

export type Membresia = {
  id: number
  documentId: string
  rol: RolMembresia
  comunidad?: Comunidad | null
  usuario?: { id: number; username: string } | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseComunidad(value: unknown): Comunidad {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.documentId !== "string" ||
    typeof value.nombre !== "string"
  ) {
    throw new Error("Strapi devolvió una comunidad con un formato inesperado.")
  }
  return { id: value.id, documentId: value.documentId, nombre: value.nombre }
}

function parseCanal(value: unknown): Canal {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.documentId !== "string" ||
    typeof value.nombre !== "string"
  ) {
    throw new Error("Strapi devolvió un canal con un formato inesperado.")
  }
  return { id: value.id, documentId: value.documentId, nombre: value.nombre }
}

function parseMembresia(value: unknown): Membresia {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.documentId !== "string" ||
    (value.rol !== "propietario" && value.rol !== "moderador" && value.rol !== "miembro")
  ) {
    throw new Error("Strapi devolvió una membresía con un formato inesperado.")
  }

  const comunidad =
    value.comunidad === undefined
      ? undefined
      : value.comunidad === null
        ? null
        : parseComunidad(value.comunidad)
  let usuario: Membresia["usuario"]
  if ("usuario" in value) {
    if (value.usuario === null) {
      usuario = null
    } else if (
      isRecord(value.usuario) &&
      typeof value.usuario.id === "number" &&
      typeof value.usuario.username === "string"
    ) {
      usuario = { id: value.usuario.id, username: value.usuario.username }
    } else {
      throw new Error("Strapi devolvió un usuario de membresía con un formato inesperado.")
    }
  }

  return {
    id: value.id,
    documentId: value.documentId,
    rol: value.rol,
    ...(comunidad === undefined ? {} : { comunidad }),
    ...("usuario" in value ? { usuario } : {}),
  }
}

function validarDocumentId(documentId: string, recurso: string): string {
  const id = documentId.trim()
  if (!id) {
    throw new Error(`Se requiere el identificador de ${recurso}.`)
  }
  return encodeURIComponent(id)
}

export async function unirseAComunidad(codigoInvitacion: string): Promise<Comunidad> {
  return strapiRequest(
    "/api/comunidades/unirse",
    parseComunidad,
    { method: "POST", body: { codigoInvitacion } }
  )
}

export async function misMembresias(): Promise<Membresia[]> {
  return strapiCollection("/api/membresias", parseMembresia)
}

export async function misComunidades(): Promise<Comunidad[]> {
  const membresias = await misMembresias()
  return membresias.flatMap(({ comunidad }) => (comunidad ? [comunidad] : []))
}

export async function canalesDeComunidad(documentId: string): Promise<Canal[]> {
  const id = validarDocumentId(documentId, "la comunidad")
  return strapiCollection(`/api/canales?comunidad=${id}`, parseCanal)
}

export async function membresiasDeComunidad(documentId: string): Promise<Membresia[]> {
  const id = validarDocumentId(documentId, "la comunidad")
  return strapiCollection(`/api/membresias?comunidad=${id}`, parseMembresia)
}

export async function crearComunidad(nombre: string): Promise<Comunidad & { codigoInvitacion: string }> {
  return strapiRequest("/api/comunidades", (data) => {
    const comunidad = parseComunidad(data)
    if (!isRecord(data) || typeof data.codigoInvitacion !== "string") {
      throw new Error("Strapi no devolvió el código de invitación de la comunidad.")
    }
    return { ...comunidad, codigoInvitacion: data.codigoInvitacion }
  }, { method: "POST", body: { data: { nombre } } })
}

export async function codigoDeInvitacion(documentId: string): Promise<string> {
  const id = validarDocumentId(documentId, "la comunidad")
  return strapiRequest(`/api/comunidades/${id}`, (data) => {
    if (!isRecord(data) || typeof data.codigoInvitacion !== "string") {
      throw new Error("Strapi no devolvió el código de invitación de la comunidad.")
    }
    return data.codigoInvitacion
  })
}
