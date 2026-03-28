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
  const [isFull, setIsFull] = useState(false);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");

  const [pair, setPair] = useState("USDJPY");
  const [timeframe, setTimeframe] = useState("1H");
  const [direction, setDirection] = useState("long");
  const [phase, setPhase] = useState("Trend");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
  };

  const timeframeType =
    timeframe === "5M" || timeframe === "15M" ? "short" : "long";

  // =============================
  // 🔹 localStorage復元
  // =============================
  useEffect(() => {
    const saved = localStorage.getItem("uploadForm");
    if (saved) {
      const data = JSON.parse(saved);
      setPair(data.pair || "USDJPY");
      setTimeframe(data.timeframe || "1H");
      setDirection(data.direction || "long");
      setPhase(data.phase || "Trend");
    }
  }, []);

  // =============================
  // 🔹 localStorage保存
  // =============================
  useEffect(() => {
    localStorage.setItem(
      "uploadForm",
      JSON.stringify({ pair, timeframe, direction, phase })
    );
  }, [pair, timeframe, direction, phase]);

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
  // 🔹 アップロード（完全修正版）
  // =============================
  const handleUpload = async () => {
  try {
    if (!file) {
      alert("画像を選択してください");
      return;
    }

    // ① ファイル名生成
    const fileName = `${Date.now()}_${file.name}`;

    // ② Storageにアップロード
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      alert("アップロード失敗");
      return;
    }

    // ③ 公開URL取得
    const { data } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    const imageUrl = data.publicUrl;

    // ④ DBに保存
    const { error: insertError } = await supabase
      .from("screenshots")
      .insert([
        {
          image_url: imageUrl,
          pair: selectedPair,
          status: selectedStatus,
          created_at: new Date(),
        },
      ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      alert("DB保存失敗");
      return;
    }

    alert("アップロード成功🔥");
  } catch (err) {
    console.error(err);
    alert("エラー発生");
  }
};

      // =============================
      // 🔹 screenshots保存
      // =============================
      const { error: shotError } = await supabase.from("screenshots").insert({
        pair,
        timeframe,
        timeframe_type: timeframeType,
        image_url: imageUrl,
        created_at: new Date(date).toISOString(), // ← 修正済み
        notes:note,
      });

      if (shotError) {
        console.error("スクショ保存エラー:", shotError);
        alert("スクショ保存失敗");
        return;
      }

      // =============================
      // 🔹 board取得
      // =============================
      const { data: existing } = await supabase
        .from("board")
        .select("*")
        .eq("pair", pair)
        .eq("timeframe_type", timeframeType)
        .maybeSingle();

      const shouldUpdate =
        !existing || new Date(date) >= new Date(existing.trade_date);

      if (shouldUpdate) {
        const { error: boardError } = await supabase.from("board").upsert(
          {
            user_id: "temp-user",
            pair,
            direction,
            phase,
            image_url: imageUrl,
            trade_date: date,
            timeframe_type: timeframeType,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,pair,timeframe_type",
          }
        );

        if (boardError) {
          console.error("board更新エラー:", boardError);
          alert("board更新失敗（でもスクショは保存済み）");
        }
      }

      alert("保存完了！");
      router.push("/");
    } catch (err) {
      console.error("全体エラー:", err);
      alert("不明エラー");
    }
  };

  // =============================
  // 🔹 return JSX
  // =============================
  return (
    <div
      style={{
        background: "#0f172a",
        color: "white",
        height: "100vh",
        display: "flex",
        gap: "12px",
        overflow: "hidden",
      }}
    >
      {/* ミニフォーム */}
      <div
        style={{
          width: "220px",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          overflow: "auto",
        }}
      >
        <button
          onClick={() => router.push("/")}
          style={{
            marginBottom: "10px",
            padding: "6px",
            background: "#334155",
            color: "white",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          ← HOME
        </button>

        <label style={uploadBox}>
          {file ? file.name : "📂 or Ctrl+V"}
          <input type="file" onChange={handleFileChange} hidden />
        </label>

        <select
          value={pair}
          onChange={(e) => setPair(e.target.value)}
          style={selectStyle}
        >
          <option>USDJPY</option>
          <option>GBPJPY</option>
          <option>EURJPY</option>
          <option>GBPUSD</option>
          <option>EURUSD</option>
          <option>GOLD</option>
          <option>NASDAQ</option>
        </select>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          style={selectStyle}
        >
          <option>5M</option>
          <option>15M</option>
          <option>1H</option>
          <option>4H</option>
          <option>1D</option>
        </select>

        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          style={selectStyle}
        >
          <option value="long">LONG</option>
          <option value="short">SHORT</option>
        </select>

        <select
          value={phase}
          onChange={(e) => setPhase(e.target.value)}
          style={selectStyle}
        >
          <option>Reversal</option>
          <option>Trend</option>
          <option>Pullback</option>
          <option>Trigger</option>
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={selectStyle}
        />

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={textareaStyle}
        />

        <button onClick={handleUpload} style={saveBtn}>
          💾 保存
        </button>
      </div>

      {/* プレビュー画面 */}
      <div style={{ flex: 1, position: "relative" }}>
        {preview ? (
          <>
            <button
              onClick={handleRemoveImage}
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                zIndex: 10,
                background: "red",
                color: "white",
                padding: "6px",
                borderRadius: "6px",
                border: "none",
              }}
            >
              削除
            </button>

            <img
              src={preview}
              onClick={() => setIsFull(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: fitMode,
                background: "black",
                cursor: "zoom-in",
              }}
            />
          </>
        ) : (
          <div style={previewBox}>Ctrl+Vで貼り付け</div>
        )}

        {isFull && (
          <div
            onClick={() => setIsFull(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              cursor: "zoom-out",
            }}
          >
            <img
              src={preview!}
              style={{
                maxWidth: "95%",
                maxHeight: "95%",
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// =============================
// styles
// =============================
const uploadBox = {
  background: "#1e293b",
  border: "2px dashed #334155",
  borderRadius: "8px",
  padding: "10px",
  textAlign: "center" as const,
  cursor: "pointer",
};

const selectStyle = {
  background: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  borderRadius: "6px",
  padding: "6px",
};

const textareaStyle = {
  ...selectStyle,
  minHeight: "60px",
};

const saveBtn = {
  padding: "10px",
  background: "#16a34a",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
};

const previewBox = {
  width: "100%",
  height: "100%",
  background: "#1e293b",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0.6,
};