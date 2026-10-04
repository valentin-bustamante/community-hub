"use client"

// ** Imports: React & Hooks **
import React, { useEffect, useState } from "react"

import {
  canalesDeComunidad,
  misMembresias,
  type Canal,
  type Comunidad,
  type RolMembresia,
} from "@/lib/comunidades"
import { CanalDialog, type CanalDialogMode } from "@/components/canal-dialog"
import { ComunidadDialog, type ComunidadDialogMode } from "@/components/comunidad-dialog"
import { ComunidadView } from "@/components/comunidad-view"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { CanalesLista } from "@/components/sidebar/canales-lista"

type CargaCanales = {
  comunidadId: string
  canales: Canal[]
  error: string
}

// ** Home Component **
export const Home = () => {
  const [dialogo, setDialogo] = useState<ComunidadDialogMode | null>(null)
  const [comunidades, setComunidades] = useState<Comunidad[]>([])
  const [roles, setRoles] = useState<Record<string, RolMembresia>>({})
  const [errorComunidades, setErrorComunidades] = useState("")
  const [comunidadActiva, setComunidadActiva] = useState<Comunidad | null>(null)
  const [carga, setCarga] = useState<CargaCanales | null>(null)
  const [canalId, setCanalId] = useState<string | null>(null)
  const [canalesAbiertos, setCanalesAbiertos] = useState(true)
  const [dialogoCanal, setDialogoCanal] = useState<{ mode: CanalDialogMode; canal: Canal | null } | null>(null)

  const comunidadId = comunidadActiva?.documentId ?? null
  const cargaActual = carga && carga.comunidadId === comunidadId ? carga : null
  const canales = cargaActual?.canales ?? []
  const estadoCanales = !cargaActual ? "cargando" : cargaActual.error ? "error" : "listo"
  const canalActivo = canales.find((canal) => canal.documentId === canalId) ?? canales[0] ?? null

  useEffect(() => {
    misMembresias()
      .then((membresias) => {
        const propias = membresias.flatMap(({ comunidad, rol }) => (comunidad ? [{ comunidad, rol }] : []))
        setComunidades(propias.map(({ comunidad }) => comunidad))
        setRoles(Object.fromEntries(propias.map(({ comunidad, rol }) => [comunidad.documentId, rol])))
      })
      .catch((err) => setErrorComunidades(err.message))
  }, [])

  useEffect(() => {
    if (!comunidadId) return
    let vigente = true

    canalesDeComunidad(comunidadId)
      .then((resultado) => {
        if (vigente) setCarga({ comunidadId, canales: resultado, error: "" })
      })
      .catch((err) => {
        if (vigente) setCarga({ comunidadId, canales: [], error: err.message })
      })

    return () => {
      vigente = false
    }
  }, [comunidadId])

  function seleccionarComunidad(comunidad: Comunidad) {
    if (comunidad.documentId === comunidadId) {
      setCanalesAbiertos((abiertos) => !abiertos)
    } else {
      setComunidadActiva(comunidad)
      setCanalesAbiertos(true)
    }
  }

  function aplicarCambioDeCanal(mode: CanalDialogMode, canal: Canal) {
    if (!cargaActual) return
    const actualizados =
      mode === "crear"
        ? [...canales, canal]
        : mode === "renombrar"
          ? canales.map((c) => (c.documentId === canal.documentId ? canal : c))
          : canales.filter((c) => c.documentId !== canal.documentId)
    setCarga({ ...cargaActual, canales: actualizados })
    if (mode !== "eliminar") setCanalId(canal.documentId)
  }

  const esPropietario = comunidadId !== null && roles[comunidadId] === "propietario"

  const vistaPrincipal = comunidadActiva ? (
    <ComunidadView
      key={comunidadActiva.documentId}
      comunidad={comunidadActiva}
      canal={canalActivo}
      estado={estadoCanales}
      error={cargaActual?.error ?? ""}
    />
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
        activaAbierta={canalesAbiertos}
        detalleActiva={
          <CanalesLista
            canales={canales}
            estado={estadoCanales}
            error={cargaActual?.error ?? ""}
            canalActivo={canalActivo}
            esPropietario={esPropietario}
            onSelect={(canal) => setCanalId(canal.documentId)}
            onCrear={() => setDialogoCanal({ mode: "crear", canal: null })}
            onAccion={(mode, canal) => setDialogoCanal({ mode, canal })}
          />
        }
      >
        {vistaPrincipal}
      </AppSidebar>

      {comunidadId && (
        <CanalDialog
          mode={dialogoCanal?.mode ?? null}
          comunidadDocumentId={comunidadId}
          canal={dialogoCanal?.canal ?? null}
          onClose={() => setDialogoCanal(null)}
          onDone={aplicarCambioDeCanal}
        />
      )}

      <ComunidadDialog
        mode={dialogo}
        onClose={() => setDialogo(null)}
        onDone={(comunidad) => {
          setComunidades((prev) => [...prev, comunidad])
          setRoles((prev) => ({
            ...prev,
            [comunidad.documentId]: dialogo === "crear" ? "propietario" : "miembro",
          }))
          setComunidadActiva(comunidad)
          setCanalesAbiertos(true)
        }}
      />
    </>
  )
}
