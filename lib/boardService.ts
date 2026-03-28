
import { supabase } from "@/lib/supabase";

// ===== 取得 =====
export const fetchBoards = async () => {
  const { data } = await supabase.from("board").select("*");
  return data || [];
};

// ===== 更新（中核）=====
export const updateBoard = async (id: string, updates: any, oldData: any) => {
  // 履歴保存
 
  // 本体更新
  await supabase
    .from("board")
    .update(updates)
    .eq("id", id);
};

// ===== 削除 =====
export const deleteBoard = async (id: string) => {
  await supabase.from("board").delete().eq("id", id);
};

// ===== 追加（待機のみOK）=====
export const insertBoard = async (pair: string) => {
  await supabase.from("board").insert({
    pair,
    direction: "long",
    phase: null,
    timeframe_type: null
  });
};