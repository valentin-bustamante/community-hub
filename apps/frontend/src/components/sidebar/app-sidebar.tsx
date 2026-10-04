"use client"

import { useState, type ReactNode } from "react"
import { LogIn, Plus } from "lucide-react"

import type { Comunidad } from "@/lib/comunidades"
import type { ComunidadDialogMode } from "@/components/comunidad-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ComunidadesRail, RailBoton } from "@/components/sidebar/comunidades-rail"
import { UsuarioMenu } from "@/components/sidebar/usuario-menu"

type Props = {
  comunidades: Comunidad[]
  comunidadActiva: Comunidad | null
  onSelectComunidad: (comunidad: Comunidad) => void
  onAbrirDialogo: (modo: ComunidadDialogMode) => void
  activaAbierta?: boolean
  detalleActiva?: ReactNode
  // cont principal, a la derecha de la sidebar.
  children: ReactNode
}

// ** Layout: sidebar de comunidades + contenido **
export function AppSidebar({
  comunidades,
  comunidadActiva,
  onSelectComunidad,
  onAbrirDialogo,
  activaAbierta,
  detalleActiva,
  children,
}: Props) {
  const [expandida, setExpandida] = useState(true)

  return (
    <div className="flex h-screen">
      <ComunidadesRail
        comunidades={comunidades}
        activaId={comunidadActiva?.documentId ?? null}
        onSelect={onSelectComunidad}
        expandida={expandida}
        onToggle={() => setExpandida((abierta) => !abierta)}
        activaAbierta={activaAbierta}
        detalleActiva={detalleActiva}
        acciones={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <RailBoton
                icono={
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-dashed">
                    <Plus className="size-4" aria-hidden="true" />
                  </span>
                }
                label="Agregar comunidad"
                expandida={expandida}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuItem onSelect={() => onAbrirDialogo("crear")}>
                <Plus /> Crear comunidad
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onAbrirDialogo("unirse")}>
                <LogIn /> Unirse a comunidad existente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
        pie={<UsuarioMenu expandida={expandida} />}
      />

      <main className="min-w-0 flex-grow">{children}</main>
    </div>
  )
}
