import type { BillUpdateInput } from "../types";

/** 議決により結論が出たとみなすステータス（本家の「成立 (enacted)」に相当）。 */
const AUTO_CLOSE_STATUSES: ReadonlySet<BillUpdateInput["status"]> = new Set([
  "approved",
  "adopted",
  "partially_adopted",
]);

/**
 * 議案のステータス変更時に、関連する公開中インタビューを自動クローズすべきかを判定する。
 * 可決・採択・一部採択のときのみ対象（否決では閉じない）。
 */
export function shouldAutoCloseInterviewOnBillStatus(
  status: BillUpdateInput["status"]
): boolean {
  return AUTO_CLOSE_STATUSES.has(status);
}
