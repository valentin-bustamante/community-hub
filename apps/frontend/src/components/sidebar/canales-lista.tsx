"use client"

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"

import type { Canal } from "@/lib/comunidades"
import { cn } from "@/lib/utils"
import type { CanalDialogMode } from "@/components/canal-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
  canales: Canal[]
  estado: "cargando" | "listo" | "error"
  error: string
  canalActivo: Canal | null
  esPropietario: boolean
  onSelect: (canal: Canal) => void
  onCrear: () => void
  onAccion: (mode: CanalDialogMode, canal: Canal) => void
}

const fila =
  "rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
const foco = "outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function CanalesLista({
  canales,
  estado,
  error,
  canalActivo,
  esPropietario,
  onSelect,
  onCrear,
  onAccion,
}: Props) {
  return (
    <div className="mb-1 ml-5 flex flex-col gap-0.5 border-l pl-2">
      {estado === "cargando" ? (
        <p role="status" className="px-1 py-1 text-xs text-muted-foreground">
          Cargando canales...
        </p>
      ) : estado === "error" ? (
        <p role="alert" className="px-1 py-1 text-xs text-destructive">
          {error}
        </p>
      ) : canales.length === 0 ? (
        <p className="px-1 py-1 text-xs text-muted-foreground">Todavía no tiene canales.</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {canales.map((canal) => {
            const activo = canal.documentId === canalActivo?.documentId
            return (
              <li
                key={canal.documentId}
                className={cn("flex items-center", fila, activo && "bg-secondary font-medium text-foreground")}
              >
                <button
                  type="button"
                  aria-current={activo ? "page" : undefined}
                  onClick={() => onSelect(canal)}
                  className={cn("min-w-0 flex-grow cursor-pointer truncate rounded-md px-2 py-1 text-left", foco)}
                >
                  # {canal.nombre}
                </button>
                {esPropietario && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Opciones de #${canal.nombre}`}
                        className={cn(
                          "mr-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-background",
                          foco
                        )}
                      >
                        <MoreHorizontal className="size-4" aria-hidden="true" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuItem onSelect={() => onAccion("renombrar", canal)}>
                        <Pencil /> Renombrar
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => onAccion("eliminar", canal)}>
                        <Trash2 /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {esPropietario && estado === "listo" && (
        <button
          type="button"
          onClick={onCrear}
          className={cn("flex cursor-pointer items-center gap-1.5 px-2 py-1 text-left", fila, foco)}
        >
          <Plus className="size-4 shrink-0" aria-hidden="true" />
          Crear canal
        </button>
      )}
    </div>
  )
}
