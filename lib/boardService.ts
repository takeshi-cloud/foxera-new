// =========================================
// boardService.ts（完全修正版）
// =========================================

import { supabase } from "@/lib/supabase";
import { insertTrade } from "@/lib/tradeService";

// =========================================
// 🟥 取得（そのままでOK）
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
// 🟦 更新（LONG / SHORT の更新すべて）
// =========================================
// ・フェーズ移動
// ・方向切替
// ・画像更新
// ・trade_date 更新
// など、監視中カードの更新は全部ここ
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
  }

  // TODO: trades に履歴を残す（oldData → updates）
};



// =========================================
// 🟨 削除（LONG → WAIT、SHORT の ×）
// =========================================
export const deleteBoard = async (id: string) => {
  const { error } = await supabase.from("board").delete().eq("id", id);

  if (error) {
    console.error("deleteBoard エラー:", error);
    alert("ボード削除に失敗しました");
  }

  // TODO: trades に「削除」の履歴を追加
};



// =========================================
// 🟩 追加（WAIT → LONG のときのみ）
// =========================================
// WAIT は DB に保存しないので、
// insertBoard は「LONG の初期カードを作る」ためだけに存在する。
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
  }
};