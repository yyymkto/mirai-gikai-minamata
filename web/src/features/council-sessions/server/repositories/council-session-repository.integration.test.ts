import {
  cleanupTestCouncilSession,
  createTestCouncilSession,
} from "@test-utils/utils";
import { afterEach, describe, expect, it } from "vitest";
import { findLatestClosedCouncilSession } from "./council-session-repository";

describe("council-session-repository 統合テスト", () => {
  const sessionIds: string[] = [];

  afterEach(async () => {
    for (const id of sessionIds) {
      await cleanupTestCouncilSession(id);
    }
    sessionIds.length = 0;
  });

  describe("findLatestClosedCouncilSession", () => {
    // findPreviousCouncilSession はアクティブな定例会を起点にするため、閉会中は
    // ひとつ古い定例会を返してしまう。こちらは end_date で直近の閉会を引く。
    it("指定日より前に閉会した直近の定例会を返す", async () => {
      const older = await createTestCouncilSession({
        start_date: "2027-01-01",
        end_date: "2027-03-31",
        is_active: false,
      });
      const latest = await createTestCouncilSession({
        start_date: "2027-04-01",
        end_date: "2027-06-30",
        is_active: false,
      });
      sessionIds.push(older.id, latest.id);

      const result = await findLatestClosedCouncilSession("2027-08-01");

      expect(result?.id).toBe(latest.id);
    });

    it("まだ閉会していない定例会は返さない", async () => {
      const ongoing = await createTestCouncilSession({
        start_date: "2027-09-01",
        end_date: "2027-12-31",
        is_active: true,
      });
      sessionIds.push(ongoing.id);

      const result = await findLatestClosedCouncilSession("2027-10-01");

      expect(result?.id).not.toBe(ongoing.id);
    });

    // 閉会日当日はまだ会期中として扱う（lt で比較している）。
    it("指定日がちょうど閉会日の定例会は返さない", async () => {
      const closingToday = await createTestCouncilSession({
        start_date: "2027-09-01",
        end_date: "2027-10-01",
        is_active: false,
      });
      sessionIds.push(closingToday.id);

      const result = await findLatestClosedCouncilSession("2027-10-01");

      expect(result?.id).not.toBe(closingToday.id);
      const next = await findLatestClosedCouncilSession("2027-10-02");
      expect(next?.id).toBe(closingToday.id);
    });

    it("閉会日が未定の定例会は返さない", async () => {
      const undecided = await createTestCouncilSession({
        start_date: "2027-09-01",
        end_date: null,
        is_active: false,
      });
      sessionIds.push(undecided.id);

      const result = await findLatestClosedCouncilSession("2027-10-01");

      expect(result?.id).not.toBe(undecided.id);
    });
  });
});
