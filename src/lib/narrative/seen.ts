import { createClient } from "@/lib/supabase/client";
import type { NarrativeColumn } from "./script";

/**
 * Tandai sebuah checkpoint cerita sebagai "sudah dilihat" di profil siswa.
 * Dipakai untuk cutscene trigger "once" supaya tidak diulang.
 * Fire-and-forget: kegagalan update tidak boleh mengganggu alur main.
 */
export async function markSceneSeen(
  userId: string,
  column: NarrativeColumn,
): Promise<void> {
  try {
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ [column]: true })
      .eq("id", userId);
  } catch (error) {
    console.error(`markSceneSeen(${column}) gagal:`, error);
  }
}
