"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";


type Screenshot = {
  id: string;
  pair: string;
  timeframe: string;
  timeframe_type: string;
  image_url: string;
  created_at: string;
  notes?: string;
};

export default function History() {
  const router = useRouter();
  const params = useSearchParams();
  const initialShotId = params.get("shot_id");

  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 編集フォーム
  const [forms, setForms] = useState<any>({});

  // ペア選択肢（＋ユーザー追加）
  const defaultPairs = [
    "USDJPY",
    "GBPJPY",
    "EURJPY",
    "GBPUSD",
    "EURUSD",
    "GOLD",
    "NASDAQ",
  ];
  const [pairOptions, setPairOptions] = useState(defaultPairs);
  const [addingPair, setAddingPair] = useState(false);
  const [newPair, setNewPair] = useState("");

  // フィルター
  const [pairFilter, setPairFilter] = useState("ALL");
  const [tfFilter, setTfFilter] = useState("ALL");
  const [tfTypeFilter, setTfTypeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [rangeFilter, setRangeFilter] = useState("ALL");

  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  useEffect(() => {
    fetchScreenshots();
  }, []);

  const fetchScreenshots = async () => {
    const { data } = await supabase
      .from("screenshots")
      .select("*")
      .order("created_at", { ascending: false });

    const list = (data || []) as Screenshot[];
    setScreenshots(list);

    const f: any = {};
    list.forEach((s) => {
      f[s.id] = {
        pair: s.pair,
        timeframe: s.timeframe,
        timeframe_type: s.timeframe_type,
        date: s.created_at.split("T")[0],
        notes: s.notes || "",
        image_url: s.image_url,
        isCustomPair: false,
      };
    });
    setForms(f);

    if (initialShotId) {
      const idx = list.findIndex((s) => s.id === initialShotId);
      if (idx >= 0) setSelectedIndex(idx);
    }
  };

  const updateField = (id: string, key: string, value: string | boolean) => {
  setForms((prev) => ({
    ...prev,
    [id]: { ...prev[id], [key]: value },
  }));
};
  const handleUpdate = async (s: Screenshot) => {
    const f = forms[s.id];

    await supabase
      .from("screenshots")
      .update({
        pair: f.pair,
        timeframe: f.timeframe,
        timeframe_type: f.timeframe_type,
        notes: f.notes,
        created_at: new Date(f.date).toISOString(),
      })
      .eq("id", s.id);

    await supabase.from("trades").insert({
      pair: f.pair,
      timeframe: f.timeframe,
      timeframe_type: f.timeframe_type,
      direction: "unknown",
      phase: "unknown",
      note: f.notes,
      trade_date: f.date,
      image_url: f.image_url,
      created_at: new Date().toISOString(),
    });

    alert("更新しました");
  };

  const handleDelete = async (s: Screenshot) => {
    await supabase.from("screenshots").delete().eq("id", s.id);
    alert("削除しました");
    fetchScreenshots();
  };

  const handleReplaceImage = async (e: any, s: Screenshot) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${Date.now()}_${file.name}`;
    await supabase.storage.from("images").upload(fileName, file);

    const { data } = supabase.storage.from("images").getPublicUrl(fileName);
    const newUrl = data.publicUrl;

    updateField(s.id, "image_url", newUrl);

    await supabase.from("trades").insert({
      pair: forms[s.id].pair,
      timeframe: forms[s.id].timeframe,
      timeframe_type: forms[s.id].timeframe_type,
      direction: "unknown",
      phase: "unknown",
      note: forms[s.id].notes,
      trade_date: forms[s.id].date,
      image_url: newUrl,
      created_at: new Date().toISOString(),
    });

    alert("画像を変更しました");
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
  };

  const formatDate = (iso: string) => iso?.split("T")[0] || "";
  const formatTime = (iso: string) => (iso?.split("T")[1] || "").slice(0, 5);

  const filtered = screenshots.filter((s) => {
    const date = s.created_at.split("T")[0];

    const pairOk = pairFilter === "ALL" || s.pair === pairFilter;
    const tfOk = tfFilter === "ALL" || s.timeframe === tfFilter;
    const tfTypeOk = tfTypeFilter === "ALL" || s.timeframe_type === tfTypeFilter;
    const dateOk = dateFilter === "ALL" || date === dateFilter;

    let rangeOk = true;
    if (rangeFilter !== "ALL") {
      const days = Number(rangeFilter);
      const now = new Date();
      const created = new Date(s.created_at);
      const diff =
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      rangeOk = diff <= days;
    }

    return pairOk && tfOk && tfTypeOk && dateOk && rangeOk;
  });

  const pairs = Array.from(new Set(screenshots.map((s) => s.pair)));
  const timeframes = Array.from(new Set(screenshots.map((s) => s.timeframe)));
  const dates = Array.from(
    new Set(screenshots.map((s) => s.created_at.split("T")[0]))
  );

  // ============================
  // 🔥 UI（HOME + フィルター + プレビュー）
  // ============================
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "10px",
        boxSizing: "border-box",
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* 🔹 上部：HOME + フィルター + プレビュー */}
      <div
        style={{
          display: "flex",
          marginBottom: "12px",
          alignItems: "flex-start",
        }}
      >
        {/* 左：HOME + フィルター */}
        <div style={{ flex: 1 }}>
          {/* HOME ボタン */}
          <div style={{ marginBottom: "12px" }}>
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "10px 16px",
                background: "#334155",
                color: "white",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "bold",
              }}
            >
              ← HOME
            </button>
          </div>

          {/* 🔥 巨大フィルターバー */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              padding: "12px",
              background: "#1e293b",
              borderRadius: "8px",
              border: "1px solid #334155",
            }}
          >
            <select
              value={pairFilter}
              onChange={(e) => setPairFilter(e.target.value)}
              style={bigSelect}
            >
              <option value="ALL">ペア：すべて</option>
              {pairOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              value={tfFilter}
              onChange={(e) => setTfFilter(e.target.value)}
              style={bigSelect}
            >
              <option value="ALL">TF：すべて</option>
              {timeframes.map((tf) => (
                <option key={tf} value={tf}>
                  {tf}
                </option>
              ))}
            </select>

            <select
              value={tfTypeFilter}
              onChange={(e) => setTfTypeFilter(e.target.value)}
              style={bigSelect}
            >
              <option value="ALL">TF_type：すべて</option>
              <option value="long">long</option>
              <option value="short">short</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={bigSelect}
            >
              <option value="ALL">日付：すべて</option>
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={rangeFilter}
              onChange={(e) => setRangeFilter(e.target.value)}
              style={bigSelect}
            >
              <option value="ALL">期間：すべて</option>
              <option value="7">直近7日</option>
              <option value="30">直近30日</option>
              <option value="90">直近90日</option>
            </select>
          </div>

          {/* 説明文 */}
          <div
            style={{
              marginTop: "8px",
              marginBottom: "8px",
              fontSize: "12px",
              opacity: 0.8,
              paddingLeft: "4px",
            }}
          >
            TF_type: 5M, 15M ⇒ short（短期）　/　1H, 4H, 1D ⇒ long（長期）
          </div>
        </div>

        {/* 🔹 右：プレビュー */}
        <div
          style={{
            width: "260px",
            height: "160px",
            marginLeft: "12px",
            border: "1px solid #1e293b",
            borderRadius: "6px",
            background: "#020617",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {screenshots[selectedIndex] ? (
            <img
              src={forms[screenshots[selectedIndex].id]?.image_url}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <div style={{ opacity: 0.5, fontSize: "12px" }}>
              選択してください
            </div>
          )}
        </div>
      </div>

      {/* 🔹 下部：表（選択式 UI） */}
      <div
        style={{
          flex: 1,
          border: "1px solid #1e293b",
          borderRadius: "6px",
          overflow: "auto",
          background: "#020617",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <colgroup>
            <col style={{ width: "60px" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "70px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "200px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "70px" }} />
          </colgroup>

          <thead>
            <tr
              style={{
                background: "#111827",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              <th style={thStyle}>削除</th>
              <th style={thStyle}>日付</th>
              <th style={thStyle}>時間</th>
              <th style={thStyle}>ペア</th>
              <th style={thStyle}>TF</th>
              <th style={thStyle}>TF_type</th>
              <th style={thStyle}>NOTES</th>
              <th style={thStyle}>画像変更</th>
              <th style={thStyle}>更新</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((s, idx) => {
              const f = forms[s.id];
              const isSelected = idx === selectedIndex;

              return (
                <tr
  key={s.id}
  ref={(el) => { rowRefs.current[idx] = el; }}
  onClick={() => setSelectedIndex(idx)}
  style={{
    background: isSelected ? "#4a4f63" : "transparent",
    color: isSelected ? "white" : "inherit",
    cursor: "pointer",
  }}
>

                  {/* 削除 */}
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleDelete(s)}
                      style={{
                        padding: "4px 6px",
                        fontSize: "11px",
                        borderRadius: "4px",
                        border: "none",
                        background: "#ef4444",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      削除
                    </button>
                  </td>

                  {/* 日付 */}
                  <td style={tdStyle}>
                    <input
                      type="date"
                      value={f.date}
                      onChange={(e) =>
                        updateField(s.id, "date", e.target.value)
                      }
                      style={{ width: "100%" }}
                    />
                  </td>

                  {/* 時間 */}
                  <td style={tdStyle}>{formatTime(s.created_at)}</td>

                  {/* ペア（選択式 + 新規追加） */}
                  {/* ペア（選択＋自由入力ハイブリッド） */}
<td style={tdStyle}>
  {forms[s.id].isCustomPair ? (
    // 🔵 自由入力モード
    <input
      value={forms[s.id].pair}
      onChange={(e) => updateField(s.id, "pair", e.target.value)}
      onBlur={() => {
        // 入力が空なら選択モードに戻す
        if (!forms[s.id].pair.trim()) {
          updateField(s.id, "isCustomPair", false);
        }
      }}
      placeholder="ペアを入力"
      style={{
        width: "100%",
        background: "#1e293b",
        color: "white",
        borderRadius: "4px",
        padding: "4px",
      }}
    />
  ) : (
    // 🔵 プルダウンモード
    <select
      value={forms[s.id].pair}
      onChange={(e) => {
        if (e.target.value === "__custom__") {
          // 自由入力モードへ切り替え
          updateField(s.id, "isCustomPair", true);
          updateField(s.id, "pair", "");
        } else {
          updateField(s.id, "pair", e.target.value);
        }
      }}
      style={{
        width: "100%",
        background: "#1e293b",
        color: "white",
        borderRadius: "4px",
      }}
    >
      {pairOptions.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
      <option value="__custom__">その他（自由入力）</option>
    </select>
  )}
</td>

                  {/* TF */}
                  <td style={tdStyle}>
                    <select
                      value={f.timeframe}
                      onChange={(e) =>
                        updateField(s.id, "timeframe", e.target.value)
                      }
                      style={{
                        width: "100%",
                        background: "#1e293b",
                        color: "white",
                        borderRadius: "4px",
                      }}
                    >
                      <option>5M</option>
                      <option>15M</option>
                      <option>1H</option>
                      <option>4H</option>
                      <option>1D</option>
                    </select>
                  </td>

                  {/* TF_type */}
                  <td style={tdStyle}>
                    <select
                      value={f.timeframe_type}
                      onChange={(e) =>
                        updateField(s.id, "timeframe_type", e.target.value)
                      }
                      style={{
                        width: "100%",
                        background: "#1e293b",
                        color: "white",
                        borderRadius: "4px",
                      }}
                    >                      
                     <option value="long">long</option>
                      <option value="short">short</option>
                    </select>
                  </td>

                  {/* NOTES */}
                  <td style={tdStyle}>
                    <textarea
                      value={f.notes}
                      onChange={(e) =>
                        updateField(s.id, "notes", e.target.value)
                      }
                      style={{
                        width: "100%",
                        height: "28px",
                        background: "#1e293b",
                        color: "white",
                        borderRadius: "4px",
                        resize: "none",
                      }}
                    />
                  </td>

                  {/* 画像変更 */}
                  <td style={tdStyle}>
                    <label
                      style={{
                        padding: "4px 6px",
                        background: "#3b82f6",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "11px",
                      }}
                    >
                      画像変更
                      <input
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) => handleReplaceImage(e, s)}
                      />
                    </label>
                  </td>

                  {/* 更新 */}
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleUpdate(s)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        borderRadius: "4px",
                        border: "none",
                        background: "#10b981",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      更新
                    </button>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ ...tdStyle, textAlign: "center" }}>
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================
// 🔥 スタイル定義
// ============================
const bigSelect = {
  padding: "8px 10px",
  background: "#1e293b",
  color: "white",
  borderRadius: "6px",
  border: "1px solid #334155",
  fontSize: "14px",
} as const;

const thStyle = {
  padding: "4px 1px",
  borderBottom: "1px solid #1e293b",
  textAlign: "center" as const,
  fontWeight: "bold",
  height: "32px",
  fontSize: "12px",
} as const;

const tdStyle = {
  padding: "1px 1px",
  borderBottom: "1px solid #020617",
  textAlign: "center" as const,
  height: "32px",
  whiteSpace: "nowrap" as const,
  fontSize: "12px",
} as const;