import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import os from "node:os"

import sharp from "sharp"
import { createClient } from "@supabase/supabase-js"

const DEFAULT_BUCKET = process.env.SUPABASE_IMAGE_LIBRARY_BUCKET || "image-library"
const MAX_OPTIMIZED_WIDTH = 800
const THUMB_WIDTH = 300
const OPTIMIZED_QUALITY = 78
const THUMB_QUALITY = 68
const PAGE_SIZE = 100

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const args = process.argv.slice(2)
const hasFlag = (flag) => args.includes(flag)
const readArgValue = (flag) => {
  const index = args.indexOf(flag)
  if (index === -1) return null
  return args[index + 1] ?? null
}

const bucket = readArgValue("--bucket") || DEFAULT_BUCKET
const prefix = readArgValue("--prefix") || ""
const limitArg = readArgValue("--limit")
const itemLimit = limitArg ? Math.max(1, Number.parseInt(limitArg, 10) || 0) : null
const dryRun = hasFlag("--dry-run")
const reportPath =
  readArgValue("--report") ||
  path.join(os.tmpdir(), `image-library-migration-${new Date().toISOString().replaceAll(":", "-")}.json`)

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const getDirectory = (storagePath) => {
  const normalized = storagePath.replace(/^\/+/, "")
  const lastSlash = normalized.lastIndexOf("/")
  return lastSlash >= 0 ? normalized.slice(0, lastSlash) : ""
}

const getFilename = (storagePath) => {
  const normalized = storagePath.replace(/^\/+/, "")
  const lastSlash = normalized.lastIndexOf("/")
  return lastSlash >= 0 ? normalized.slice(lastSlash + 1) : normalized
}

const getBaseName = (filename) => {
  const extension = path.extname(filename)
  return extension ? filename.slice(0, -extension.length) : filename
}

const getExtension = (filename) => path.extname(filename).toLowerCase()

const buildSiblingPath = (storagePath, siblingName) => {
  const directory = getDirectory(storagePath)
  return directory ? `${directory}/${siblingName}` : siblingName
}

const listRecursively = async (bucketName, folder = "") => {
  const results = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage.from(bucketName).list(folder, {
      limit: PAGE_SIZE,
      offset,
      sortBy: { column: "name", order: "asc" },
    })

    if (error) {
      throw error
    }

    const page = data ?? []
    if (page.length === 0) {
      break
    }

    for (const entry of page) {
      if (!entry?.name) {
        continue
      }

      const entryPath = folder ? `${folder}/${entry.name}` : entry.name
      const isFolder = !entry.metadata

      if (isFolder) {
        results.push(...(await listRecursively(bucketName, entryPath)))
        continue
      }

      results.push({
        name: entry.name,
        path: entryPath,
        metadata: entry.metadata ?? {},
      })
    }

    if (page.length < PAGE_SIZE) {
      break
    }

    offset += page.length
  }

  return results
}

