
import { updateBoard, deleteBoard } from "./boardService";
import { supabase } from "@/lib/supabase";


// 待機に戻す
export const moveToWait = (item: any) => {
  return updateBoard(item.id, {
    timeframe_type: null,
    phase: null
  }, item);
};

// 短期へ
export const createShort = async (item: any) => {

  // ① すでに短期があるか確認
  const { data } = await supabase
    .from("board")
    .select("*")
    .eq("pair", item.pair)
    .eq("timeframe_type", "short");

  // ② あれば作らない
  if (data && data.length > 0) {
    console.log("すでに短期ある");
    return;
  }

  // ③ なければ作る
  await supabase.from("board").insert({
    pair: item.pair,
    timeframe_type: "short",
    direction: item.direction,
    phase: "Trend"
  });
};

// 方向切替
export const toggleDirection = (item: any) => {
  const newDir = item.direction === "long" ? "short" : "long";
  return updateBoard(item.id, { direction: newDir }, item);
};

// 削除
export const removeBoard = (id: string) => {
  return deleteBoard(id);
};


