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
import { useMobile } from "@/lib/use-mobile"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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

  const mobile = useMobile()

  const rail = (
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
  )

  return (
    <MenuMovilContext
      value={{ abierto: menuAbierto, abrir: () => setMenuAbierto(true), cerrar: () => setMenuAbierto(false) }}
    >
      <div className="flex h-dvh">
        {mobile ? (
          <Dialog open={menuAbierto} onOpenChange={setMenuAbierto}>
            <DialogContent className="top-0 left-0 h-dvh w-56 max-w-[90vw] translate-x-0 translate-y-0 gap-0 rounded-none p-0" showCloseButton={false}>
              <DialogTitle className="sr-only">Navegación de comunidades</DialogTitle>
              <DialogDescription className="sr-only">Elegí una comunidad y un canal para conversar. Escape cierra el menú.</DialogDescription>
              {rail}
            </DialogContent>
          </Dialog>
        ) : <div className="bg-background">{rail}</div>}

        <main className="min-w-0 flex-grow">{children}</main>
      </div>
    </MenuMovilContext>
  )
}
