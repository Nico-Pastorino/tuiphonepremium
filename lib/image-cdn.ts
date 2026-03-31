import imageCdnMapping from "@/data/image-cdn-mapping.json"

export const IMAGE_CDN_MODES = ["supabase", "blob"] as const
export type ImageCdnMode = (typeof IMAGE_CDN_MODES)[number]

type ImageVariantUrls = {
  thumbnail: string
  optimized: string
  original: string
}

type StorageReference = {
  bucket: string
  path: string
}

const DEFAULT_MODE: ImageCdnMode = "supabase"
const SUPABASE_OBJECT_PATH_FRAGMENT = "/storage/v1/object/public/"
const VERCEL_BLOB_HOST_SNIPPET = "vercel-storage"
const DEBUG_IMAGE_URLS = process.env.NEXT_PUBLIC_DEBUG_IMAGE_URLS === "true" || process.env.NODE_ENV !== "production"

export const isEmbeddedImageDataUrl = (value: string | null | undefined): boolean => {
  if (!value) {
    return false
  }

  const normalized = value.trim().toLowerCase()
  return normalized.startsWith("data:image/") || normalized.includes(";base64,")
}

export const sanitizeImageValue = (value: string | null | undefined): string => {
  if (!value) {
    return ""
  }

  const normalized = value.trim()
  if (!normalized || isEmbeddedImageDataUrl(normalized)) {
    return ""
  }

  return normalized
}

export const sanitizeImageList = (values: unknown): string[] => {
  if (!Array.isArray(values)) {
    return []
  }

  return values
    .map((value) => sanitizeImageValue(typeof value === "string" ? value : null))
    .filter((value, index, array) => value.length > 0 && array.indexOf(value) === index)
}

export const getImageCdnMode = (): ImageCdnMode => {
  const raw = (process.env.NEXT_PUBLIC_IMAGE_CDN_MODE ?? process.env.IMAGE_CDN_MODE ?? DEFAULT_MODE).toLowerCase()
  return raw === "blob" ? "blob" : "supabase"
}

const isDataOrLocalUrl = (url: string): boolean =>
  url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("/")

export const isSupabaseStorageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return parsed.hostname.includes("supabase") && parsed.pathname.includes(SUPABASE_OBJECT_PATH_FRAGMENT)
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

const getStoragePublicBaseUrl = (): string | null => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!supabaseUrl) {
    return null
  }
  return `${supabaseUrl.replace(/\/+$/, "")}${SUPABASE_OBJECT_PATH_FRAGMENT}`
}

const parseStorageReferenceFromUrl = (url: string): StorageReference | null => {
  if (!isSupabaseStorageUrl(url)) {
    return null
  }

  const parsed = new URL(url)
  const markerIndex = parsed.pathname.indexOf(SUPABASE_OBJECT_PATH_FRAGMENT)
  if (markerIndex < 0) {
    return null
  }

  const relativePath = parsed.pathname.slice(markerIndex + SUPABASE_OBJECT_PATH_FRAGMENT.length)
  const segments = relativePath.split("/").filter(Boolean)
  if (segments.length < 2) {
    return null
  }

  return {
    bucket: decodeURIComponent(segments[0]),
    path: decodeURIComponent(segments.slice(1).join("/")),
  }
}

const normalizeBucketAndPath = (value: string): StorageReference => {
  if (isSupabaseStorageUrl(value)) {
    return parseStorageReferenceFromUrl(value) ?? { bucket: "image-library", path: value }
  }

  const normalized = value.replace(/^\/+/, "")
  const segments = normalized.split("/").filter(Boolean)
  if (segments.length > 1 && segments[0] === "image-library") {
    return { bucket: segments[0], path: segments.slice(1).join("/") }
  }

  return { bucket: "image-library", path: normalized }
}

const buildPublicStorageUrl = (bucket: string, storagePath: string): string => {
  const base = getStoragePublicBaseUrl()
  if (!base) {
    return storagePath
  }

  return `${base}${encodeURIComponent(bucket)}/${storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`
}

