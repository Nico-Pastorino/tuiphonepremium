import { NextRequest } from "next/server"
import { isSupabaseStorageUrl } from "@/lib/image-cdn"

const MAX_URL_LENGTH = 2048
const CACHE_HEADER = "public, s-maxage=31536000, max-age=31536000, immutable"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return new Response("Missing url parameter", { status: 400 })
  }

  if (url.length > MAX_URL_LENGTH) {
    return new Response("URL too long", { status: 414 })
  }

  if (!isSupabaseStorageUrl(url)) {
    return new Response("Invalid image host", { status: 400 })
  }

  let upstream: Response
  try {
    upstream = await fetch(url)
  } catch (error) {
    console.error("Image proxy fetch failed:", error)
    return new Response("Upstream fetch failed", { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: 502 })
  }

  const headers = new Headers()
  headers.set("Content-Type", upstream.headers.get("content-type") ?? "application/octet-stream")
  headers.set("Cache-Control", CACHE_HEADER)

  return new Response(upstream.body, { status: 200, headers })
}

export async function POST() {
  return new Response("Method Not Allowed", { status: 405 })
}
