"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"

import { getToken } from "@/lib/auth"

const subscribe = () => () => {}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const token = useSyncExternalStore(subscribe, getToken, () => undefined)

  useEffect(() => {
    if (token === null) router.replace("/login")
  }, [token, router])

  return token ? children : null
}
