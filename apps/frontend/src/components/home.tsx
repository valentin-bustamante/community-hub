"use client"

// ** Imports: React & Hooks **
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { getUsername, logout } from "@/lib/auth"
import {
  canalesDeComunidad,
  codigoDeInvitacion,
  misComunidades,
  type Canal,
  type Comunidad,
} from "@/lib/comunidades"
import { ComunidadDialog, type ComunidadDialogMode } from "@/components/comunidad-dialog"

// ** UI Components **
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CardDescription, CardTitle } from "@/components/ui/card"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

// ** Dropdown Menu Components **
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ** Icons **
import { ChevronUp, LogIn, Plus, Send, User2, UserPlus } from "lucide-react"

// ** Home Component **
function ChannelPanel({ comunidad }: { comunidad: Comunidad }) {
  const [canales, setCanales] = useState<Canal[]>([])
  const [currentCanal, setCurrentCanal] = useState<Canal | null>(null)
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando")
  const [error, setError] = useState("")

  useEffect(() => {
    let vigente = true

    canalesDeComunidad(comunidad.documentId)
      .then((resultado) => {
        if (!vigente) return
        setCanales(resultado)
        setCurrentCanal(resultado[0] ?? null)
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
  }, [comunidad.documentId])

  return (
    <>
      <section aria-label="Canales de la comunidad" className="border-b px-4 py-3">
        <h2 className="mb-2 text-sm font-medium">Canales</h2>
        {estado === "cargando" ? (
          <p role="status" className="text-sm text-muted-foreground">
            Cargando canales...
          </p>
        ) : estado === "error" ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : canales.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Esta comunidad todavía no tiene canales.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {canales.map((canal) => (
              <li key={canal.documentId}>
                <button
                  type="button"
                  aria-pressed={currentCanal?.documentId === canal.documentId}
                  onClick={() => setCurrentCanal(canal)}
                  className={
                    "rounded-md px-3 py-1 text-sm hover:bg-secondary" +
                    (currentCanal?.documentId === canal.documentId ? " bg-secondary font-medium" : "")
                  }
                >
                  # {canal.nombre}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-grow flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        {currentCanal && (
          <p className="font-medium text-foreground"># {currentCanal.nombre}</p>
        )}
        <p>Todavía no hay mensajes.</p>
      </div>
    </>
  )
}

export const Home = () => {
  const router = useRouter()
  const [username] = useState(getUsername)
  const [currentChat, setCurrentChat] = useState<Comunidad | null>(null)
  const [invitacion, setInvitacion] = useState("")
  const [comunidades, setComunidades] = useState<Comunidad[]>([])
  const [dialogo, setDialogo] = useState<ComunidadDialogMode | null>(null)
  const [errorComunidades, setErrorComunidades] = useState("")

  useEffect(() => {
    misComunidades()
      .then(setComunidades)
      .catch((err) => setErrorComunidades(err.message))
  }, [])

  function abrirComunidad(comunidad: Comunidad) {
    setCurrentChat(comunidad)
    setInvitacion("")
  }

  return (
    <>
      {/* Main Content */}
        <ResizablePanelGroup direction="horizontal" className="h-screen">
          {/* Left Panel - Chat List */}
          <ResizablePanel defaultSize={25} minSize={20} className="flex-grow">
            <div className="flex flex-col h-screen border ml-1">
              <div className="h-10 px-2 py-4 flex items-center">
                <p className="ml-1">Comunidades</p>
                <div className="flex justify-end w-full">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Agregar comunidad">
                        <Plus />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setDialogo("crear")}>
                        <Plus /> Crear comunidad
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setDialogo("unirse")}>
                        <LogIn /> Unirse a comunidad existente
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Contact List */}
              <ScrollArea className="flex-grow min-h-0">
                {errorComunidades ? (
                  <p role="alert" className="px-4 py-6 text-center text-sm text-destructive">
                    {errorComunidades}
                  </p>
                ) : comunidades.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Todavía no estás en ninguna comunidad.
                  </p>
                ) : (
                  comunidades.map((comunidad) => (
                    <button
                      key={comunidad.documentId}
                      onClick={() => abrirComunidad(comunidad)}
                      className={
                        "flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-secondary cursor-pointer" +
                        (currentChat?.documentId === comunidad.documentId ? " bg-secondary" : "")
                      }
                    >
                      <Avatar>
                        <AvatarFallback>{comunidad.nombre[0]}</AvatarFallback>
                      </Avatar>
                      <CardTitle>{comunidad.nombre}</CardTitle>
                    </button>
                  ))
                )}
              </ScrollArea>

              <div className="flex items-center gap-1 border-t p-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex-grow justify-start">
                      <User2 /> {username}
                      <ChevronUp className="ml-auto" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="start">
                    <DropdownMenuItem
                      onSelect={() => {
                        logout()
                        router.replace("/login")
                      }}
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel - Chat Window */}
          <ResizablePanel defaultSize={75} minSize={40}>
            {currentChat ? (
              <div className="flex flex-col justify-between h-screen ml-1 pb-2">
                {/* Chat Header */}
                <div className="h-16 border-b flex items-center px-3">
                  <Avatar className="size-12">
                    <AvatarFallback>{currentChat.nombre[0]}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 ml-2">
                    <CardTitle>{currentChat.nombre}</CardTitle>
                    <CardDescription>Comunidad</CardDescription>
                  </div>
                  <div className="flex-grow flex justify-end">
                    {invitacion ? (
                      <span className="rounded-md bg-secondary px-3 py-1 font-mono tracking-widest select-all">
                        {invitacion}
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          codigoDeInvitacion(currentChat.documentId)
                            .then(setInvitacion)
                            .catch((err) => setInvitacion(err.message))
                        }
                      >
                        <UserPlus /> Invitar
                      </Button>
                    )}
                  </div>
                </div>

                <ChannelPanel key={currentChat.documentId} comunidad={currentChat} />

                {/* Chat Input */}
                <div className="flex h-10 pt-2 border-t">
                  <Input
                    className="flex-grow border-0"
                    placeholder="Escribí un mensaje"
                  />
                  <Button variant="ghost" size="icon" aria-label="Enviar">
                    <Send />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-screen items-center justify-center p-6 text-center text-muted-foreground">
                Creá una comunidad o unite a una existente con el botón +.
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>

      <ComunidadDialog
        mode={dialogo}
        onClose={() => setDialogo(null)}
        onDone={(comunidad) => {
          setComunidades((prev) => [...prev, comunidad])
          abrirComunidad(comunidad)
        }}
      />
    </>
  )
}
