import fs from "node:fs"
import path from "node:path"
import { put } from "@vercel/blob"
import { ProductAdminService } from "@/lib/supabase-admin"
import { isSupabaseStorageUrl } from "@/lib/image-cdn"

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN
const DRY_RUN = process.env.DRY_RUN === "1"
const MAPPING_PATH = path.join(process.cwd(), "data", "image-cdn-mapping.json")
const SUPABASE_PATH_FRAGMENT = "/storage/v1/object/public/"

type Mapping = Record<string, string>

const readMapping = (): Mapping => {
  try {
    const raw = fs.readFileSync(MAPPING_PATH, "utf-8")
    return JSON.parse(raw) as Mapping
  } catch (error) {
    return {}
  }
}

const writeMapping = (mapping: Mapping) => {
  fs.mkdirSync(path.dirname(MAPPING_PATH), { recursive: true })
  fs.writeFileSync(MAPPING_PATH, JSON.stringify(mapping, null, 2))
}

const getBlobPath = (url: string): string | null => {
  try {
    const parsed = new URL(url)
    const index = parsed.pathname.indexOf(SUPABASE_PATH_FRAGMENT)
    if (index === -1) {
      return null
    }
    const relative = parsed.pathname.slice(index + SUPABASE_PATH_FRAGMENT.length)
    return relative.startsWith("/") ? relative.slice(1) : relative
  } catch (error) {
    return null
  }
}

const fetchAllProductImages = async (): Promise<string[]> => {
  const urls = new Set<string>()
  let offset = 0
  const limit = 250

  while (true) {
    const { data, error } = await ProductAdminService.getAllProducts({ limit, offset })
    if (error) {
      throw error
    }
    const rows = data ?? []
    for (const product of rows) {
      const images = Array.isArray(product.images) ? product.images : []
      for (const image of images) {
        if (typeof image === "string" && image.trim().length > 0 && isSupabaseStorageUrl(image)) {
          urls.add(image)
        }
      }
    }
    if (rows.length < limit) {
      break
    }
    offset += limit
  }

  return Array.from(urls)
}

const migrate = async () => {
  if (!BLOB_TOKEN) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN")
  }

  const mapping = readMapping()
  const images = await fetchAllProductImages()

  console.log(`Encontradas ${images.length} URLs de imagenes.`)

  for (const url of images) {
    if (mapping[url]) {
      continue
    }

    const blobPath = getBlobPath(url)
    if (!blobPath) {
      console.warn(`No se pudo calcular path para ${url}`)
      continue
    }

    console.log(`Migrando: ${url} -> ${blobPath}`)

    if (DRY_RUN) {
      continue
    }

    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`Fallo descarga ${url}: ${response.status}`)
      continue
    }

    const contentType = response.headers.get("content-type") ?? "application/octet-stream"
    const buffer = Buffer.from(await response.arrayBuffer())

    const uploaded = await put(blobPath, buffer, {
      access: "public",
      contentType,
      token: BLOB_TOKEN,
    })

    mapping[url] = uploaded.url
    writeMapping(mapping)
  }

  writeMapping(mapping)
  console.log("Migracion finalizada.")
}

migrate().catch((error) => {
  console.error("Error en migracion:", error)
  process.exit(1)
})
