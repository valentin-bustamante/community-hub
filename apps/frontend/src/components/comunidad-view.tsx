"use client"

import { useState } from "react"
import { RefreshCw, UserPlus, Users } from "lucide-react"

import { codigoDeInvitacion, type Canal, type Comunidad, type RolMembresia } from "@/lib/comunidades"
import { useMobile } from "@/lib/use-mobile"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { CanalChat } from "@/components/canal-chat"
import { MiembrosPanel } from "@/components/miembros-panel"
import { ComunidadIcono } from "@/components/sidebar/comunidad-icono"
import { BotonMenu } from "@/components/sidebar/menu-mobile"
import { Button } from "@/components/ui/button"
import { CardDescription, CardTitle } from "@/components/ui/card"

type Props = {
  comunidad: Comunidad
  canal: Canal | null
  rol: RolMembresia | undefined
  estado: "cargando" | "listo" | "error"
  error: string
  onActualizar: () => void
}

export function ComunidadView({ comunidad, canal, rol, estado, error, onActualizar }: Props) {
  const mobile = useMobile()
  const [invitacion, setInvitacion] = useState("")
  const [errorInvitacion, setErrorInvitacion] = useState("")
  const [cargandoInvitacion, setCargandoInvitacion] = useState(false)
  const [miembrosAbiertos, setMiembrosAbiertos] = useState(false)

  return (
    <div className="flex h-dvh flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <BotonMenu />
        <ComunidadIcono nombre={comunidad.nombre} />
        <div className="min-w-0">
          <CardTitle className="truncate">{comunidad.nombre}</CardTitle>
          <CardDescription className="truncate">{canal ? `# ${canal.nombre}` : "Comunidad"}</CardDescription>
        </div>
        <div className="flex min-w-0 flex-grow items-center justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Actualizar comunidad" onClick={onActualizar}>
            <RefreshCw aria-hidden="true" />
          </Button>
          {invitacion ? (
            <span className="truncate rounded-md bg-secondary px-3 py-1 font-mono tracking-widest select-all">
              {invitacion}
            </span>
          ) : (
            <Button
              variant="ghost"
              disabled={cargandoInvitacion}
              onClick={async () => {
                setErrorInvitacion("")
                setCargandoInvitacion(true)
                try {
                  setInvitacion(await codigoDeInvitacion(comunidad.documentId))
                } catch (err) {
                  setErrorInvitacion(err instanceof Error ? err.message : "No se pudo obtener el código.")
                } finally {
                  setCargandoInvitacion(false)
                }
              }}
            >
              {/* En pantallas muy chicas se ve solo el ícono; el lector de pantalla sigue leyendo "Invitar" */}
              <UserPlus aria-hidden="true" />{" "}
              <span className="max-sm:sr-only">{cargandoInvitacion ? "Cargando..." : "Invitar"}</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Ver miembros"
            aria-expanded={miembrosAbiertos}
            onClick={() => setMiembrosAbiertos(true)}
          >
            <Users aria-hidden="true" />
          </Button>
        </div>
      </div>
      {errorInvitacion && (
        <p role="alert" className="border-b px-3 py-2 text-sm text-destructive">
          {errorInvitacion}
        </p>
      )}

      <div className="flex min-h-0 flex-grow">
        <div className="flex min-w-0 flex-grow flex-col justify-between pb-2">
          {canal && estado === "listo" ? (
            <CanalChat key={canal.documentId} canal={canal} />
          ) : (
            <div className="flex flex-grow items-center justify-center p-6 text-center text-sm text-muted-foreground">
              {error ? (
                <p role="alert" className="text-destructive">{error}</p>
              ) : estado === "cargando" ? (
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

        {!mobile && <MiembrosPanel
          comunidadDocumentId={comunidad.documentId}
          esPropietario={rol === "propietario"}
          className="max-md:hidden"
        />}
        <Dialog open={mobile && miembrosAbiertos} onOpenChange={setMiembrosAbiertos}>
          <DialogContent>
            <DialogTitle>Integrantes de {comunidad.nombre}</DialogTitle>
            <DialogDescription>Miembros y roles de la comunidad activa.</DialogDescription>
            <MiembrosPanel
              comunidadDocumentId={comunidad.documentId}
              esPropietario={rol === "propietario"}
              className="max-h-[70dvh] w-full border-0"
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
