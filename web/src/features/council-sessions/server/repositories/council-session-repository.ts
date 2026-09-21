import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import type { CouncilSession } from "../../shared/types";

/**
 * アクティブな定例会を取得
 */
export async function findActiveCouncilSession(): Promise<CouncilSession | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("council_sessions")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch active council session:", error);
    return null;
  }

  return data;
}

/**
 * 指定日時点で開催中の定例会を取得
 */
export async function findCurrentCouncilSession(
  targetDate: string
): Promise<CouncilSession | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("council_sessions")
    .select("*")
    .lte("start_date", targetDate)
    .or(`end_date.gte.${targetDate},end_date.is.null`)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch current council session:", error);
    return null;
  }

  return data;
}

/**
 * 全定例会を開始日の降順で取得
 */
export async function findAllCouncilSessions(): Promise<CouncilSession[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("council_sessions")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Failed to fetch all council sessions:", error);
    return [];
  }

  return data ?? [];
}

/**
 * 指定日より前の直近の定例会を取得
 */
export async function findPreviousCouncilSession(
  beforeStartDate: string
): Promise<CouncilSession | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("council_sessions")
    .select("*")
    .lt("start_date", beforeStartDate)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch previous council session:", error);
    return null;
  }

  return data;
}

/**
 * 指定日より前に閉会した直近の定例会を取得
 *
 * 閉会中のトップページで「どの定例会が終わったか」を出すために使う。
 * `findPreviousCouncilSession` はアクティブな定例会の開始日を基準に「その前」を返すので、
 * 閉会中（アクティブな定例会が無い、または日付が範囲外）の用途には合わない。
 */
export async function findLatestClosedCouncilSession(
  onDate: string
): Promise<CouncilSession | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("council_sessions")
    .select("*")
    .lt("end_date", onDate)
    .order("end_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // 他の取得関数と同じく、失敗はカードを出さないだけに留める。
    console.error("Failed to fetch latest closed council session:", error);
    return null;
  }

  return data;
}
