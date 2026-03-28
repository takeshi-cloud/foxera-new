
import { supabase } from "@/lib/supabase";

// ① 取得
export const getBoard = async (userId: string) => {
  const { data, error } = await supabase
    .from("board")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
};

// ② フェーズ更新（DnD用）
export const updateBoardPhase = async (
  id: string,
  phase: string,
  direction: string
) => {
  const { error } = await supabase
    .from("board")
    .update({
      direction,
      phase: phase, // ← 修正
    })
    .eq("id", id);

  if (error) console.error(error);
};

// ③ 追加（初回用）
export const insertBoard = async (data: any) => {
  const { error } = await supabase
    .from("board")
    .insert(data);

  if (error) console.error(error);
};
