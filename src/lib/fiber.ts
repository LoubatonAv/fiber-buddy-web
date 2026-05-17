import type { Sex } from "../types";

export function calculateFiber(amountGrams: number, fiberPer100g: number) {
  if (!Number.isFinite(amountGrams) || !Number.isFinite(fiberPer100g)) return 0;
  return (amountGrams / 100) * fiberPer100g;
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getDefaultFiberGoal(sex: Sex) {
  return sex === "female" ? 25 : 30;
}

export function formatFiber(value: number) {
  return `${value.toFixed(value >= 10 ? 0 : 1)}g`;
}
