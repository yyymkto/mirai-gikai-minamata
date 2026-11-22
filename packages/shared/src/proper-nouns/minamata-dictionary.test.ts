import { describe, expect, it } from "vitest";
import { entriesActiveOn } from "./active-entries";
import {
  MINAMATA_COMMITTEES,
  MINAMATA_DICTIONARY,
  MINAMATA_FACTIONS,
  MINAMATA_MEMBERS,
} from "./minamata-dictionary";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MEMBER_READING_PATTERN = /^[ぁ-ゖー]+ [ぁ-ゖー]+$/;

const memberIds = new Set(MINAMATA_MEMBERS.map((m) => m.id));

describe("辞書全体の整合性", () => {
  it("id が重複しない", () => {
    const ids = MINAMATA_DICTIONARY.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("正式表記が重複しない", () => {
    const names = MINAMATA_DICTIONARY.map((e) => e.canonical);
    expect(new Set(names).size).toBe(names.length);
  });

  it("正式表記・略称・誤記のどの表記も、2つの項目に当たらない", () => {
    const owners = new Map<string, string>();
    const collisions: string[] = [];
    for (const e of MINAMATA_DICTIONARY) {
      const surfaces = [
        e.canonical,
        ...e.aliases,
        ...e.knownVariants.map((v) => v.text),
      ];
      for (const surface of surfaces) {
        const owner = owners.get(surface);
        if (owner !== undefined && owner !== e.id) {
          collisions.push(`${surface}: ${owner} / ${e.id}`);
        }
        owners.set(surface, e.id);
      }
    }
    expect(collisions).toEqual([]);
  });

  it("誤記は正式表記と異なる", () => {
    for (const e of MINAMATA_DICTIONARY) {
      for (const v of e.knownVariants) {
        expect(v.text).not.toBe(e.canonical);
      }
    }
  });

  it("日付はすべて YYYY-MM-DD で、開始日が終了日より後にならない", () => {
    for (const e of MINAMATA_DICTIONARY) {
      for (const d of [e.validFrom, e.validTo]) {
        if (d !== null) expect(d).toMatch(DATE_PATTERN);
      }
      if (e.validFrom !== null && e.validTo !== null) {
        expect(e.validFrom <= e.validTo).toBe(true);
      }
      for (const s of e.sources) expect(s.checkedOn).toMatch(DATE_PATTERN);
      expect(e.confirmedAsOf).toMatch(DATE_PATTERN);
    }
  });

  it("すべての項目に出典がある", () => {
    for (const e of MINAMATA_DICTIONARY) {
      expect(e.sources.length).toBeGreaterThan(0);
    }
  });
});

describe("議員", () => {
  it("令和8年7月2日時点で16人", () => {
    expect(entriesActiveOn(MINAMATA_MEMBERS, "2026-07-02")).toHaveLength(16);
  });

  it("読みはひらがなで、姓と名を半角スペースで区切る", () => {
    for (const m of MINAMATA_MEMBERS) {
      expect(m.reading).toMatch(MEMBER_READING_PATTERN);
    }
  });

  it("正式表記は姓と名を全角スペースで区切る", () => {
    for (const m of MINAMATA_MEMBERS) {
      expect(m.canonical).toMatch(/^\S+　\S+$/);
    }
  });

  it("議長と副議長が1人ずつ", () => {
    expect(MINAMATA_MEMBERS.filter((m) => m.role === "議長")).toHaveLength(1);
    expect(MINAMATA_MEMBERS.filter((m) => m.role === "副議長")).toHaveLength(1);
  });

  it("名前の読みが同じ議員がいる（姓まで含めた照合が必要な例）", () => {
    const akemi = MINAMATA_MEMBERS.filter((m) =>
      m.reading?.endsWith(" あけみ")
    ).map((m) => m.canonical);
    expect(akemi).toEqual(["平岡　朱", "髙岡　朱美"]);
  });
});

describe("会派", () => {
  it("議員の所属会派がすべて辞書にある", () => {
    const factionIds = new Set(MINAMATA_FACTIONS.map((f) => f.id));
    for (const m of MINAMATA_MEMBERS) {
      expect(factionIds.has(m.factionId)).toBe(true);
    }
  });

  it("所属人数が会派構成ページと一致する", () => {
    const expected: Record<string, number> = {
      真志会: 4,
      自民新未来: 2,
      "Ｉ❜ｓ水俣": 2,
      日本共産党: 2,
      光政会: 1,
      公明党: 1,
      こども未来会: 1,
      参政会: 1,
      ネクストすまいる: 1,
      恵真会: 1,
    };
    const actual = Object.fromEntries(
      MINAMATA_FACTIONS.map((f) => [
        f.canonical,
        MINAMATA_MEMBERS.filter((m) => m.factionId === f.id).length,
      ])
    );
    expect(actual).toEqual(expected);
  });
});

describe("委員会", () => {
  it("委員・委員長・副委員長がすべて辞書の議員", () => {
    for (const c of MINAMATA_COMMITTEES) {
      for (const id of [c.chairId, c.viceChairId, ...c.memberIds]) {
        expect(memberIds.has(id)).toBe(true);
      }
    }
  });

  it("委員長と副委員長は委員に含まれ、別人である", () => {
    for (const c of MINAMATA_COMMITTEES) {
      expect(c.memberIds).toContain(c.chairId);
      expect(c.memberIds).toContain(c.viceChairId);
      expect(c.chairId).not.toBe(c.viceChairId);
    }
  });

  it("委員の選任日は YYYY-MM-DD で、委員会の設置日より前にならない", () => {
    for (const c of MINAMATA_COMMITTEES) {
      expect(c.membersAppointedOn).toMatch(DATE_PATTERN);
      if (c.validFrom !== null) {
        expect(c.membersAppointedOn >= c.validFrom).toBe(true);
      }
    }
  });

  it("委員が重複せず、定数を超えない", () => {
    for (const c of MINAMATA_COMMITTEES) {
      expect(new Set(c.memberIds).size).toBe(c.memberIds.length);
      if (c.capacityIsMax) {
        expect(c.memberIds.length).toBeLessThanOrEqual(c.capacity);
      } else {
        expect(c.memberIds.length).toBe(c.capacity);
      }
    }
  });

  it("全議員がちょうど1つの常任委員会に所属する", () => {
    const standing = MINAMATA_COMMITTEES.filter(
      (c) => c.committeeType === "常任"
    );
    for (const m of MINAMATA_MEMBERS) {
      const count = standing.filter((c) => c.memberIds.includes(m.id)).length;
      expect({ member: m.canonical, count }).toEqual({
        member: m.canonical,
        count: 1,
      });
    }
  });
});
