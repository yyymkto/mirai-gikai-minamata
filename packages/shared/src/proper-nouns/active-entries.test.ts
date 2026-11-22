import { describe, expect, it } from "vitest";
import { entriesActiveOn, isActiveOn } from "./active-entries";
import type { FactionEntry } from "./types";

function faction(
  id: string,
  validFrom: string | null,
  validTo: string | null
): FactionEntry {
  return {
    id,
    kind: "faction",
    canonical: id,
    reading: null,
    aliases: [],
    knownVariants: [],
    validFrom,
    validTo,
    confirmedAsOf: "2026-01-01",
    sources: [],
  };
}

describe("isActiveOn", () => {
  it("期間の開始日と終了日はどちらも有効に含む", () => {
    const entry = faction("a", "2023-05-01", "2027-04-30");
    expect(isActiveOn(entry, "2023-05-01")).toBe(true);
    expect(isActiveOn(entry, "2027-04-30")).toBe(true);
  });

  it("期間の外は無効", () => {
    const entry = faction("a", "2023-05-01", "2027-04-30");
    expect(isActiveOn(entry, "2023-04-30")).toBe(false);
    expect(isActiveOn(entry, "2027-05-01")).toBe(false);
  });

  it("端が null なら、その側は制限しない", () => {
    expect(isActiveOn(faction("a", null, "2027-04-30"), "1990-01-01")).toBe(
      true
    );
    expect(isActiveOn(faction("a", "2023-05-01", null), "2100-01-01")).toBe(
      true
    );
  });
});

describe("entriesActiveOn", () => {
  it("開催日に有効な項目だけを返す", () => {
    const entries = [
      faction("old", "2019-05-01", "2023-04-30"),
      faction("current", "2023-05-01", "2027-04-30"),
    ];
    expect(entriesActiveOn(entries, "2025-09-01").map((e) => e.id)).toEqual([
      "current",
    ]);
  });
});
