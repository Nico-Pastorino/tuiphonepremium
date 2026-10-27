const DEFAULT_LIMIT = 12
const MAX_LIMIT = 60
// La UI solicita como máximo cinco páginas de doce productos (offset 48).
// Rechazar valores mayores evita que PostgREST reciba rangos fuera del catálogo.
const MAX_OFFSET = 48

const parseNumberParam = (value, fallback, max) => {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.min(parsed, max)
}

export const isRequestedRangeNotSatisfiable = (error) => {
  return typeof error?.message === "string" && error.message.toLowerCase().includes("requested range not satisfiable")
}

export const parseCatalogPagination = (searchParams) => {
  const limit = parseNumberParam(searchParams.get("limit"), DEFAULT_LIMIT, MAX_LIMIT)
  const offsetValue = searchParams.get("offset")
  const offset = offsetValue ? Number.parseInt(offsetValue, 10) : 0

  if (!Number.isFinite(offset) || offset < 0) {
    return { limit, offset: 0 }
  }

  if (offset > MAX_OFFSET) {
    return null
  }

  return { limit, offset }
}
