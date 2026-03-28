// =========================================
// boardActions.ts（完全修正版）
// =========================================

import { supabase } from "@/lib/supabase";
import { updateBoard, deleteBoard } from "./boardService";

// =========================================
// 🟥 LONG / SHORT → WAIT（監視終了 = 削除）
// =========================================
// WAIT は DB に保存しないので、削除が正しい
export const moveToWait = async (item: any) => {
  const { error } = await supabase
    .from("board")
    .delete()
    .eq("id", item.id);

  if (error) {
    console.error("moveToWait エラー:", error);
    alert("WAIT への移動に失敗しました");
  }

  // TODO: trades に「監視終了」の履歴を追加
};



// =========================================
// 🟦 LONG → SHORT（短期ボタン）
// =========================================
// SHORT は LONG の派生。direction を引き継ぐ。
// SHORT は WAIT と行き来しない。
export const createShort = async (item: any) => {
  const { user_id, pair, direction, image_url, trade_date } = item;
  // 🔥 trade_date ではなく trade_time を取り出す

  // ① すでに短期があるか確認
  const { data: exists } = await supabase
    .from("board")
    .select("id")
    .eq("pair", pair)
    .eq("timeframe_type", "short")
    .eq("user_id", user_id);

  if (exists && exists.length > 0) {
    console.log("すでに短期が存在するため作成しません");
    return;
  }

  // ② なければ作成
  const { error } = await supabase.from("board").upsert({
  user_id,
  pair,
  direction,
  phase: "Trend",
  timeframe_type: "short",
  image_url,
  trade_date, // ← 修正
  updated_at: new Date().toISOString(),
});

  if (error) {
    console.error("createShort エラー:", error);
    alert("短期ボード作成に失敗しました");
    console.log("user_id:", user_id);
  }
};


// =========================================
// 🟩 方向切替（LONG / SHORT 共通）
// =========================================
export const toggleDirection = async (item: any) => {
  const newDir = item.direction === "long" ? "short" : "long";

  const { error } = await supabase
    .from("board")
    .update({
      direction: newDir,
      updated_at: new Date().toISOString(),
    })
    .eq("id", item.id);

  if (error) {
    console.error("toggleDirection エラー:", error);
    alert("方向切り替えに失敗しました");
  }

  // TODO: trades に「方向切替」の履歴を追加
};



// =========================================
// 🟨 SHORT の × ボタン（削除）
// =========================================
export const removeBoard = async (id: string) => {
  const { error } = await supabase.from("board").delete().eq("id", id);

  if (error) {
    console.error("removeBoard エラー:", error);
    alert("カード削除に失敗しました");
  }

  // TODO: trades に「短期削除」の履歴を追加
};