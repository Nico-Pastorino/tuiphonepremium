export type TradeInConditionId = "under90" | "over90"

export interface TradeInCondition {
  id: TradeInConditionId
  label: string
}

export type TradeInStorageId = "64gb" | "128gb" | "256gb" | "512gb"

export interface TradeInStorageColumn {
  id: TradeInStorageId
  label: string
  conditions: TradeInCondition[]
}

export interface TradeInRow {
  id: string
  label: string
  values: Record<TradeInStorageId, Record<TradeInConditionId, number | null>>
}

export type TradeInSectionId = "batteries" | "equipos"

export interface TradeInSection {
  id: TradeInSectionId | string
  title: string
  description?: string
  storageColumns: TradeInStorageColumn[]
  rows: TradeInRow[]
}

export interface TradeInConfig {
  sections: TradeInSection[]
  updatedAt: string
}
