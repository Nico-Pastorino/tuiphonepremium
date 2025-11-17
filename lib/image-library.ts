import { randomUUID } from "crypto"
import sharp from "sharp"

import { SiteConfigService, supabaseAdmin, SITE_CONFIG_TABLE_NOT_FOUND } from "@/lib/supabase-admin"
import type { Json } from "@/types/database"
import type { ImageLibraryItem } from "@/types/image-library"

const IMAGE_LIBRARY_KEY = "image-library"
const DEFAULT_BUCKET = "image-library"
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024
const MAX_IMAGE_WIDTH = 1600

const getBucketName = () => process.env.SUPABASE_IMAGE_LIBRARY_BUCKET || DEFAULT_BUCKET

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const ensureStorageBucket = async () => {
  if (!supabaseAdmin) {
    throw new Error("Admin client not configured")
  }

  const bucket = getBucketName()
  const { data, error } = await supabaseAdmin.storage.getBucket(bucket)

  if (error && error.message && !error.message.toLowerCase().includes("not found")) {
    throw error
  }

  if (data) {
    return bucket
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
    public: true,
  })

  if (createError && !createError.message.toLowerCase().includes("exists")) {
    throw createError
  }

  return bucket
}

export type UploadResult =
  | { success: true; item: ImageLibraryItem }
  | { success: false; error: Error }

const parseDataUrl = (dataUrl: string) => {
  const match = dataUrl.match(/^data:(image\/[a-z0-9.+-]+);base64,(.*)$/i)
  if (!match) {
    throw new Error("Formato de imagen invalido")
  }
  const contentType = match[1]
  const base64Data = match[2]
  const buffer = Buffer.from(base64Data, "base64")
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error("La imagen excede el tamaño máximo permitido (2MB)")
  }
  const extension = contentType.split("/")[1]?.split("+")[0] || "png"
  return { buffer, contentType, extension }
}

const optimizeImage = async (
  buffer: Buffer,
  contentType: string,
  extension: string,
): Promise<{ buffer: Buffer; contentType: string; extension: string }> => {
  try {
    const transformer = sharp(buffer).rotate()
    const metadata = await transformer.metadata()
    const shouldResize = (metadata.width ?? 0) > MAX_IMAGE_WIDTH

    if (shouldResize) {
      transformer.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
    }

    const targetFormat = extension === "png" ? "png" : "webp"
    const optimizedBuffer =
      targetFormat === "png"
        ? await transformer.png({ quality: 80, compressionLevel: 9 }).toBuffer()
        : await transformer.webp({ quality: 80 }).toBuffer()

    const optimizedContentType = targetFormat === "png" ? "image/png" : "image/webp"
    return { buffer: optimizedBuffer, contentType: optimizedContentType, extension: targetFormat }
  } catch (error) {
    console.warn("No se pudo optimizar la imagen para la biblioteca. Se utilizara el archivo original.", error)
    return { buffer, contentType, extension }
  }
}

const sanitizeItem = (raw: unknown): ImageLibraryItem | null => {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const id = "id" in raw && typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : randomUUID()
  const label = "label" in raw && typeof raw.label === "string" ? raw.label.trim() : "Imagen"
  const category =
    "category" in raw && typeof raw.category === "string" && raw.category.trim().length > 0
      ? raw.category.trim()
      : "general"
  const url =
    "url" in raw && typeof raw.url === "string" && raw.url.trim().length > 0
      ? raw.url.trim()
      : null
  if (!url) {
    return null
  }
  const createdAt =
    "createdAt" in raw && typeof raw.createdAt === "string" && raw.createdAt.trim().length > 0
      ? raw.createdAt
      : new Date().toISOString()
  const storagePath =
    "storagePath" in raw && typeof raw.storagePath === "string" && raw.storagePath.trim().length > 0
      ? raw.storagePath.trim()
      : undefined

  return {
    id,
    label: label || "Imagen",
    category,
    url,
    createdAt,
    storagePath,
  }
}

const sanitizeCollection = (raw: unknown): ImageLibraryItem[] => {
  if (!Array.isArray(raw)) {
    return []
  }
  const result: ImageLibraryItem[] = []
  raw.forEach((item) => {
    const sanitized = sanitizeItem(item)
    if (sanitized) {
      result.push(sanitized)
    }
  })
  return result
}

const buildPublicUrl = (bucket: string, path: string): string => {
  if (!supabaseAdmin) {
    throw new Error("Admin client not configured")
  }
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export const getImageLibrary = async (): Promise<ImageLibraryItem[]> => {
  const result = await SiteConfigService.getConfigByKey(IMAGE_LIBRARY_KEY)

  if (result.error) {
    if (result.error instanceof Error) {
      if (result.error.message === "Admin client not configured") {
        throw result.error
      }
      if (result.error.message === SITE_CONFIG_TABLE_NOT_FOUND) {
        return []
      }
    }
    throw result.error instanceof Error
      ? result.error
      : new Error("Error al obtener la biblioteca de imagenes")
  }

  return sanitizeCollection(result.data?.value)
}

const saveImageLibrary = async (items: ImageLibraryItem[]) => {
  const payload = items.map(({ id, label, category, url, createdAt, storagePath }) => ({
    id,
    label,
    category,
    url,
    createdAt,
    storagePath,
  }))
  const result = await SiteConfigService.upsertConfig(IMAGE_LIBRARY_KEY, payload as Json)
  if (result.error) {
    throw result.error instanceof Error
      ? result.error
      : new Error("No se pudo guardar la biblioteca de imagenes")
  }
  return items
}

export const addImageToLibrary = async (
  params: { dataUrl: string; label: string; category: string },
): Promise<ImageLibraryItem> => {
  if (!supabaseAdmin) {
    throw new Error("Admin client not configured")
  }

  const bucket = await ensureStorageBucket()

  const parsed = parseDataUrl(params.dataUrl)
  const { buffer, contentType, extension } = await optimizeImage(parsed.buffer, parsed.contentType, parsed.extension)
  const categorySlug = slugify(params.category || "general") || "general"
  const id = randomUUID()
  const filePath = `${categorySlug}/${id}.${extension}`

  const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(filePath, buffer, {
    contentType,
    upsert: false,
    cacheControl: "public, max-age=31536000, immutable",
  })

  if (uploadError) {
    throw uploadError
  }

  const publicUrl = buildPublicUrl(bucket, filePath)
  const createdAt = new Date().toISOString()

  const library = await getImageLibrary()
  const newItem: ImageLibraryItem = {
    id,
    label: params.label.trim() || "Imagen",
    category: params.category.trim() || "general",
    url: publicUrl,
    createdAt,
    storagePath: filePath,
  }

  library.push(newItem)
  await saveImageLibrary(library)

  return newItem
}

export const removeImageFromLibrary = async (id: string): Promise<ImageLibraryItem[]> => {
  if (!supabaseAdmin) {
    throw new Error("Admin client not configured")
  }

  const bucket = await ensureStorageBucket()
  const library = await getImageLibrary()
  const target = library.find((item) => item.id === id)
  if (!target) {
    return library
  }

  if (target.storagePath) {
    const { error: deleteError } = await supabaseAdmin.storage.from(bucket).remove([target.storagePath])
    if (deleteError) {
      console.warn("No se pudo eliminar el archivo de almacenamiento:", deleteError)
    }
  }

  const filtered = library.filter((item) => item.id !== id)
  await saveImageLibrary(filtered)
  return filtered
}
