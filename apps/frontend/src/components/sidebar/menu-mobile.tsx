"use client"

import { createContext, useContext } from "react"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"

type MenuMovil = {
  abierto: boolean
  abrir: () => void
  cerrar: () => void
}

// Comparte el estado del menu mobile con los componentes que lo abren o lo cierran.
export const MenuMovilContext = createContext<MenuMovil>({
  abierto: false,
  abrir: () => {},
  cerrar: () => {},
})

export function useMenuMovil() {
  return useContext(MenuMovilContext)
}

// ** Boton que abre la sidebar (mobile) **
export function BotonMenu() {
  const { abierto, abrir } = useMenuMovil()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="shrink-0 md:hidden" // se oculta en escrittorio
      aria-label="Abrir menú"
      aria-expanded={abierto}
      onClick={abrir}
    >
      <Menu aria-hidden="true" />
    </Button>
  )
}