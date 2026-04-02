export type NumericInputValue = number | ""

export function toNumericInputValue(value: string): NumericInputValue {
  if (value.trim() === "") {
    return ""
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : ""
}

export function toOptionalNumber(value: NumericInputValue): number | undefined {
  return value === "" ? undefined : value
}

export function toNullableNumber(value: NumericInputValue): number | null {
  return value === "" ? null : value
}

export function toRequiredNumber(value: NumericInputValue, fallback = 0): number {
  return value === "" ? fallback : value
}
