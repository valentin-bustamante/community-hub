import { API_URL, getToken } from "@/lib/auth"

export type Comunidad = {
  id: number
  documentId: string
  nombre: string
}

export async function unirseAComunidad(codigoInvitacion: string): Promise<Comunidad> {
  const res = await fetch(API_URL + "/api/comunidades/unirse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
    body: JSON.stringify({ codigoInvitacion }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message ?? "No se pudo unir a la comunidad")
  return json.data
}

export async function misComunidades(): Promise<Comunidad[]> {
  const res = await fetch(
    API_URL + "/api/users/me?populate[membresias][populate][comunidad][fields][0]=nombre",
    { headers: { Authorization: "Bearer " + getToken() } }
  )
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message ?? "No se pudieron cargar las comunidades")
  return (json.membresias ?? [])
    .map((membresia: { comunidad: Comunidad | null }) => membresia.comunidad)
    .filter(Boolean)
}

export async function crearComunidad(nombre: string): Promise<Comunidad & { codigoInvitacion: string }> {
  const res = await fetch(API_URL + "/api/comunidades", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
    body: JSON.stringify({ data: { nombre } }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message ?? "No se pudo crear la comunidad")
  return json.data
}

export async function codigoDeInvitacion(documentId: string): Promise<string> {
  const res = await fetch(API_URL + "/api/comunidades/" + documentId, {
    headers: { Authorization: "Bearer " + getToken() },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message ?? "No se pudo obtener el código")
  return json.data.codigoInvitacion
}
