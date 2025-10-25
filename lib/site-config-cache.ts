import { revalidateTag, unstable_cache } from "next/cache"

import { SiteConfigService, SITE_CONFIG_TABLE_NOT_FOUND } from "@/lib/supabase-admin"
import { DEFAULT_HOME_CONFIG, mergeHomeConfig } from "@/lib/home-config"
import { DEFAULT_TRADE_IN_CONFIG, mergeTradeInConfig } from "@/lib/trade-in-config"
import type { HomeConfig } from "@/types/home"
import type { TradeInConfig } from "@/types/trade-in"
import type { Json } from "@/types/database"

const HOME_CONFIG_KEY = "home"
const TRADE_IN_CONFIG_KEY = "trade-in"

const DEFAULT_CONFIG_TTL_SECONDS = 300

const isConfigUnavailable = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false
  }
  return error.message === "Admin client not configured" || error.message === SITE_CONFIG_TABLE_NOT_FOUND
}

export const HOME_CONFIG_CACHE_TAG = "home-config"
export const TRADE_IN_CONFIG_CACHE_TAG = "trade-in-config"

const loadHomeConfig = async (): Promise<HomeConfig> => {
  try {
    const { data, error } = await SiteConfigService.getConfigByKey(HOME_CONFIG_KEY)

    if (error) {
      if (isConfigUnavailable(error)) {
        return DEFAULT_HOME_CONFIG
      }
      throw error
    }

    const value = data?.value as Json | null
    return value ? mergeHomeConfig(DEFAULT_HOME_CONFIG, value as Partial<HomeConfig>) : DEFAULT_HOME_CONFIG
  } catch (error) {
    console.error("Fallo al leer la configuracion de portada:", error)
    return DEFAULT_HOME_CONFIG
  }
}

const loadTradeInConfig = async (): Promise<TradeInConfig> => {
  try {
    const { data, error } = await SiteConfigService.getConfigByKey(TRADE_IN_CONFIG_KEY)

    if (error) {
      if (isConfigUnavailable(error)) {
        return DEFAULT_TRADE_IN_CONFIG
      }
      throw error
    }

    const value = data?.value as Json | null
    return value ? mergeTradeInConfig(DEFAULT_TRADE_IN_CONFIG, value as Partial<TradeInConfig>) : DEFAULT_TRADE_IN_CONFIG
  } catch (error) {
    console.error("Fallo al leer la configuracion de plan canje:", error)
    return DEFAULT_TRADE_IN_CONFIG
  }
}

export const getHomeConfigCached = unstable_cache(loadHomeConfig, ["home-config"], {
  revalidate: DEFAULT_CONFIG_TTL_SECONDS,
  tags: [HOME_CONFIG_CACHE_TAG],
})

export const getTradeInConfigCached = unstable_cache(loadTradeInConfig, ["trade-in-config"], {
  revalidate: DEFAULT_CONFIG_TTL_SECONDS,
  tags: [TRADE_IN_CONFIG_CACHE_TAG],
})

export const invalidateHomeConfigCache = async (): Promise<void> => {
  await revalidateTag(HOME_CONFIG_CACHE_TAG)
}

export const invalidateTradeInConfigCache = async (): Promise<void> => {
  await revalidateTag(TRADE_IN_CONFIG_CACHE_TAG)
}
