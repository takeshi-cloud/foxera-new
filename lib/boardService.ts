// =========================================
// boardService.ts（完全版）
// =========================================

import { supabase } from "@/lib/supabase";
import { insertTrade } from "./tradeService";

// =========================================
// 🟥 取得
// =========================================
export const fetchBoards = async () => {
  const { data, error } = await supabase.from("board").select("*");

  if (error) {
    console.error("fetchBoards エラー:", error);
    return [];
  }

  return data || [];
};

// =========================================
// 🟦 更新（すべてここ）
// =========================================
export const updateBoard = async (id: string, updates: any, oldData: any) => {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("board")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("updateBoard エラー:", error);
    alert("ボード更新に失敗しました");
    return;
  }

  // 🔥 履歴保存
  await insertTrade({
    user_id: oldData.user_id,
    pair: oldData.pair,
    timeframe_type: oldData.timeframe_type,
    direction: updates.direction ?? oldData.direction,
    phase: updates.phase ?? oldData.phase,
    image_url: updates.image_url ?? oldData.image_url,
    trade_date: updates.trade_date ?? oldData.trade_date,
    action: "update_board",
  });
};

// =========================================
// 🟦 方向切替（service側にまとめる）
// =========================================
export const toggleDirection = async (item: any) => {
  const newDir = item.direction === "long" ? "short" : "long";

  await updateBoard(
    item.id,
    { direction: newDir },
    item
  );
};

// =========================================
// 🟨 削除（WAIT移動）
// =========================================
export const deleteBoard = async (id: string) => {
  const { error } = await supabase.from("board").delete().eq("id", id);

  if (error) {
    console.error("deleteBoard エラー:", error);
    alert("ボード削除に失敗しました");
    return;
  }
};

// =========================================
// 🟩 追加（WAIT → LONG）
// =========================================
export const insertBoard = async (pair: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("ログインが必要です");
    return;
  }

  const userId = user.id;

  const payload = {
    user_id: userId,
    pair,
    direction: "long",
    phase: "Reversal",
    timeframe_type: "long",
    trade_date: new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("board").insert(payload);

  if (error) {
    console.error("insertBoard エラー:", error);
    alert("ボード作成に失敗しました");
    return;
  }

  // 🔥 履歴保存
  await insertTrade({
    user_id: userId,
    pair,
    timeframe_type: "long",
    direction: "long",
    phase: "Reversal",
    trade_date: payload.trade_date,
    action: "create_long",
  });
};