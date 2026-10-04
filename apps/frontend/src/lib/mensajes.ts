import { strapiCollection, strapiRequest } from "@/lib/strapi"

export type Mensaje = {
  id: number
  documentId: string
  contenido: string
  createdAt: string
  autor: string
}

function parseMensaje(value: unknown): Mensaje {
  const mensaje = value as Partial<Mensaje> & { usuario?: { username?: unknown } | null }
  if (
    typeof mensaje !== "object" ||
    mensaje === null ||
    typeof mensaje.id !== "number" ||
    typeof mensaje.documentId !== "string" ||
    typeof mensaje.contenido !== "string" ||
    typeof mensaje.createdAt !== "string"
  ) {
    throw new Error("Strapi devolvió un mensaje con un formato inesperado.")
  }
  return {
    id: mensaje.id,
    documentId: mensaje.documentId,
    contenido: mensaje.contenido,
    createdAt: mensaje.createdAt,
    autor: typeof mensaje.usuario?.username === "string" ? mensaje.usuario.username : "Usuario eliminado",
  }
}

export async function mensajesDeCanal(canalDocumentId: string, desde?: string): Promise<Mensaje[]> {
  const params = new URLSearchParams({ canal: canalDocumentId })
  if (desde) params.set("desde", desde)
  return strapiCollection(`/api/mensajes?${params}`, parseMensaje)
}

export async function enviarMensaje(canalDocumentId: string, contenido: string): Promise<Mensaje> {
  return strapiRequest("/api/mensajes", parseMensaje, {
    method: "POST",
    body: { data: { contenido, canal: canalDocumentId } },
  })
}
