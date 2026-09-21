import { describe, expect, it } from "vitest";
import { shouldAutoCloseInterviewOnBillStatus } from "./should-auto-close-interview";

describe("shouldAutoCloseInterviewOnBillStatus", () => {
  it.each([
    ["approved"],
    ["adopted"],
    ["partially_adopted"],
  ] as const)("%s のときは true を返す", (status) => {
    expect(shouldAutoCloseInterviewOnBillStatus(status)).toBe(true);
  });

  it.each([
    ["preparing"],
    ["submitted"],
    ["in_committee"],
    ["plenary_session"],
    ["rejected"],
    ["reported"],
  ] as const)("%s のときは false を返す", (status) => {
    expect(shouldAutoCloseInterviewOnBillStatus(status)).toBe(false);
  });
});
