import { describe, expect, it } from "vitest";
import type { BillStatusEnum } from "../types";
import {
  countByStatusGroup,
  filterByStatusGroup,
  isBillStatusGroup,
  toBillStatusGroup,
} from "./bill-status-group";

const bill = (status: BillStatusEnum) => ({ status });

describe("toBillStatusGroup", () => {
  it("委員会・本会議の審議中は「審議中」に畳む", () => {
    expect(toBillStatusGroup("in_committee")).toBe("deliberating");
    expect(toBillStatusGroup("plenary_session")).toBe("deliberating");
  });

  // 既存の getCardStatusLabel が submitted を「議会審議中」に含めるため、
  // ここで「審議待ち」に落とすとバッジとタブが食い違う。
  it("上程済みは既存バッジに合わせて「審議中」に含める", () => {
    expect(toBillStatusGroup("submitted")).toBe("deliberating");
  });

  it("上程前だけが「審議待ち」になる", () => {
    expect(toBillStatusGroup("preparing")).toBe("waiting");
  });

  it("可決・採択・趣旨採択は「可決・採択」に畳む", () => {
    expect(toBillStatusGroup("approved")).toBe("approved");
    expect(toBillStatusGroup("adopted")).toBe("approved");
    expect(toBillStatusGroup("partially_adopted")).toBe("approved");
  });

  it("否決と報告はそのまま", () => {
    expect(toBillStatusGroup("rejected")).toBe("rejected");
    expect(toBillStatusGroup("reported")).toBe("reported");
  });
});

describe("isBillStatusGroup", () => {
  it("既知のグループだけ通す", () => {
    expect(isBillStatusGroup("all")).toBe(true);
    expect(isBillStatusGroup("deliberating")).toBe(true);
  });

  it("未知の値は弾く", () => {
    expect(isBillStatusGroup("submitted")).toBe(false);
    expect(isBillStatusGroup(undefined)).toBe(false);
    expect(isBillStatusGroup(3)).toBe(false);
  });
});

describe("countByStatusGroup", () => {
  it("グループごとに数え、all は総数にする", () => {
    const counts = countByStatusGroup([
      bill("in_committee"),
      bill("plenary_session"),
      bill("submitted"),
      bill("preparing"),
      bill("approved"),
      bill("adopted"),
      bill("rejected"),
      bill("reported"),
    ]);

    expect(counts).toEqual({
      all: 8,
      deliberating: 3,
      waiting: 1,
      approved: 2,
      rejected: 1,
      reported: 1,
    });
  });

  it("空なら全て0", () => {
    expect(countByStatusGroup([])).toEqual({
      all: 0,
      deliberating: 0,
      waiting: 0,
      approved: 0,
      rejected: 0,
      reported: 0,
    });
  });
});

describe("filterByStatusGroup", () => {
  const bills = [bill("in_committee"), bill("approved"), bill("preparing")];

  it("all は素通しする", () => {
    expect(filterByStatusGroup(bills, "all")).toHaveLength(3);
  });

  it("指定グループだけ残す", () => {
    expect(filterByStatusGroup(bills, "approved")).toEqual([bill("approved")]);
  });

  it("該当が無ければ空", () => {
    expect(filterByStatusGroup(bills, "rejected")).toEqual([]);
  });

  it("元の配列を壊さない", () => {
    const input = [bill("approved")];
    filterByStatusGroup(input, "all").push(bill("rejected"));
    expect(input).toHaveLength(1);
  });
});
