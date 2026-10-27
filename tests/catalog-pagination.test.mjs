import assert from "node:assert/strict"
import test from "node:test"

import { isRequestedRangeNotSatisfiable, parseCatalogPagination } from "../lib/catalog-pagination.mjs"

test("rechaza offsets que producirían un rango no satisfacible", () => {
  assert.equal(parseCatalogPagination(new URLSearchParams("limit=12&offset=999999999")), null)
})

test("mantiene la paginación válida y normaliza entradas inválidas", () => {
  assert.deepEqual(parseCatalogPagination(new URLSearchParams("limit=9&offset=36")), {
    limit: 9,
    offset: 36,
  })
  assert.deepEqual(parseCatalogPagination(new URLSearchParams("limit=12&offset=48")), {
    limit: 12,
    offset: 48,
  })
  assert.equal(parseCatalogPagination(new URLSearchParams("limit=12&offset=49")), null)
  assert.deepEqual(parseCatalogPagination(new URLSearchParams("limit=999999999&offset=-1")), {
    limit: 60,
    offset: 0,
  })
})

test("reconoce la respuesta de rango vacío de PostgREST", () => {
  assert.equal(isRequestedRangeNotSatisfiable({ message: "Requested range not satisfiable" }), true)
  assert.equal(isRequestedRangeNotSatisfiable({ message: "column does not exist" }), false)
})
