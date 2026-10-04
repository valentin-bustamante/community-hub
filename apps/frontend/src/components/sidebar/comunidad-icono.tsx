import { cn } from "@/lib/utils"

type Props = {
  nombre: string
  className?: string
}

export function ComunidadIcono({ nombre, className }: Props) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-sm font-medium text-muted-foreground uppercase",
        className
      )}
    >
      {nombre[0]}
    </span>
  )
}