const buildVariantStoragePath = (storagePath: string, variant: "original" | "optimized" | "thumb"): string => {
  const segments = storagePath.split("/")
  const filename = segments.pop() ?? storagePath
  const extensionIndex = filename.lastIndexOf(".")
  const extension = extensionIndex >= 0 ? filename.slice(extensionIndex).toLowerCase() : ""

  const safeBasename = extensionIndex >= 0 ? filename.slice(0, extensionIndex) : filename
  const isThumb = safeBasename.endsWith("_thumb")

  let nextFilename = filename

  if (variant === "original") {
    return [...segments, filename].join("/")
  }

  if (variant === "optimized") {
    if (extension === ".webp" && !isThumb) {
      return [...segments, filename].join("/")
    }
    const optimizedBase = isThumb ? safeBasename.slice(0, -"_thumb".length) : safeBasename
    nextFilename = `${optimizedBase}.webp`
  }

  if (variant === "thumb") {
    if (extension === ".webp" && isThumb) {
      return [...segments, filename].join("/")
    }
    const thumbBase = isThumb ? safeBasename.slice(0, -"_thumb".length) : safeBasename
    nextFilename = `${thumbBase}_thumb.webp`
  }

  return [...segments, nextFilename].join("/")
}

const logResolvedImage = (label: string, variants: ImageVariantUrls) => {
  if (!DEBUG_IMAGE_URLS) {
    return
  }

  console.log(`[image-cdn] ${label}`, variants)
}

export const resolveImageUrl = (url: string | null | undefined): string => {
  const sanitized = sanitizeImageValue(url)
  if (!sanitized) {
    return ""
  }

  if (isDataOrLocalUrl(sanitized) || isVercelBlobUrl(sanitized)) {
    return sanitized
  }

  if (!isSupabaseStorageUrl(sanitized)) {
    return sanitized
  }

  const mode = getImageCdnMode()
  if (mode === "supabase") {
    const reference = parseStorageReferenceFromUrl(sanitized)
    return reference ? buildPublicStorageUrl(reference.bucket, reference.path) : sanitized
  }

  const mapped = (imageCdnMapping as Record<string, string>)[sanitized]
  if (mapped) {
    return mapped
  }

  return `/api/img?url=${encodeURIComponent(sanitized)}`
}

export const getStorageImageUrls = (value: string | null | undefined, label = "storage-image"): ImageVariantUrls => {
  const resolved = resolveImageUrl(value)
  if (!resolved) {
    return { thumbnail: "", optimized: "", original: "" }
  }

  if (isDataOrLocalUrl(resolved) || isVercelBlobUrl(resolved) || !isSupabaseStorageUrl(resolved)) {
    return { thumbnail: resolved, optimized: resolved, original: resolved }
  }

  const reference = normalizeBucketAndPath(resolved)
  const variants = {
    thumbnail: buildPublicStorageUrl(reference.bucket, buildVariantStoragePath(reference.path, "thumb")),
    optimized: buildPublicStorageUrl(reference.bucket, buildVariantStoragePath(reference.path, "optimized")),
    original: buildPublicStorageUrl(reference.bucket, buildVariantStoragePath(reference.path, "original")),
  }

  logResolvedImage(label, variants)
  return variants
}

export const getProductListImageUrls = (url: string | null | undefined): ImageVariantUrls =>
  getStorageImageUrls(url, "product-list")

export const getProductThumbnailImageUrls = (url: string | null | undefined): ImageVariantUrls =>
  getStorageImageUrls(url, "product-thumb")

export const getProductDetailImageUrls = (url: string | null | undefined): ImageVariantUrls =>
  getStorageImageUrls(url, "product-detail")

export const getAdminLibraryImageUrls = (url: string | null | undefined): ImageVariantUrls =>
  getStorageImageUrls(url, "admin-library")
