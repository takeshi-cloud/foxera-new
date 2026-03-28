
import { supabase } from "@/lib/supabase";
import { insertTrade } from "./tradeService";

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
  direction: string,
  oldData: any // ← 追加
) => {
  const { error } = await supabase
    .from("board")
    .update({
      direction,
      phase,
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  // 🔥 追加（履歴）
  await insertTrade({
    user_id: oldData.user_id,
    pair: oldData.pair,
    timeframe_type: oldData.timeframe_type,
    direction,
    phase,
    image_url: oldData.image_url,
    trade_date: oldData.trade_date,
    action: "update_phase",
  });
};