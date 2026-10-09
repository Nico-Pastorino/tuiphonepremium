export type SearchState = {
  input: string
  debouncedSearch: string
}

type HistoryWriter = {
  state: unknown
  replaceState(data: unknown, unused: string, url?: string | URL | null): void
}

export const normalizeSearch = (value: string | null | undefined): string => value?.trim() ?? ""

export function createSearchState(search: string | null | undefined): SearchState {
  const normalizedSearch = normalizeSearch(search)
  return { input: normalizedSearch, debouncedSearch: normalizedSearch }
}

export function setSearchInput(state: SearchState, input: string): SearchState {
  return { ...state, input }
}

export function commitDebouncedSearch(state: SearchState): SearchState {
  return { ...state, debouncedSearch: normalizeSearch(state.input) }
}

export function clearSearch(_state: SearchState): SearchState {
  return { input: "", debouncedSearch: "" }
}

export function syncSearchFromHref(href: string): SearchState {
  const url = new URL(href, "http://localhost")
  return createSearchState(url.searchParams.get("search"))
}

export function buildSearchHref(currentHref: string, search: string): string {
  const url = new URL(currentHref, "http://localhost")
  const normalizedSearch = normalizeSearch(search)

  if (normalizedSearch) {
    url.searchParams.set("search", normalizedSearch)
  } else {
    url.searchParams.delete("search")
  }

  return `${url.pathname}${url.search}${url.hash}`
}

export function mirrorSearchInHistory(history: HistoryWriter, currentHref: string, search: string): string {
  const href = buildSearchHref(currentHref, search)
  history.replaceState(history.state, "", href)
  return href
}
