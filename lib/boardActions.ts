// =========================================
// boardActions.ts（完全版）
// =========================================

import { supabase } from "@/lib/supabase";
import { updateBoard, deleteBoard } from "./boardService";
import { insertTrade } from "./tradeService";


// =========================================
// 🟥 WAIT移動（削除）
// =========================================
export const moveToWait = async (item: any) => {
  // 1. board から削除
  await deleteBoard(item.id);

  // 2. trades に「move_to_wait」として 1 回だけ記録
  await insertTrade({
  user_id: item.user_id,
  pair: item.pair,
  timeframe_type: item.timeframe_type,
  direction: item.direction,
  phase: "none",   // ← WAIT も none
  image_url: item.image_url,
  trade_date: item.trade_date,
  action: "move_to_wait",
});
};


// =========================================
// 🟦 LONG → SHORT
// =========================================
export const createShort = async (item: any) => {
  const { user_id, pair, direction, image_url, trade_date } = item;

  // ① すでに短期があるか確認
  const { data: exists } = await supabase
    .from("board")
    .select("id")
    .eq("pair", pair)
    .eq("timeframe_type", "short")
    .eq("user_id", user_id);

  if (exists && exists.length > 0) {
    console.log("すでに短期あり");
    return;
  }

  // ② SHORT を作成
  const { error } = await supabase.from("board").insert({
    user_id,
    pair,
    direction,
    phase: "Trend",
    timeframe_type: "short",
    image_url,
    trade_date,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("createShort エラー:", error);
    alert("短期ボード作成に失敗しました");
    return;
  }

  // ③ 🔥 trades にログを残す（これが抜けていた）
 await insertTrade({
  user_id,
  pair,
  timeframe_type: "short",
  direction,
  phase: item.phase,   // ← 元の LONG の phase をそのまま使う
  image_url,
  trade_date,
  action: "create_short",
});
};
// =========================================
// 🟩 方向切替
// =========================================
export const toggleDirection = async (item: any) => {
  const newDir = item.direction === "long" ? "short" : "long";

  await updateBoard(item.id, { direction: newDir }, item);
};


// =========================================
// 🟨 SHORT削除
// =========================================
export const removeBoard = async (item: any) => {
  // 1. board から削除
  await deleteBoard(item.id);

  // 2. trades に「delete_short」として記録
  await insertTrade({
  user_id: item.user_id,
  pair: item.pair,
  timeframe_type: item.timeframe_type,
  direction: item.direction,
  phase: "none",   // ← 削除は none
  image_url: item.image_url,
  trade_date: item.trade_date,
  action: "delete_short",
});
};