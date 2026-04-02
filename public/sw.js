const STATIC_CACHE = "tuiphone-static-v2"
const API_CACHE = "tuiphone-api-v2"
const COMMERCIAL_API_BYPASS = [
  /^\/api\/catalog\//,
  /^\/api\/dollar$/,
  /^\/api\/dollar-rate$/,
  /^\/api\/config$/,
  /^\/api\/admin\/bootstrap$/,
  /^\/api\/admin\/dollar$/,
  /^\/api\/admin\/installments$/,
]

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![STATIC_CACHE, API_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => cached)

  return cached || networkFetch
}

const cacheFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) {
    return cached
  }

  const response = await fetch(request)
  if (response && response.status === 200) {
    cache.put(request, response.clone())
  }
  return response
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") {
    return
  }

  const url = new URL(request.url)

  if (COMMERCIAL_API_BYPASS.some((pattern) => pattern.test(url.pathname))) {
    return
  }

  if (request.destination === "image" || url.pathname.startsWith("/_next/image")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  }
})
