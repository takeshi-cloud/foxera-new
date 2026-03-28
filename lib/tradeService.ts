// =========================================
// tradeService.ts
// =========================================

import { supabase } from "@/lib/supabase";

export const insertTrade = async (data: any) => {
  const { error } = await supabase.from("trades").insert({
    ...data,
    created_at: new Date().toISOString(),
  });

  if (error && error.message) {
    console.error("insertTrade エラー:", error);
  }
};