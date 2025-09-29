import type {
  TradeInConfig,
  TradeInCondition,
  TradeInConditionId,
  TradeInRow,
  TradeInSection,
  TradeInStorageColumn,
  TradeInStorageId,
} from "@/types/trade-in"

const CONDITION_UNDER_90: TradeInCondition = { id: "under90", label: "-90%" }
const CONDITION_OVER_90: TradeInCondition = { id: "over90", label: "90+" }

export const TRADE_IN_CONDITIONS: TradeInCondition[] = [CONDITION_UNDER_90, CONDITION_OVER_90]

const STORAGE_COLUMNS: Record<TradeInStorageId, TradeInStorageColumn> = {
  "64gb": { id: "64gb", label: "64GB", conditions: TRADE_IN_CONDITIONS },
  "128gb": { id: "128gb", label: "128GB", conditions: TRADE_IN_CONDITIONS },
  "256gb": { id: "256gb", label: "256GB", conditions: TRADE_IN_CONDITIONS },
  "512gb": { id: "512gb", label: "512GB", conditions: TRADE_IN_CONDITIONS },
}

export const TRADE_IN_SECTION_LAYOUT: Record<string, TradeInStorageId[]> = {
  batteries: ["64gb", "128gb", "256gb"],
  equipos: ["128gb", "256gb", "512gb"],
}

const createRow = (
  id: string,
  label: string,
  values: Partial<Record<TradeInStorageId, Partial<Record<TradeInConditionId, number | null>>>>,
): TradeInRow => {
  const base: TradeInRow["values"] = {
    "64gb": { under90: null, over90: null },
    "128gb": { under90: null, over90: null },
    "256gb": { under90: null, over90: null },
    "512gb": { under90: null, over90: null },
  }

  for (const [storageId, storageValues] of Object.entries(values) as [TradeInStorageId, Partial<Record<TradeInConditionId, number | null>>][]) {
    base[storageId] = {
      ...base[storageId],
      ...storageValues,
    }
  }

  return { id, label, values: base }
}

const BATTERIES_SECTION: TradeInSection = {
  id: "batteries",
  title: "Baterias",
  storageColumns: [STORAGE_COLUMNS["64gb"], STORAGE_COLUMNS["128gb"], STORAGE_COLUMNS["256gb"]],
  rows: [
    createRow("iphone-11", "11", {
      "64gb": { under90: 150, over90: 160 },
      "128gb": { under90: 190, over90: 200 },
      "256gb": { under90: 200, over90: 210 },
    }),
    createRow("iphone-11-pro", "11 Pro", {
      "64gb": { under90: 180, over90: 190 },
      "256gb": { under90: 190, over90: 200 },
    }),
    createRow("iphone-11-pro-max", "11 Pro Max", {
      "64gb": { under90: 200, over90: 210 },
      "256gb": { under90: 220, over90: 240 },
    }),
    createRow("iphone-12", "12", {
      "64gb": { under90: 180, over90: 190 },
      "128gb": { under90: 200, over90: 210 },
      "256gb": { under90: 220, over90: 230 },
    }),
    createRow("iphone-12-mini", "12 Mini", {
      "64gb": { under90: 160, over90: 170 },
      "128gb": { under90: 180, over90: 190 },
      "256gb": { under90: 200, over90: 210 },
    }),
  ],
}