const toBuffer = async (downloadResult) => {
  const arrayBuffer = await downloadResult.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

const createOptimizedBuffer = async (inputBuffer, width, quality) => {
  return sharp(inputBuffer).rotate().resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer()
}

const uploadIfMissing = async (bucketName, storagePath, buffer, contentType) => {
  const { error } = await supabase.storage.from(bucketName).upload(storagePath, buffer, {
    upsert: false,
    contentType,
    cacheControl: "public, max-age=31536000, immutable",
  })

  if (!error) {
    return { uploaded: true, skipped: false }
  }

  const message = error.message.toLowerCase()
  const alreadyExists =
    message.includes("already exists") || message.includes("duplicate") || message.includes("resource already exists")

  if (alreadyExists) {
    return { uploaded: false, skipped: true }
  }

  throw error
}

const sourceFiles = await listRecursively(bucket, prefix)
const nonThumbFiles = sourceFiles.filter((file) => !file.path.toLowerCase().endsWith("_thumb.webp"))
const nonWebpBaseKeys = new Set(
  nonThumbFiles
    .filter((file) => getExtension(file.name) !== ".webp")
    .map((file) => `${getDirectory(file.path)}::${getBaseName(getFilename(file.path))}`),
)

const candidates = nonThumbFiles.filter((file) => {
  const extension = getExtension(file.name)
  if (extension === ".webp") {
    const key = `${getDirectory(file.path)}::${getBaseName(getFilename(file.path))}`
    return !nonWebpBaseKeys.has(key)
  }
  return true
})

const report = {
  bucket,
  prefix,
  dryRun,
  startedAt: new Date().toISOString(),
  totalDiscovered: sourceFiles.length,
  totalCandidates: candidates.length,
  processed: 0,
  optimizedUploaded: 0,
  optimizedSkipped: 0,
  thumbUploaded: 0,
  thumbSkipped: 0,
  sourceSkipped: 0,
  errors: [],
  items: [],
}

for (const [index, file] of candidates.entries()) {
  if (itemLimit && report.processed >= itemLimit) {
    break
  }

  const extension = getExtension(file.name)
  const basename = getBaseName(file.name)
  const optimizedPath = extension === ".webp" ? file.path : buildSiblingPath(file.path, `${basename}.webp`)
  const thumbPath = buildSiblingPath(file.path, `${basename}_thumb.webp`)

  const itemLog = {
    source: file.path,
    optimizedPath,
    thumbPath,
    status: "pending",
    optimized: "pending",
    thumb: "pending",
    error: null,
  }

  try {
    console.info(`[${index + 1}/${candidates.length}] Procesando ${file.path}`)

    const { data, error } = await supabase.storage.from(bucket).download(file.path)
    if (error || !data) {
      throw error || new Error("No se pudo descargar la imagen")
    }

    const inputBuffer = await toBuffer(data)
    const optimizedBuffer =
      extension === ".webp" ? inputBuffer : await createOptimizedBuffer(inputBuffer, MAX_OPTIMIZED_WIDTH, OPTIMIZED_QUALITY)
    const thumbBuffer = await createOptimizedBuffer(inputBuffer, THUMB_WIDTH, THUMB_QUALITY)

    if (dryRun) {
      itemLog.status = "dry-run"
      itemLog.optimized = extension === ".webp" ? "unchanged" : "would-upload"
      itemLog.thumb = "would-upload"
      report.items.push(itemLog)
      report.processed += 1
      continue
    }

    if (extension === ".webp") {
      itemLog.optimized = "unchanged"
      report.sourceSkipped += 1
    } else {
      const optimizedResult = await uploadIfMissing(bucket, optimizedPath, optimizedBuffer, "image/webp")
      if (optimizedResult.uploaded) {
        report.optimizedUploaded += 1
        itemLog.optimized = "uploaded"
      } else {
        report.optimizedSkipped += 1
        itemLog.optimized = "exists"
      }
    }

    const thumbResult = await uploadIfMissing(bucket, thumbPath, thumbBuffer, "image/webp")
    if (thumbResult.uploaded) {
      report.thumbUploaded += 1
      itemLog.thumb = "uploaded"
    } else {
      report.thumbSkipped += 1
      itemLog.thumb = "exists"
    }

    itemLog.status = "ok"
    report.processed += 1
    report.items.push(itemLog)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    itemLog.status = "error"
    itemLog.error = message
    report.errors.push({ source: file.path, error: message })
    report.items.push(itemLog)
    console.error(`Error procesando ${file.path}:`, message)
  }
}

report.finishedAt = new Date().toISOString()

await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")

console.info("")
console.info("Migracion finalizada")
console.info(`Bucket: ${bucket}`)
console.info(`Procesadas: ${report.processed}`)
console.info(`Optimizadas subidas: ${report.optimizedUploaded}`)
console.info(`Optimizadas omitidas: ${report.optimizedSkipped}`)
console.info(`Thumbs subidos: ${report.thumbUploaded}`)
console.info(`Thumbs omitidos: ${report.thumbSkipped}`)
console.info(`Errores: ${report.errors.length}`)
console.info(`Reporte: ${reportPath}`)

if (report.errors.length > 0) {
  process.exitCode = 1
}
