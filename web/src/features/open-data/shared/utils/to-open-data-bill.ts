import {
  type BillStatusEnum,
  getBillStatusLabel,
  STANCE_LABELS,
  type StanceTypeEnum,
} from "@/features/bills/shared/types";
import type {
  OpenDataBillDetail,
  OpenDataBillItem,
  OpenDataFactionStance,
} from "../types/open-data-bills";

export type OpenDataFactionStanceRow = {
  type: StanceTypeEnum;
  comment: string | null;
  factions: { display_name: string; sort_order: number } | null;
};

export type OpenDataBillRow = {
  id: string;
  name: string;
  status: BillStatusEnum;
  status_note: string | null;
  submitted_date: string | null;
  published_at: string | null;
  created_at: string;
  /** 難易度で絞り込み済みのため実質1件 */
  bill_contents: { title: string; summary: string }[];
  faction_stances: OpenDataFactionStanceRow[];
  bills_tags: { tags: { id: string; label: string } | null }[];
};

/**
 * DBの議案行をオープンデータAPIのレスポンス項目に変換する。
 */
export function toOpenDataBillItem(row: OpenDataBillRow): OpenDataBillItem {
  const billContent = row.bill_contents[0];
  return {
    billId: row.id,
    name: row.name,
    title: billContent?.title ?? "",
    summary: billContent?.summary ?? "",
    status: row.status,
    statusLabel: getBillStatusLabel(row.status),
    statusNote: row.status_note,
    submittedDate: row.submitted_date,
    publishedAt: row.published_at,
    tags: row.bills_tags.flatMap((billTag) =>
      billTag.tags ? [{ id: billTag.tags.id, label: billTag.tags.label }] : []
    ),
    factionStances: toOpenDataFactionStances(row.faction_stances),
    createdAt: row.created_at,
  };
}

export type OpenDataBillDetailRow = Omit<OpenDataBillRow, "bill_contents"> & {
  bill_contents: { title: string; summary: string; content: string }[];
};

/**
 * DBの議案行（本文付き）をオープンデータAPIの詳細レスポンスに変換する。
 */
export function toOpenDataBillDetail(
  row: OpenDataBillDetailRow
): OpenDataBillDetail {
  return {
    ...toOpenDataBillItem(row),
    content: row.bill_contents[0]?.content ?? "",
  };
}

/**
 * 会派ごとの賛否行をレスポンス形式（日本語ラベル付き・会派の表示順）に変換する。
 * 会派の参照が欠けている行は除外する。
 */
export function toOpenDataFactionStances(
  stances: OpenDataFactionStanceRow[]
): OpenDataFactionStance[] {
  return stances
    .flatMap((stance) =>
      stance.factions ? [{ ...stance, faction: stance.factions }] : []
    )
    .sort(
      (a, b) =>
        a.faction.sort_order - b.faction.sort_order ||
        a.faction.display_name.localeCompare(b.faction.display_name, "ja")
    )
    .map((stance) => ({
      factionName: stance.faction.display_name,
      type: stance.type,
      label: STANCE_LABELS[stance.type],
      comment: stance.comment,
    }));
}