const EQUIPOS_SECTION: TradeInSection = {
  id: "equipos",
  title: "Equipos",
  storageColumns: [
    STORAGE_COLUMNS["128gb"],
    STORAGE_COLUMNS["256gb"],
    STORAGE_COLUMNS["512gb"],
  ],
  rows: [
    createRow("iphone-12-pro", "12 Pro", {
      "128gb": { under90: 310, over90: 320 },
      "256gb": { under90: 320, over90: 330 },
      "512gb": { under90: 340, over90: 350 },
    }),
    createRow("iphone-12-pro-max", "12 Pro Max", {
      "128gb": { under90: 360, over90: 370 },
      "256gb": { under90: 400, over90: 410 },
      "512gb": { under90: 440, over90: 450 },
    }),
    createRow("iphone-13", "13", {
      "128gb": { under90: 260, over90: 270 },
      "256gb": { under90: 290, over90: 300 },
    }),
    createRow("iphone-13-mini", "13 Mini", {
      "128gb": { under90: 210, over90: 220 },
      "256gb": { under90: 220, over90: 230 },
    }),
    createRow("iphone-13-pro", "13 Pro", {
      "128gb": { under90: 340, over90: 350 },
      "256gb": { under90: 350, over90: 360 },
    }),
    createRow("iphone-13-pro-max", "13 Pro Max", {
      "128gb": { under90: 410, over90: 420 },
      "256gb": { under90: 440, over90: 450 },
      "512gb": { under90: 450, over90: 460 },
    }),
    createRow("iphone-14", "14", {
      "128gb": { under90: 340, over90: 350 },
      "256gb": { under90: 360, over90: 370 },
    }),
    createRow("iphone-14-plus", "14 Plus", {
      "128gb": { under90: 360, over90: 370 },
      "256gb": { under90: 380, over90: 390 },
    }),
    createRow("iphone-14-pro", "14 Pro", {
      "128gb": { under90: 480, over90: 490 },
      "256gb": { under90: 500, over90: 510 },
      "512gb": { under90: 550, over90: 560 },
    }),
    createRow("iphone-14-pro-max", "14 Pro Max", {
      "128gb": { under90: 520, over90: 530 },
      "256gb": { under90: 540, over90: 550 },
    }),
    createRow("iphone-15", "15", {
      "128gb": { under90: 500, over90: 510 },
      "256gb": { under90: 520, over90: 530 },
      "512gb": { under90: 550, over90: 560 },
    }),
    createRow("iphone-15-plus", "15 Plus", {
      "128gb": { under90: 520, over90: 530 },
      "256gb": { under90: 540, over90: 550 },
    }),
    createRow("iphone-15-pro", "15 Pro", {
      "128gb": { under90: 610, over90: 620 },
      "256gb": { under90: 640, over90: 650 },
      "512gb": { under90: 670, over90: 680 },
    }),
    createRow("iphone-15-pro-max", "15 Pro Max", {
      "256gb": { under90: 780, over90: 790 },
      "512gb": { under90: 810, over90: 820 },
    }),
    createRow("iphone-16", "16", {
      "128gb": { under90: 580, over90: 590 },
      "256gb": { under90: 610, over90: 620 },
      "512gb": { under90: 630, over90: 640 },
    }),
    createRow("iphone-16-pro", "16 Pro", {
      "128gb": { under90: 680, over90: 690 },
      "256gb": { under90: 710, over90: 720 },
      "512gb": { under90: 730, over90: 740 },
    }),
    createRow("iphone-16-pro-max", "16 Pro Max", {
      "256gb": { under90: 780, over90: 790 },
      "512gb": { under90: 810, over90: 820 },
    }),
  ],
}

export const DEFAULT_TRADE_IN_CONFIG: TradeInConfig = {
  updatedAt: new Date().toISOString(),
  sections: [BATTERIES_SECTION, EQUIPOS_SECTION],
}

export function cloneTradeInConfig(config: TradeInConfig): TradeInConfig {
  return {
    updatedAt: config.updatedAt,
    sections: config.sections.map((section) => ({
      ...section,
      storageColumns: section.storageColumns.map((column) => ({ ...column })),
      rows: section.rows.map((row) => ({
        ...row,
        values: Object.fromEntries(
          Object.entries(row.values).map(([storageId, conditionValues]) => [
            storageId,
            { ...conditionValues },
          ]),
        ) as TradeInRow["values"],
      })),
    })),
  }
}

const normalizeNumber = (value: number | null | undefined): number | null => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null
  }
  return value
}

const normalizeRow = (row: TradeInRow): TradeInRow => {
  const values: TradeInRow["values"] = {
    "64gb": { under90: null, over90: null },
    "128gb": { under90: null, over90: null },
    "256gb": { under90: null, over90: null },
    "512gb": { under90: null, over90: null },
  }

  for (const storageId of Object.keys(values) as TradeInStorageId[]) {
    const source = row.values?.[storageId]
    values[storageId] = {
      under90: normalizeNumber(source?.under90 ?? null),
      over90: normalizeNumber(source?.over90 ?? null),
    }
  }

  return {
    id: row.id,
    label: row.label,
    values,
  }
}

const normalizeSection = (section: TradeInSection): TradeInSection => {
  const layout = TRADE_IN_SECTION_LAYOUT[section.id] ?? TRADE_IN_SECTION_LAYOUT.equipos
  const storageColumns = layout.map((storageId) => STORAGE_COLUMNS[storageId])

  return {
    id: section.id,
    title: section.title,
    description: section.description,
    storageColumns,
    rows: section.rows.map(normalizeRow),
  }
}

export function mergeTradeInConfig(base: TradeInConfig, partial?: Partial<TradeInConfig> | null): TradeInConfig {
  if (!partial) {
    return cloneTradeInConfig(base)
  }

  const nextSections = partial.sections
    ? partial.sections.map(normalizeSection)
    : base.sections.map(normalizeSection)

  return {
    updatedAt: partial.updatedAt ?? base.updatedAt,
    sections: nextSections,
  }
}
