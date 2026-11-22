import type { ProperNounEntry } from "./types";

/** 日付（YYYY-MM-DD）が項目の有効期間に含まれるか。不明な端は制限なしとして扱う */
export function isActiveOn(entry: ProperNounEntry, date: string): boolean {
  if (entry.validFrom !== null && date < entry.validFrom) return false;
  if (entry.validTo !== null && date > entry.validTo) return false;
  return true;
}

/** 会議の開催日に有効な項目だけを返す（文字起こしの語彙ヒント・照合の対象） */
export function entriesActiveOn<T extends ProperNounEntry>(
  entries: readonly T[],
  date: string
): T[] {
  return entries.filter((entry) => isActiveOn(entry, date));
}
