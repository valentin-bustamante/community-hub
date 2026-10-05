"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, ShieldMinus, ShieldPlus, UserMinus, Users } from "lucide-react"

import {
  cambiarRol,
  expulsarMiembro,
  membresiasDeComunidad,
  type Membresia,
  type RolMembresia,
} from "@/lib/comunidades"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const grupos: { rol: RolMembresia; titulo: string }[] = [
  { rol: "propietario", titulo: "Propietario" },
  { rol: "administrador", titulo: "Administradores" },
  { rol: "miembro", titulo: "Miembros" },
]

type Props = {
  comunidadDocumentId: string
  esPropietario: boolean
  className?: string
}

export function MiembrosPanel({ comunidadDocumentId, esPropietario, className }: Props) {
  const [miembros, setMiembros] = useState<Membresia[]>([])
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando")
  const [error, setError] = useState("")

  useEffect(() => {
    let vigente = true

    membresiasDeComunidad(comunidadDocumentId)
      .then((resultado) => {
        if (!vigente) return
        setMiembros(resultado)
        setEstado("listo")
      })
      .catch((err) => {
        if (!vigente) return
        setError(err.message)
        setEstado("error")
      })

    return () => {
      vigente = false
    }
  }, [comunidadDocumentId])

  async function asignar(membresia: Membresia, rol: RolMembresia) {
    setError("")
    try {
      await cambiarRol(membresia.documentId, rol)
      setMiembros((actuales) =>
        actuales.map((actual) => (actual.documentId === membresia.documentId ? { ...actual, rol } : actual))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el rol.")
    }
  }

  async function expulsar(membresia: Membresia) {
    setError("")
    try {
      await expulsarMiembro(membresia.documentId)
      setMiembros((actuales) => actuales.filter((actual) => actual.documentId !== membresia.documentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo expulsar al miembro.")
    }
  }

  return (
    <aside aria-label="Miembros" className={cn("flex w-56 shrink-0 flex-col overflow-y-auto border-l", className)}>
      <div className="flex h-10 shrink-0 items-center gap-2 px-4 text-sm font-semibold">
        <Users className="size-4 shrink-0" aria-hidden="true" />
        Miembros

      </div>

      {estado === "cargando" && (
        <p role="status" className="px-4 py-2 text-xs text-muted-foreground">
          Cargando miembros...
        </p>
      )}
      {error && (
        <p role="alert" className="px-4 py-2 text-xs text-destructive">
          {error}
        </p>
      )}
      {estado === "listo" && miembros.length === 0 && (
        <p className="px-4 py-2 text-xs text-muted-foreground">Todavía no hay miembros para mostrar.</p>
      )}

      {grupos.map(({ rol, titulo }) => {
        const delGrupo = miembros.filter((miembro) => miembro.rol === rol)
        if (delGrupo.length === 0) return null
        return (
          <section key={rol} className="px-2 pb-3">
            <h3 className="px-2 py-1 text-xs font-medium text-muted-foreground">
              {titulo} — {delGrupo.length}
            </h3>
            <ul className="flex flex-col gap-0.5">
              {delGrupo.map((miembro) => {
                const nombre = miembro.usuario?.username ?? "Usuario eliminado"
                return (
                  <li
                    key={miembro.documentId}
                    className="flex items-center rounded-md text-sm hover:bg-secondary"
                  >
                    <span className="min-w-0 flex-grow truncate px-2 py-1">{nombre}</span>
                    {esPropietario && rol !== "propietario" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label={`Opciones de ${nombre}`}
                            className="mr-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <MoreHorizontal className="size-4" aria-hidden="true" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="left" align="start">
                          {rol === "miembro" ? (
                            <DropdownMenuItem onSelect={() => asignar(miembro, "administrador")}>
                              <ShieldPlus /> Dar administrador
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onSelect={() => asignar(miembro, "miembro")}>
                              <ShieldMinus /> Quitar administrador
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => expulsar(miembro)}>
                            <UserMinus /> Expulsar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </aside>
  )
}
