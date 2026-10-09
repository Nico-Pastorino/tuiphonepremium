import assert from "node:assert/strict"
import test from "node:test"

import {
  buildSearchHref,
  clearSearch,
  commitDebouncedSearch,
  createSearchState,
  mirrorSearchInHistory,
  setSearchInput,
  syncSearchFromHref,
} from "../lib/search-sync.ts"

test("rapid typing commits only the final input when the debounce fires", () => {
  let state = createSearchState("")

  state = setSearchInput(state, "i")
  state = setSearchInput(state, "ip")
  state = setSearchInput(state, "iphone 15 pro")

  assert.equal(state.debouncedSearch, "")
  assert.deepEqual(commitDebouncedSearch(state), {
    input: "iphone 15 pro",
    debouncedSearch: "iphone 15 pro",
  })
})

test("slow typing updates local debounced state without producing a navigation request", () => {
  let state = createSearchState("")

  state = commitDebouncedSearch(setSearchInput(state, "i"))
  assert.deepEqual(state, { input: "i", debouncedSearch: "i" })

  state = commitDebouncedSearch(setSearchInput(state, "ip"))
  assert.deepEqual(state, { input: "ip", debouncedSearch: "ip" })
  assert.deepEqual(Object.keys(state).sort(), ["debouncedSearch", "input"])
})

test("URL mirroring preserves pathname, unrelated params, hash, and history state", () => {
  const calls = []
  const history = {
    state: { key: "next-history-state", tree: ["productos"] },
    replaceState(...args) {
      calls.push(args)
    },
  }

  const href = mirrorSearchInHistory(
    history,
    "https://tuiphonepremium.com/productos?category=iphone&condition=nuevo#catalogo",
    "iPhone 15 Pro & Max",
  )

  assert.equal(
    href,
    "/productos?category=iphone&condition=nuevo&search=iPhone+15+Pro+%26+Max#catalogo",
  )
  assert.deepEqual(calls, [
    [history.state, "", "/productos?category=iphone&condition=nuevo&search=iPhone+15+Pro+%26+Max#catalogo"],
  ])
})

test("clearing search updates both values immediately and removes search from the URL", () => {
  const state = clearSearch({ input: "iphone", debouncedSearch: "iphone" })

  assert.deepEqual(state, { input: "", debouncedSearch: "" })
  assert.equal(
    buildSearchHref("https://tuiphonepremium.com/productos?search=iphone&category=ipad#catalogo", ""),
    "/productos?category=ipad#catalogo",
  )
})

test("external popstate source normalizes search into input and debounced state", () => {
  assert.deepEqual(
    syncSearchFromHref("https://tuiphonepremium.com/productos?category=mac&search=%20MacBook%20Air%20"),
    { input: "MacBook Air", debouncedSearch: "MacBook Air" },
  )
  assert.deepEqual(syncSearchFromHref("https://tuiphonepremium.com/productos?category=mac"), {
    input: "",
    debouncedSearch: "",
  })
})
