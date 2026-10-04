"use client"

import { useEffect, useState, type ReactNode } from "react"
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
import { cn } from "@/lib/utils"
import { MenuMovilContext } from "@/components/sidebar/menu-mobile"

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
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Cierra el menú mobile con la tecla Escape.
  useEffect(() => {
    if (!menuAbierto) return
    const alPresionar = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuAbierto(false)
    }
    window.addEventListener("keydown", alPresionar)
    return () => window.removeEventListener("keydown", alPresionar)
  }, [menuAbierto])

  return (
    <MenuMovilContext
      value={{ abierto: menuAbierto, abrir: () => setMenuAbierto(true), cerrar: () => setMenuAbierto(false) }}
    >
      <div className="flex h-dvh">
        {/* Fondo oscuro detrás del menú en mobile; tocarlo lo cierra */}
        {menuAbierto && (
          <div className="fixed inset-0 z-30 bg-black/40 md:hidden" aria-hidden="true" onClick={() => setMenuAbierto(false)} />
        )}

        {/* En mobile es un cajón fijo que entra desde la izquierda; en escritorio vuelve a su lugar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 bg-background transition-[translate,visibility] duration-200 md:visible md:static md:translate-x-0",
            menuAbierto ? "translate-x-0" : "invisible -translate-x-full"
          )}
        >
          <ComunidadesRail
            comunidades={comunidades}
            activaId={comunidadActiva?.documentId ?? null}
            onSelect={onSelectComunidad}
            expandida={expandida || menuAbierto}
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
                    expandida={expandida || menuAbierto}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                  <DropdownMenuItem
                    onSelect={() => {
                      setMenuAbierto(false)
                      onAbrirDialogo("crear")
                    }}
                  >
                    <Plus /> Crear comunidad
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      setMenuAbierto(false)
                      onAbrirDialogo("unirse")
                    }}
                  >
                    <LogIn /> Unirse a comunidad existente
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
            pie={<UsuarioMenu expandida={expandida || menuAbierto} />}
          />
        </div>

        <main className="min-w-0 flex-grow">{children}</main>
      </div>
    </MenuMovilContext>
  )
}
