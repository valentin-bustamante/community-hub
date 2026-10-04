"use client"

import { useState } from "react"

import { crearCanal, eliminarCanal, renombrarCanal, type Canal } from "@/lib/comunidades"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type CanalDialogMode = "crear" | "renombrar" | "eliminar"

const copy = {
  crear: {
    title: "Crear canal",
    description: "Elegí un nombre de hasta 20 caracteres.",
    submit: "Crear",
  },
  renombrar: {
    title: "Renombrar canal",
    description: "Elegí el nuevo nombre, de hasta 20 caracteres.",
    submit: "Guardar",
  },
  eliminar: {
    title: "Eliminar canal",
    description: "Se borran también todos sus mensajes. Esta acción no se puede deshacer.",
    submit: "Eliminar",
  },
}

type Props = {
  mode: CanalDialogMode | null
  comunidadDocumentId: string
  canal: Canal | null
  onClose: () => void
  onDone: (mode: CanalDialogMode, canal: Canal) => void
}

export function CanalDialog({ mode, comunidadDocumentId, canal, onClose, onDone }: Props) {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const text = copy[mode ?? "crear"]

  function close() {
    setError("")
    onClose()
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!mode) return
    const nombre = String(new FormData(event.currentTarget).get("nombre") ?? "").trim()
    setError("")
    setLoading(true)
    try {
      if (mode === "crear") {
        onDone(mode, await crearCanal(comunidadDocumentId, nombre))
      } else if (canal && mode === "renombrar") {
        onDone(mode, await renombrarCanal(canal.documentId, nombre))
      } else if (canal) {
        await eliminarCanal(canal.documentId)
        onDone(mode, canal)
      }
      close()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              {text.title}
              {mode !== "crear" && canal ? ` #${canal.nombre}` : ""}
            </DialogTitle>
            <DialogDescription>{text.description}</DialogDescription>
          </DialogHeader>
          {mode !== "eliminar" && (
            <Input
              key={mode}
              name="nombre"
              required
              maxLength={20}
              defaultValue={mode === "renombrar" ? canal?.nombre : ""}
              placeholder="Nombre del canal"
              aria-label="Nombre del canal"
              autoComplete="off"
            />
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="submit"
              variant={mode === "eliminar" ? "destructive" : "default"}
              disabled={loading}
            >
              {text.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
