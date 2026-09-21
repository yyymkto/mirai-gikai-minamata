import { type NextRequest, NextResponse } from "next/server";
import { siteConfig } from "./config/site.config";
import {
  DIFFICULTY_COOKIE_NAME,
  DIFFICULTY_COOKIE_OPTIONS,
  type DifficultyLevelEnum,
} from "./features/bill-difficulty/shared/types";
import { isDifficultyLevel } from "./features/bill-difficulty/shared/utils/is-difficulty-level";
import {
  createUnauthorizedResponse,
  getBasicAuthConfig,
  validateBasicAuth,
} from "./lib/basic-auth";
import { updateSupabaseSession } from "./lib/supabase/middleware";

/**
 * 開発用プレビュー（/dev 配下）のルートか判定する。
 * 単純な startsWith("/dev") だと /developers 等の通常ページまで
 * 巻き込むため、完全一致か "/dev/" 配下のみを対象にする。
 */
export function isDevRoute(pathname: string): boolean {
  return pathname === "/dev" || pathname.startsWith("/dev/");
}

/**
 * オープンデータ関連（API・API仕様書・APIリファレンス・データ利用規約）のルートか判定する。
 * siteConfig.features.openData が false の間はこれらを404にする。
 */
export function isOpenDataRoute(pathname: string): boolean {
  return (
    pathname === "/api/open-data" ||
    pathname.startsWith("/api/open-data/") ||
    pathname.startsWith("/openapi/") ||
    pathname === "/developers/open-data-api" ||
    pathname === "/developers/interview-data-terms"
  );
}

export async function middleware(request: NextRequest) {
  if (
    !siteConfig.features.openData &&
    isOpenDataRoute(request.nextUrl.pathname)
  ) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  // /dev routes: 本番では404、開発ではauthスキップ
  if (isDevRoute(request.nextUrl.pathname)) {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }
    return NextResponse.next();
  }

  // Supabaseセッションをリフレッシュ（トークン期限切れ時に自動更新）
  const response = await updateSupabaseSession(request);

  // URLパラメータからdifficulty Cookieをセット
  _applyDifficultyCookie(request, response);

  const authConfig = getBasicAuthConfig();

  // Basic認証の設定がない場合はスキップ
  if (!authConfig) {
    return response;
  }

  // HTML ナビゲーションだけ認証（画像やJSON, css/js, fetch等は通す）
  if (!_isHtmlRequest(request)) return response;

  // Basic認証の検証
  if (validateBasicAuth(request, authConfig)) {
    return response;
  }

  return createUnauthorizedResponse();
}

/**
 * 有効な難易度レベルかチェック
 */
export function isValidDifficultyLevel(
  value: string | null
): value is DifficultyLevelEnum {
  return isDifficultyLevel(value);
}

/**
 * difficulty Cookie の付与対象パスか判定する。
 * オープンデータAPI等も difficulty クエリを受け取るため、APIレスポンスに
 * Set-Cookie が乗ってUIの表示設定を書き換えてしまわないよう除外する
 */
export function shouldApplyDifficultyCookie(pathname: string): boolean {
  return !pathname.startsWith("/api/");
}

/**
 * URLパラメータからdifficultyを取得し、レスポンスのCookieにセット
 */
function _applyDifficultyCookie(
  request: NextRequest,
  response: NextResponse
): void {
  if (!shouldApplyDifficultyCookie(request.nextUrl.pathname)) return;

  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get("difficulty");

  if (isValidDifficultyLevel(difficulty)) {
    response.cookies.set(
      DIFFICULTY_COOKIE_NAME,
      difficulty,
      DIFFICULTY_COOKIE_OPTIONS
    );
  }
}

export function isHtmlAcceptHeader(accept: string): boolean {
  return accept.includes("text/html");
}

function _isHtmlRequest(request: NextRequest) {
  const accept = request.headers.get("accept") || "";
  return isHtmlAcceptHeader(accept);
}

export const config = {
  matcher: [
    /*
     * _next/static, _next/image, favicon.ico, 画像ファイル等の
     * 静的アセットを除外し、ページリクエストのみでミドルウェアを実行する
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
