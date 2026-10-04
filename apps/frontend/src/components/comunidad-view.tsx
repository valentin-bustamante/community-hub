"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"

import { codigoDeInvitacion, type Canal, type Comunidad, type RolMembresia } from "@/lib/comunidades"
import { CanalChat } from "@/components/canal-chat"
import { MiembrosPanel } from "@/components/miembros-panel"
import { ComunidadIcono } from "@/components/sidebar/comunidad-icono"
import { Button } from "@/components/ui/button"
import { CardDescription, CardTitle } from "@/components/ui/card"

type Props = {
  comunidad: Comunidad
  canal: Canal | null
  rol: RolMembresia | undefined
  estado: "cargando" | "listo" | "error"
  error: string
}

export function ComunidadView({ comunidad, canal, rol, estado, error }: Props) {
  const [invitacion, setInvitacion] = useState("")

  return (
    <div className="flex h-screen flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
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

      <div className="flex min-h-0 flex-grow">
        <div className="flex min-w-0 flex-grow flex-col justify-between pb-2">
          {canal && estado === "listo" ? (
            <CanalChat key={canal.documentId} canal={canal} />
          ) : (
            <div className="flex flex-grow items-center justify-center p-6 text-center text-sm text-muted-foreground">
              {estado === "cargando" ? (
                <p role="status">Cargando canales...</p>
              ) : estado === "error" ? (
                <p role="alert" className="text-destructive">
                  {error}
                </p>
              ) : (
                <p>Esta comunidad todavía no tiene canales.</p>
              )}
            </div>
          )}
        </div>

        <MiembrosPanel comunidadDocumentId={comunidad.documentId} esPropietario={rol === "propietario"} />
      </div>
    </div>
  )
}
