import { describe, expect, it } from "vitest";
import {
  type OpenDataBillRow,
  toOpenDataBillDetail,
  toOpenDataBillItem,
  toOpenDataFactionStances,
} from "./to-open-data-bill";

const baseRow: OpenDataBillRow = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "テスト議案",
  status: "in_committee",
  status_note: null,
  submitted_date: "2026-01-10",
  published_at: "2026-01-15T00:00:00+00:00",
  created_at: "2026-01-01T00:00:00+00:00",
  bill_contents: [{ title: "わかりやすいタイトル", summary: "概要" }],
  faction_stances: [
    {
      type: "conditional_for",
      comment: "条件付きで賛成",
      factions: { display_name: "会派A", sort_order: 1 },
    },
  ],
  bills_tags: [{ tags: { id: "tag-1", label: "経済" } }],
};

describe("toOpenDataBillItem", () => {
  it("議案行をAPIレスポンス形式に変換する", () => {
    expect(toOpenDataBillItem(baseRow)).toEqual({
      billId: "123e4567-e89b-12d3-a456-426614174000",
      name: "テスト議案",
      title: "わかりやすいタイトル",
      summary: "概要",
      status: "in_committee",
      statusLabel: "委員会審査中",
      statusNote: null,
      submittedDate: "2026-01-10",
      publishedAt: "2026-01-15T00:00:00+00:00",
      tags: [{ id: "tag-1", label: "経済" }],
      factionStances: [
        {
          factionName: "会派A",
          type: "conditional_for",
          label: "条件付き賛成",
          comment: "条件付きで賛成",
        },
      ],
      createdAt: "2026-01-01T00:00:00+00:00",
    });
  });

  it("賛否・タグがない場合は空配列を返す", () => {
    const item = toOpenDataBillItem({
      ...baseRow,
      faction_stances: [],
      bills_tags: [],
    });
    expect(item.factionStances).toEqual([]);
    expect(item.tags).toEqual([]);
  });

  it("タグの参照が欠けている場合は除外する", () => {
    const item = toOpenDataBillItem({
      ...baseRow,
      bills_tags: [{ tags: null }, { tags: { id: "tag-2", label: "環境" } }],
    });
    expect(item.tags).toEqual([{ id: "tag-2", label: "環境" }]);
  });
});

describe("toOpenDataBillDetail", () => {
  it("一覧項目に本文（content）を加えて返す", () => {
    const detail = toOpenDataBillDetail({
      ...baseRow,
      bill_contents: [
        { title: "タイトル", summary: "概要", content: "# 本文" },
      ],
    });
    expect(detail.title).toBe("タイトル");
    expect(detail.content).toBe("# 本文");
  });
});

describe("toOpenDataFactionStances", () => {
  it("賛否種別に日本語ラベルを付与し、会派の表示順に並べる", () => {
    expect(
      toOpenDataFactionStances([
        {
          type: "against",
          comment: null,
          factions: { display_name: "会派B", sort_order: 2 },
        },
        {
          type: "for",
          comment: "賛成理由",
          factions: { display_name: "会派A", sort_order: 1 },
        },
      ])
    ).toEqual([
      { factionName: "会派A", type: "for", label: "賛成", comment: "賛成理由" },
      { factionName: "会派B", type: "against", label: "反対", comment: null },
    ]);
  });

  it("会派の参照が欠けている行は除外する", () => {
    expect(
      toOpenDataFactionStances([{ type: "for", comment: null, factions: null }])
    ).toEqual([]);
  });
});
