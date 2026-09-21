import type { BillStatusEnum } from "../types";

/**
 * 議案一覧のステータス絞り込みで使うグループ。
 *
 * DB の status は9値（preparing / submitted / in_committee / plenary_session /
 * approved / rejected / adopted / partially_adopted / reported）だが、
 * 一覧のタブは審議の段階ごとに束ねる。委員会・本会議の区別は絞り込みの軸としては
 * 細かすぎるため、まとめて「審議中」にする。
 */
export const BILL_STATUS_GROUPS = [
  "all",
  "deliberating",
  "waiting",
  "approved",
  "rejected",
  "reported",
] as const;

export type BillStatusGroup = (typeof BILL_STATUS_GROUPS)[number];

export const BILL_STATUS_GROUP_LABELS: Record<BillStatusGroup, string> = {
  all: "すべて",
  deliberating: "審議中",
  waiting: "審議待ち",
  approved: "可決・採択",
  rejected: "否決",
  reported: "報告",
};

/**
 * status をタブのグループに畳む。
 *
 * 既存の `getCardStatusLabel` と同じ畳み方にする（請願の採択・趣旨採択は可決と同じ扱い）。
 * あちらは `submitted` を
 * 「議会審議中」に含めるので、ここで「審議待ち」に落とすと、カードに
 * 「議会審議中」と出ている議案が「審議中」タブに現れない。
 *
 * 結果として「審議待ち」に残るのは `preparing`（上程前）だけになる。
 * 請願の採択・趣旨採択は、議決で結論が出たものとして可決と同じグループにする。
 */
export function toBillStatusGroup(
  status: BillStatusEnum
): Exclude<BillStatusGroup, "all"> {
  switch (status) {
    case "submitted":
    case "in_committee":
    case "plenary_session":
      return "deliberating";
    case "approved":
    case "adopted":
    case "partially_adopted":
      return "approved";
    case "rejected":
      return "rejected";
    case "reported":
      return "reported";
    case "preparing":
      return "waiting";
    default: {
      // ステータスが増えたら型エラーで気付けるようにする
      const unreachable: never = status;
      return unreachable;
    }
  }
}

/** 文字列をグループに絞り込む型ガード。URL 直打ちで壊れないようにする。 */
export function isBillStatusGroup(value: unknown): value is BillStatusGroup {
  return (
    typeof value === "string" &&
    (BILL_STATUS_GROUPS as readonly string[]).includes(value)
  );
}

/** グループごとの件数。呼び出し側が渡した母集合をそのまま数える。 */
export function countByStatusGroup(
  bills: readonly { status: BillStatusEnum }[]
): Record<BillStatusGroup, number> {
  const counts: Record<BillStatusGroup, number> = {
    all: bills.length,
    deliberating: 0,
    waiting: 0,
    approved: 0,
    rejected: 0,
    reported: 0,
  };
  for (const bill of bills) {
    counts[toBillStatusGroup(bill.status)] += 1;
  }
  return counts;
}

/** グループで絞る。`all` は素通し。 */
export function filterByStatusGroup<T extends { status: BillStatusEnum }>(
  bills: readonly T[],
  group: BillStatusGroup
): T[] {
  if (group === "all") return [...bills];
  return bills.filter((bill) => toBillStatusGroup(bill.status) === group);
}
