import { describe, expect, it } from "vitest";
import {
  isDevRoute,
  isHtmlAcceptHeader,
  isOpenDataRoute,
  isValidDifficultyLevel,
  shouldApplyDifficultyCookie,
} from "./middleware";

describe("shouldApplyDifficultyCookie", () => {
  it("通常のページパスではtrueを返す", () => {
    expect(shouldApplyDifficultyCookie("/")).toBe(true);
    expect(shouldApplyDifficultyCookie("/bills/abc")).toBe(true);
  });

  it("APIパスではfalseを返す（レスポンスにSet-Cookieを乗せない）", () => {
    expect(shouldApplyDifficultyCookie("/api/open-data/bills")).toBe(false);
    expect(shouldApplyDifficultyCookie("/api/chat")).toBe(false);
  });
});

describe("isValidDifficultyLevel", () => {
  it("should return true for 'normal'", () => {
    expect(isValidDifficultyLevel("normal")).toBe(true);
  });

  it("should return true for 'hard'", () => {
    expect(isValidDifficultyLevel("hard")).toBe(true);
  });

  it("should return false for invalid value", () => {
    expect(isValidDifficultyLevel("easy")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isValidDifficultyLevel("")).toBe(false);
  });

  it("should return false for null", () => {
    expect(isValidDifficultyLevel(null)).toBe(false);
  });
});

describe("isHtmlAcceptHeader", () => {
  it("should return true for text/html", () => {
    expect(isHtmlAcceptHeader("text/html")).toBe(true);
  });

  it("should return true for accept header with text/html among others", () => {
    expect(
      isHtmlAcceptHeader(
        "text/html,application/xhtml+xml,application/xml;q=0.9"
      )
    ).toBe(true);
  });

  it("should return false for application/json", () => {
    expect(isHtmlAcceptHeader("application/json")).toBe(false);
  });

  it("should return false for image/png", () => {
    expect(isHtmlAcceptHeader("image/png")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isHtmlAcceptHeader("")).toBe(false);
  });
});

describe("isDevRoute", () => {
  it("/dev と /dev/ 配下は開発用ルートと判定する", () => {
    expect(isDevRoute("/dev")).toBe(true);
    expect(isDevRoute("/dev/preview")).toBe(true);
  });

  it("/developers など /dev で始まる通常ページは対象外", () => {
    expect(isDevRoute("/developers")).toBe(false);
    expect(isDevRoute("/developers/open-data-api")).toBe(false);
  });

  it("その他のパスは対象外", () => {
    expect(isDevRoute("/")).toBe(false);
    expect(isDevRoute("/terms")).toBe(false);
  });
});

describe("isOpenDataRoute", () => {
  it("オープンデータAPIと関連ページを対象にする", () => {
    expect(isOpenDataRoute("/api/open-data")).toBe(true);
    expect(isOpenDataRoute("/api/open-data/bills")).toBe(true);
    expect(isOpenDataRoute("/api/open-data/bills/abc")).toBe(true);
    expect(isOpenDataRoute("/openapi/open-data-api.json")).toBe(true);
    expect(isOpenDataRoute("/developers/open-data-api")).toBe(true);
    expect(isOpenDataRoute("/developers/interview-data-terms")).toBe(true);
  });

  it("開発者向けトップや他のページは対象外", () => {
    expect(isOpenDataRoute("/developers")).toBe(false);
    expect(isOpenDataRoute("/api/open-database")).toBe(false);
    expect(isOpenDataRoute("/bills")).toBe(false);
  });
});
