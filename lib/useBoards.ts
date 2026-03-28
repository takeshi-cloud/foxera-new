"use client";

import { useState, useEffect } from "react";
import { fetchBoards } from "@/lib/boardService";
import { supabase } from "@/lib/supabase";

export const useBoards = () => {
  // =============================
  // 📦 board（UI用）
  // =============================
  const [boards, setBoards] = useState<any[]>([]);

  // =============================
  // 📸 screenshots（履歴）
  // =============================
  const [shots, setShots] = useState<any[]>([]);

  // =============================
  // 🔄 board取得
  // =============================
  const load = async () => {
    const data = await fetchBoards();
    setBoards(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  // =============================
  // 🔄 screenshots取得
  // =============================
  useEffect(() => {
    const fetchShots = async () => {
      const { data, error } = await supabase
        .from("screenshots")
        .select("*");

      if (error) {
        console.error("screenshots error:", error);
        return;
      }

      setShots(data || []);
    };

    fetchShots();
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
    hasScreenshot, // ←これ追加
  };
};