"use client"

import { useState } from "react"

import { crearComunidad, unirseAComunidad, type Comunidad } from "@/lib/comunidades"
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

export type ComunidadDialogMode = "crear" | "unirse"

const copy = {
  crear: {
    title: "Crear comunidad",
    description: "Elegí un nombre de entre 5 y 30 caracteres.",
    placeholder: "Nombre de la comunidad",
    submit: "Crear",
    loading: "Creando...",
  },
  unirse: {
    title: "Unirse a una comunidad",
    description: "Ingresá el código de invitación que te compartieron.",
    placeholder: "Ej: A1B2C3D4E5F6",
    submit: "Unirse",
    loading: "Uniendo...",
  },
}

type Props = {
  mode: ComunidadDialogMode | null
  onClose: () => void
  onDone: (comunidad: Comunidad) => void
}

export function ComunidadDialog({ mode, onClose, onDone }: Props) {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const text = copy[mode ?? "crear"]

  function close() {
    setError("")
    onClose()
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const valor = String(new FormData(event.currentTarget).get("valor")).trim()
    setError("")
    setLoading(true)
    try {
      onDone(await (mode === "crear" ? crearComunidad(valor) : unirseAComunidad(valor)))
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
            <DialogTitle>{text.title}</DialogTitle>
            <DialogDescription>{text.description}</DialogDescription>
          </DialogHeader>
          <Input
            name="valor"
            required
            minLength={mode === "crear" ? 5 : undefined}
            maxLength={mode === "crear" ? 30 : undefined}
            placeholder={text.placeholder}
            autoComplete="off"
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? text.loading : text.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
