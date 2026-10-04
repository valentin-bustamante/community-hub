"use client"

// ** Imports: React & Hooks **
import React, { useEffect, useState } from "react"

import { codigoDeInvitacion, misComunidades, type Comunidad } from "@/lib/comunidades"
import { ComunidadDialog, type ComunidadDialogMode } from "@/components/comunidad-dialog"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { ComunidadIcono } from "@/components/sidebar/comunidad-icono"

// ** UI Components **
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardDescription, CardTitle } from "@/components/ui/card"

// ** Icons **
import { Send, UserPlus } from "lucide-react"

// ** Home Component **
export const Home = () => {
  const [dialogo, setDialogo] = useState<ComunidadDialogMode | null>(null)
  const [comunidades, setComunidades] = useState<Comunidad[]>([])
  const [errorComunidades, setErrorComunidades] = useState("")
  const [comunidadActiva, setComunidadActiva] = useState<Comunidad | null>(null)
  const [invitacion, setInvitacion] = useState("")

  useEffect(() => {
    misComunidades()
      .then(setComunidades)
      .catch((err) => setErrorComunidades(err.message))
  }, [])

  function seleccionarComunidad(comunidad: Comunidad) {
    setComunidadActiva(comunidad)
    setInvitacion("")
  }

  const vistaPrincipal = comunidadActiva ? (
    <div className="flex h-screen flex-col justify-between pb-2">
      {/* Chat Header */}
      <div className="flex h-12 items-center gap-2 border-b px-3">
        <ComunidadIcono nombre={comunidadActiva.nombre} />
        <div className="min-w-0">
          <CardTitle className="truncate">{comunidadActiva.nombre}</CardTitle>
          <CardDescription>Comunidad</CardDescription>
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
                codigoDeInvitacion(comunidadActiva.documentId)
                  .then(setInvitacion)
                  .catch((err) => setInvitacion(err.message))
              }
            >
              <UserPlus aria-hidden="true" /> Invitar
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-grow items-center justify-center p-6 text-center text-sm text-muted-foreground">
        Todavía no hay mensajes.
      </div>

      {/* Chat Input */}
      <div className="flex h-10 border-t px-1 pt-2">
        <Input className="flex-grow border-0" placeholder="Escribí un mensaje" aria-label="Mensaje" />
        <Button variant="ghost" size="icon" aria-label="Enviar">
          <Send aria-hidden="true" />
        </Button>
      </div>
    </div>
  ) : errorComunidades ? (
    <p role="alert" className="flex h-screen items-center justify-center p-6 text-center text-destructive">
      {errorComunidades}
    </p>
  ) : (
    <div className="flex h-screen items-center justify-center p-6 text-center text-muted-foreground">
      {comunidades.length === 0
        ? "Todavía no estás en ninguna comunidad. Creá una o unite a una existente con el botón +."
        : "Elegí una comunidad de la barra lateral."}
    </div>
  )

  return (
    <>
      <AppSidebar
        comunidades={comunidades}
        comunidadActiva={comunidadActiva}
        onSelectComunidad={seleccionarComunidad}
        onAbrirDialogo={setDialogo}
      >
        {vistaPrincipal}
      </AppSidebar>

      <ComunidadDialog
        mode={dialogo}
        onClose={() => setDialogo(null)}
        onDone={(comunidad) => {
          setComunidades((prev) => [...prev, comunidad])
          seleccionarComunidad(comunidad)
        }}
      />
    </>
  )
}
