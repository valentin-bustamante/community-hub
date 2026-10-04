"use client"

import type { ComponentProps, ReactNode } from "react"
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen, Users } from "lucide-react"

import type { Comunidad } from "@/lib/comunidades"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ComunidadIcono } from "@/components/sidebar/comunidad-icono"

type RailBotonProps = ComponentProps<"button"> & {
  icono: ReactNode
  label: string
  expandida: boolean
  activa?: boolean
  final?: ReactNode
}

// ** Fila del rail: solo icono (con tooltip) si está contraido + texto si esta expandido **
export function RailBoton({ icono, label, expandida, activa, final, className, ...props }: RailBotonProps) {
  const boton = (
    <button
      type="button"
      aria-label={label}
      aria-current={activa ? "page" : undefined}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-md p-1.5 text-left text-sm text-muted-foreground outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        !expandida && "justify-center",
        activa && "bg-secondary font-medium text-foreground",
        className
      )}
      {...props}
    >
      {icono}
      {expandida && <span className="truncate">{label}</span>}
      {expandida && final}
    </button>
  )

  if (expandida) return boton

  return (
    <Tooltip>
      <TooltipTrigger asChild>{boton}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

type Props = {
  comunidades: Comunidad[]
  activaId: string | null
  onSelect: (comunidad: Comunidad) => void
  expandida: boolean
  onToggle: () => void
  activaAbierta?: boolean
  detalleActiva?: ReactNode
  // Botón "+" para crear o unirse a una comunidad.
  acciones?: ReactNode
  // Contenido fijo al pie, arriba del botón de expandir (menú del usuario).
  pie?: ReactNode
}

export function ComunidadesRail({
  comunidades,
  activaId,
  onSelect,
  expandida,
  onToggle,
  activaAbierta,
  detalleActiva,
  acciones,
  pie,
}: Props) {
  const IconoToggle = expandida ? PanelLeftClose : PanelLeftOpen

  return (
    <nav
      aria-label="Comunidades"
      className={cn(
        "flex h-full shrink-0 flex-col border-r transition-[width] duration-200",
        expandida ? "w-56" : "w-16"
      )}
    >
      <div className={cn("flex h-12 shrink-0 items-center gap-2 border-b px-4 text-sm font-semibold", !expandida && "justify-center")}>
        <Users className="size-4 shrink-0" aria-hidden="true" />
        {expandida && <span className="truncate">Comunidades</span>}
      </div>

      <ScrollArea className="min-h-0 w-full flex-grow">
        <ul className="flex flex-col gap-0.5 p-2">
          {comunidades.map((comunidad) => {
            const activa = comunidad.documentId === activaId
            const IconoCanales = activa && activaAbierta ? ChevronDown : ChevronRight
            return (
              <li key={comunidad.documentId}>
                <RailBoton
                  icono={<ComunidadIcono nombre={comunidad.nombre} />}
                  label={comunidad.nombre}
                  expandida={expandida}
                  activa={activa}
                  aria-expanded={activa && expandida ? Boolean(activaAbierta) : undefined}
                  final={<IconoCanales className="ml-auto size-4 shrink-0" aria-hidden="true" />}
                  onClick={() => onSelect(comunidad)}
                />
                {expandida && activa && activaAbierta && detalleActiva}
              </li>
            )
          })}
          {acciones && <li>{acciones}</li>}
        </ul>
      </ScrollArea>

      <div className="flex flex-col gap-0.5 border-t p-2">
        {pie}
        <RailBoton
          icono={
            <span className="flex size-8 shrink-0 items-center justify-center">
              <IconoToggle className="size-4" aria-hidden="true" />
            </span>
          }
          label={expandida ? "Ocultar comunidades" : "Expandir comunidades"}
          expandida={expandida}
          aria-expanded={expandida}
          onClick={onToggle}
        />
      </div>
    </nav>
  )
}
