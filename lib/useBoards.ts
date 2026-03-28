"use client";

import { useState, useEffect } from "react";
import { fetchBoards } from "@/lib/boardService";
import { supabase } from "@/lib/supabase";

export const useBoards = () => {
  // =============================
  // 📦 board（監視中のカード）
  // =============================
  const [boards, setBoards] = useState<any[]>([]);

  // =============================
  // 📸 screenshots（履歴）
  // =============================
  const [shots, setShots] = useState<any[]>([]);

  // =============================
  // 🔄 board取得（最新順）
  // =============================
  const load = async () => {
    const data = await fetchBoards();

    // updated_at の新しい順に並べる
    const sorted = [...(data || [])].sort((a, b) => {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    setBoards(sorted);
  };

  useEffect(() => {
    load();
  }, []);

  // =============================
  // 🔄 screenshots取得（loadShotsとして独立）
  // =============================
  const loadShots = async () => {
    const { data, error } = await supabase
      .from("screenshots")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("screenshots error:", error);
      return;
    }

    setShots(data || []);
  };

  useEffect(() => {
    loadShots();
  }, []);

  // =============================
  // 🎯 スクショ存在判定
  // =============================
  const hasScreenshot = (pair: string, timeframeType: string) => {
    return shots.some(
      (s) =>
        s.pair === pair &&
        s.timeframe_type === timeframeType
    );
  };

  // =============================
  // 📤 外に渡す
  // =============================
  return {
    boards,
    load,
    shots,
    loadShots,   // ← 新しく追加（アップロード後に再取得できる）
    hasScreenshot,
  };
};