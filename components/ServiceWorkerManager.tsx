"use client"

import { useEffect } from "react"

const SERVICE_WORKER_PATH = "/sw.js"

export function ServiceWorkerManager() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    const isLocalhost = Boolean(
      window.location.hostname === "localhost" ||
        window.location.hostname === "[::1]" ||
        window.location.hostname.match(
          /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/,
        ),
    )

    if (window.location.protocol === "http:" && !isLocalhost) {
      return
    }

    navigator.serviceWorker
      .register(SERVICE_WORKER_PATH, { scope: "/" })
      .catch((error) => {
        console.warn("No se pudo registrar el service worker:", error)
      })

    return () => {
      // No unregister to keep cache warm
    }
  }, [])

  return null
}
