"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Upload() {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  // =============================
  // 🔹 state
  // =============================
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [pair, setPair] = useState("USDJPY");
  const [timeframe, setTimeframe] = useState("1H");
  const [direction, setDirection] = useState("long");
  const [phase, setPhase] = useState("Trend");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");

  const timeframeType =
    timeframe === "5M" || timeframe === "15M" ? "short" : "long";

  // =============================
  // 🔥 ログインチェック（アップロード専用）
  // =============================
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("ログインが必要です");
        router.push("/login");
      }
    };

    checkAuth();
  }, []);

  // =============================
  // 🔹 ファイル選択
  // =============================
  const handleFileChange = (e: any) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // =============================
  // 🔥 Ctrl+V貼り付け
  // =============================
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const f = e.clipboardData?.files[0];
      if (f) {
        setFile(f);
        setPreview(URL.createObjectURL(f));
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // =============================
  // 🔥 アップロード（完全版）
  // =============================
  const handleUpload = async () => {
    try {
      // -----------------------------
      // ① ログインユーザー取得
      // -----------------------------
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("ログインが必要です");
        router.push("/login");
        return;
      }

      const userId = user.id;

      // -----------------------------
      // ② ファイルチェック
      // -----------------------------
      if (!file) {
        alert("画像を選択してください");
        return;
      }

      const fileName = `${Date.now()}_${file.name}`;

      // -----------------------------
      // ③ Storage アップロード
      // -----------------------------
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file);

      if (uploadError) {
        alert("アップロード失敗");
        return;
      }

      // -----------------------------
      // ④ 公開URL取得
      // -----------------------------
      const { data } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      const imageUrl = data.publicUrl;

      // -----------------------------
      // ⑤ screenshots 保存
      // -----------------------------
      const { error: shotError } = await supabase.from("screenshots").insert({
        user_id: userId,
        pair,
        timeframe,
        timeframe_type: timeframeType,
        image_url: imageUrl,
        created_at: new Date(date).toISOString(),
        notes: note,
      });

      if (shotError) {
        console.error("スクショ保存エラー:", shotError);
        alert("スクショ保存失敗");
        return;
      }

      // -----------------------------
      // ⑥ board 取得
      // -----------------------------
      const { data: existing } = await supabase
        .from("board")
        .select("*")
        .eq("pair", pair)
        .eq("timeframe_type", timeframeType)
        .maybeSingle();

      const shouldUpdate =
        !existing || new Date(date) >= new Date(existing.trade_date);

      // -----------------------------
      // ⑦ board 更新（必要な場合のみ）
      // -----------------------------
      if (shouldUpdate) {
        const { error: boardError } = await supabase.from("board").upsert({
          user_id: userId,
          pair,
          direction,
          phase,
          image_url: imageUrl,
          trade_date: date,
          timeframe_type: timeframeType,
          updated_at: new Date().toISOString(),
        });

        if (boardError) {
          console.error("board更新エラー:", boardError);
          alert("board更新失敗（スクショは保存済み）");
        }
      }

      alert("保存完了！");
      router.push("/");
    } catch (err) {
      console.error("全体エラー:", err);
      alert("不明エラー");
    }
  };

  return (
    <div>
      {/* UI は省略（今のままでOK） */}
      <button onClick={handleUpload}>アップロード</button>
    </div>
  );
}