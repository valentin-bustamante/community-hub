"use client"

import { useEffect, useRef, useState } from "react"
import { Send } from "lucide-react"

import { getUsername } from "@/lib/auth"
import type { Canal } from "@/lib/comunidades"
import { enviarMensaje, mensajesDeCanal, type Mensaje } from "@/lib/mensajes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const INTERVALO_POLLING = 3000

const hora = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

function agregar(actuales: Mensaje[], nuevos: Mensaje[]) {
  const conocidos = new Set(actuales.map((mensaje) => mensaje.documentId))
  const faltantes = nuevos.filter((mensaje) => !conocidos.has(mensaje.documentId))
  return faltantes.length === 0 ? actuales : [...actuales, ...faltantes]
}

export function CanalChat({ canal }: { canal: Canal }) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando")
  const [error, setError] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [usuario] = useState(getUsername)
  const ultimaFecha = useRef<string | undefined>(undefined)
  const final = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let vigente = true

    function recibir(nuevos: Mensaje[]) {
      if (!vigente) return
      if (nuevos.length > 0) ultimaFecha.current = nuevos[nuevos.length - 1].createdAt
      setMensajes((actuales) => agregar(actuales, nuevos))
      setError("")
      setEstado("listo")
    }

    mensajesDeCanal(canal.documentId)
      .then(recibir)
      .catch((err) => {
        if (!vigente) return
        setError(err.message)
        setEstado("error")
      })

    const intervalo = setInterval(() => {
      mensajesDeCanal(canal.documentId, ultimaFecha.current)
        .then(recibir)
        .catch((err) => {
          if (!vigente) return
          setError(err instanceof Error ? err.message : "No se pudieron actualizar los mensajes.")
          setEstado("error")
        })
    }, INTERVALO_POLLING)

    return () => {
      vigente = false
      clearInterval(intervalo)
    }
  }, [canal.documentId])

  useEffect(() => {
    final.current?.scrollIntoView({ block: "end" })
  }, [mensajes])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const contenido = String(new FormData(form).get("contenido") ?? "").trim()
    if (!contenido) return
    setError("")
    setEnviando(true)
    try {
      const enviado = await enviarMensaje(canal.documentId, contenido)
      setMensajes((actuales) => agregar(actuales, [enviado]))
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el mensaje.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <div className="min-h-0 flex-grow overflow-y-auto px-4 py-3" aria-live="polite">
        {estado === "cargando" ? (
          <p role="status" className="py-6 text-center text-sm text-muted-foreground">
            Cargando mensajes...
          </p>
        ) : mensajes.length === 0 && estado === "listo" ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Todavía no hay mensajes en # {canal.nombre}.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {mensajes.map((mensaje) => {
              const propio = mensaje.autor === usuario
              return (
                <li key={mensaje.documentId} className={cn("flex flex-col", propio && "items-end")}>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{mensaje.autor}</span>{" "}
                    <time dateTime={mensaje.createdAt}>{hora.format(new Date(mensaje.createdAt))}</time>
                  </p>
                  <p
                    className={cn(
                      "max-w-[80%] rounded-md px-3 py-2 text-sm break-words whitespace-pre-wrap",
                      propio ? "bg-primary text-primary-foreground" : "bg-secondary"
                    )}
                  >
                    {mensaje.contenido}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
        <div ref={final} />
      </div>

      {error && (
        <p role="alert" className="px-4 pb-1 text-sm text-destructive">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex h-10 border-t px-1 pt-2">
        <Input
          name="contenido"
          className="flex-grow border-0"
          placeholder={`Escribí un mensaje en # ${canal.nombre}`}
          aria-label="Mensaje"
          maxLength={3000}
          autoComplete="off"
          disabled={estado !== "listo"}
        />
        <Button type="submit" variant="ghost" size="icon" aria-label="Enviar" disabled={enviando || estado !== "listo"}>
          <Send aria-hidden="true" />
        </Button>
      </form>
    </>
  )
}
