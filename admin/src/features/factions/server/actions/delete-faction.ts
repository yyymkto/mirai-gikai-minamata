"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { routes } from "@/lib/routes";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import type { DeleteFactionInput } from "../../shared/types";

export async function deleteFaction(input: DeleteFactionInput) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("factions")
      .delete()
      .eq("id", input.id);

    if (error) {
      if (error.code === "PGRST116") {
        return { error: "会派が見つかりません" };
      }
      return { error: `会派の削除に失敗しました: ${error.message}` };
    }

    revalidatePath(routes.factions());
    await invalidateWebCache();

    return { success: true };
  } catch (error) {
    console.error("Delete faction error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "会派の削除中にエラーが発生しました" };
  }
}
