"use client"

import { useState } from "react"
import { Send, UserPlus } from "lucide-react"

import { codigoDeInvitacion, type Canal, type Comunidad } from "@/lib/comunidades"
import { ComunidadIcono } from "@/components/sidebar/comunidad-icono"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardDescription, CardTitle } from "@/components/ui/card"

type Props = {
  comunidad: Comunidad
  canal: Canal | null
  estado: "cargando" | "listo" | "error"
  error: string
}

export function ComunidadView({ comunidad, canal, estado, error }: Props) {
  const [invitacion, setInvitacion] = useState("")

  return (
    <div className="flex h-screen flex-col justify-between pb-2">
      <div className="flex h-12 items-center gap-2 border-b px-3">
        <ComunidadIcono nombre={comunidad.nombre} />
        <div className="min-w-0">
          <CardTitle className="truncate">{comunidad.nombre}</CardTitle>
          <CardDescription className="truncate">{canal ? `# ${canal.nombre}` : "Comunidad"}</CardDescription>
        </div>
        <div className="flex flex-grow justify-end">
          {invitacion ? (
            <span className="rounded-md bg-secondary px-3 py-1 font-mono tracking-widest select-all">
              {invitacion}
            </span>
          ) : (
            <Button
              variant="ghost"
              onClick={() =>
                codigoDeInvitacion(comunidad.documentId)
                  .then(setInvitacion)
                  .catch((err) => setInvitacion(err.message))
              }
            >
              <UserPlus aria-hidden="true" /> Invitar
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-grow flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
        {estado === "cargando" ? (
          <p role="status">Cargando canales...</p>
        ) : estado === "error" ? (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        ) : canal ? (
          <>
            <p className="font-medium text-foreground"># {canal.nombre}</p>
            <p>Todavía no hay mensajes.</p>
          </>
        ) : (
          <p>Esta comunidad todavía no tiene canales.</p>
        )}
      </div>

      <div className="flex h-10 border-t px-1 pt-2">
        <Input className="flex-grow border-0" placeholder="Escribí un mensaje" aria-label="Mensaje" />
        <Button variant="ghost" size="icon" aria-label="Enviar">
          <Send aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
