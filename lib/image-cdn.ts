import imageCdnMapping from "@/data/image-cdn-mapping.json"

export const IMAGE_CDN_MODES = ["supabase", "blob"] as const
export type ImageCdnMode = (typeof IMAGE_CDN_MODES)[number]

const DEFAULT_MODE: ImageCdnMode = "supabase"
const SUPABASE_PATH_FRAGMENT = "/storage/v1/object/public/"
const VERCEL_BLOB_HOST_SNIPPET = "vercel-storage"

export const getImageCdnMode = (): ImageCdnMode => {
  const raw = (process.env.NEXT_PUBLIC_IMAGE_CDN_MODE ?? process.env.IMAGE_CDN_MODE ?? DEFAULT_MODE).toLowerCase()
  return raw === "blob" ? "blob" : "supabase"
}

const isDataOrLocalUrl = (url: string): boolean =>
  url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("/")

export const isSupabaseStorageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return parsed.hostname.includes("supabase") && parsed.pathname.includes(SUPABASE_PATH_FRAGMENT)
  } catch (error) {
    return false
  }
}

const isVercelBlobUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return parsed.hostname.includes(VERCEL_BLOB_HOST_SNIPPET)
  } catch (error) {
    return false
  }
}

export const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) {
    return ""
  }

  if (isDataOrLocalUrl(url)) {
    return url
  }

  if (isVercelBlobUrl(url)) {
    return url
  }

  if (!isSupabaseStorageUrl(url)) {
    return url
  }

  const mode = getImageCdnMode()
  if (mode === "supabase") {
    return url
  }

  const mapped = (imageCdnMapping as Record<string, string>)[url]
  if (mapped) {
    return mapped
  }

  return `/api/img?url=${encodeURIComponent(url)}`
}
