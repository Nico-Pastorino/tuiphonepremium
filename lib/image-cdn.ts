import imageCdnMapping from "@/data/image-cdn-mapping.json"

export const IMAGE_CDN_MODES = ["supabase", "blob"] as const
export type ImageCdnMode = (typeof IMAGE_CDN_MODES)[number]
type SupabaseImageTransformOptions = {
  width?: number
  height?: number
  quality?: number
  resize?: "cover" | "contain" | "fill"
}

const DEFAULT_MODE: ImageCdnMode = "supabase"
const SUPABASE_OBJECT_PATH_FRAGMENT = "/storage/v1/object/public/"
const SUPABASE_RENDER_PATH_FRAGMENT = "/storage/v1/render/image/public/"
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
    const hasSupportedPath =
      parsed.pathname.includes(SUPABASE_OBJECT_PATH_FRAGMENT) || parsed.pathname.includes(SUPABASE_RENDER_PATH_FRAGMENT)
    return parsed.hostname.includes("supabase") && hasSupportedPath
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

export const buildSupabaseImageUrl = (
  url: string | null | undefined,
  options: SupabaseImageTransformOptions = {},
): string => {
  const resolved = resolveImageUrl(url)
  if (!resolved || !isSupabaseStorageUrl(resolved)) {
    return resolved
  }

  const parsed = new URL(resolved)
  if (parsed.pathname.includes(SUPABASE_OBJECT_PATH_FRAGMENT)) {
    parsed.pathname = parsed.pathname.replace(SUPABASE_OBJECT_PATH_FRAGMENT, SUPABASE_RENDER_PATH_FRAGMENT)
  }

  if (options.width) {
    parsed.searchParams.set("width", String(options.width))
  }
  if (options.height) {
    parsed.searchParams.set("height", String(options.height))
  }
  if (options.quality) {
    parsed.searchParams.set("quality", String(options.quality))
  }
  if (options.resize) {
    parsed.searchParams.set("resize", options.resize)
  }

  return parsed.toString()
}

export const getProductListImageUrl = (url: string | null | undefined): string =>
  buildSupabaseImageUrl(url, { width: 400, height: 400, quality: 70, resize: "contain" })

export const getProductThumbnailImageUrl = (url: string | null | undefined): string =>
  buildSupabaseImageUrl(url, { width: 200, height: 200, quality: 65, resize: "contain" })

export const getProductDetailImageUrl = (url: string | null | undefined): string =>
  buildSupabaseImageUrl(url, { width: 1400, height: 1400, quality: 82, resize: "contain" })

export const getAdminLibraryImageUrl = (url: string | null | undefined): string =>
  buildSupabaseImageUrl(url, { width: 320, height: 320, quality: 68, resize: "cover" })
