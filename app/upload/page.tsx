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
  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
  };

  // 🔥 ペア：ハイブリッド対応
  const [pair, setPair] = useState("USDJPY");
  const [isCustomPair, setIsCustomPair] = useState(false);

  const [timeframe, setTimeframe] = useState("1H");
  const [direction, setDirection] = useState("long");
  const [phase, setPhase] = useState("Trend");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const [isFull, setIsFull] = useState(false);

  const timeframeType =
    timeframe === "5M" || timeframe === "15M" ? "short" : "long";

  // =============================
  // 🔥 ログインチェック
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("ログインが必要です");
        router.push("/login");
        return;
      }

      const userId = user.id;

      if (!file) {
        alert("画像を選択してください");
        return;
      }

      const fileName = `${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file);

      if (uploadError) {
        alert("アップロード失敗");
        return;
      }

      const { data } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      const imageUrl = data.publicUrl;

      // screenshots 保存
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

      // board 取得
      const { data: existing } = await supabase
        .from("board")
        .select("*")
        .eq("pair", pair)
        .eq("timeframe_type", timeframeType)
        .maybeSingle();

      const shouldUpdate =
        !existing || new Date(date) >= new Date(existing.trade_date);

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

      // trades 保存
      const { error: tradeError } = await supabase.from("trades").insert({
        user_id: userId,
        pair,
        timeframe,
        timeframe_type: timeframeType,
        direction,
        phase,
        trade_date: date,
        image_url: imageUrl,
        note,
        created_at: new Date().toISOString(),
      });

      if (tradeError) {
        console.error("trades保存エラー:", tradeError);
        alert("trades保存失敗（screenshots と board は保存済み）");
      }

      alert("保存完了！");
      router.push("/");
    } catch (err) {
      console.error("全体エラー:", err);
      alert("不明エラー");
    }
  };

  // =============================
  // 🔹 Zoom & Pan states
  // =============================
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setOrigin({ x: offsetX, y: offsetY });

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPos({ x: e.clientX - start.x, y: e.clientY - start.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // =============================
  // 🔹 return JSX（完全統合）
  // =============================
  const pairOptions = ["USDJPY", "GBPJPY", "EURJPY", "GOLD", "NASDAQ"];

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

        {/* 🔥 ペア欄（ハイブリッド） */}
        {isCustomPair ? (
          <input
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            onBlur={() => {
              if (!pair.trim()) {
                setIsCustomPair(false);
                setPair("USDJPY");
              }
            }}
            placeholder="ペアを入力"
            style={selectStyle}
          />
        ) : (
          <select
            value={pair}
            onChange={(e) => {
              if (e.target.value === "__custom__") {
                setIsCustomPair(true);
                setPair("");
              } else {
                setPair(e.target.value);
              }
            }}
            style={selectStyle}
          >
            {pairOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value="__custom__">その他（自由入力）</option>
          </select>
        )}

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
      <div style={{ flex: 1, position: "relative", overflow: "auto" }}>
        {preview ? (
          <>
            {/* 削除ボタン */}
            <button
              onClick={handleRemoveImage}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 10,
                background: "rgba(0,0,0,0.6)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                fontSize: "18px",
                lineHeight: "32px",
                textAlign: "center",
              }}
            >
              ×
            </button>

            {/* 🔥 ズーム＆パン対応コンテナ */}
            <div
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                position: "relative",
                cursor: isDragging ? "grabbing" : "grab",
              }}
            >
              <div
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                  transformOrigin: `${origin.x}px ${origin.y}px`,
                  width: "100%",
                  height: "100%",
                }}
              >
                <img
                  src={preview!}
                  onClick={() => setIsFull(true)}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div style={previewBox}>Ctrl+Vで貼り付け</div>
        )}

        {/* 全画面表示 */}
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
// 🔹 Styles
// =============================
const uploadBox = {
  padding: "10px",
  background: "#1e293b",
  borderRadius: "6px",
  textAlign: "center",
  cursor: "pointer",
  border: "1px solid #334155",
} as const;

const selectStyle = {
  padding: "8px",
  background: "#1e293b",
  color: "white",
  borderRadius: "6px",
  border: "1px solid #334155",
};

const textareaStyle = {
  height: "80px",
  padding: "8px",
  background: "#1e293b",
  color: "white",
  borderRadius: "6px",
  border: "1px solid #334155",
};

const previewBox = {
  width: "100%",
  height: "100%",
  background: "#1e293b",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "6px",
  opacity: 0.6,
};

const saveBtn = {
  padding: "10px",
  background: "#16a34a",
  color: "white",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  marginTop: "8px",
};