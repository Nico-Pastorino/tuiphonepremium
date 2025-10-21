import { NextResponse, type NextRequest } from "next/server"

import { addImageToLibrary, getImageLibrary, removeImageFromLibrary } from "@/lib/image-library"
import { supabaseAdmin, SITE_CONFIG_TABLE_NOT_FOUND } from "@/lib/supabase-admin"

const buildErrorResponse = (message: string, status = 500) => NextResponse.json({ error: message }, { status })

const isAdminUnavailable = (error: unknown) => {
  if (error instanceof Error) {
    return (
      error.message === "Admin client not configured" ||
      error.message === SITE_CONFIG_TABLE_NOT_FOUND ||
      error.message.toLowerCase().includes("admin client not configured")
    )
  }
  return false
}

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return buildErrorResponse("El backend de almacenamiento no esta configurado", 503)
    }

    const data = await getImageLibrary()
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Image library GET error:", error)
    if (isAdminUnavailable(error)) {
      return buildErrorResponse("El backend de almacenamiento no esta configurado", 503)
    }
    return buildErrorResponse("No se pudo obtener la biblioteca de imagenes")
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return buildErrorResponse("El backend de almacenamiento no esta configurado", 503)
    }

    const { label, category, dataUrl } = (await request.json()) as {
      label?: string
      category?: string
      dataUrl?: string
    }

    if (!dataUrl || typeof dataUrl !== "string" || dataUrl.trim().length === 0) {
      return buildErrorResponse("Falta la imagen a subir", 400)
    }

    const item = await addImageToLibrary({
      dataUrl,
      label: typeof label === "string" ? label : "Imagen",
      category: typeof category === "string" ? category : "general",
    })

    return NextResponse.json({ data: item }, { status: 201 })
  } catch (error) {
    console.error("Image library POST error:", error)
    if (isAdminUnavailable(error)) {
      return buildErrorResponse("El backend de almacenamiento no esta configurado", 503)
    }
    return buildErrorResponse(error instanceof Error ? error.message : "No se pudo subir la imagen")
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return buildErrorResponse("El backend de almacenamiento no esta configurado", 503)
    }

    const { id } = (await request.json()) as { id?: string }
    if (!id || typeof id !== "string") {
      return buildErrorResponse("Falta el identificador de la imagen", 400)
    }

    const data = await removeImageFromLibrary(id)
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Image library DELETE error:", error)
    if (isAdminUnavailable(error)) {
      return buildErrorResponse("El backend de almacenamiento no esta configurado", 503)
    }
    return buildErrorResponse(error instanceof Error ? error.message : "No se pudo eliminar la imagen")
  }
}
