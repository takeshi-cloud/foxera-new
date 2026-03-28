"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
const router = useRouter();

const [trades, setTrades] = useState<any[]>([]);
const [selectedTrade, setSelectedTrade] = useState<any>(null);
const [selectedPair, setSelectedPair] = useState("USDJPY");
const [note, setNote] = useState("");

const [filterPhase, setFilterPhase] = useState("");
const [filterTimeframe, setFilterTimeframe] = useState("");
const [filterDirection, setFilterDirection] = useState("");

const [sortKey, setSortKey] = useState("trade_date");
const [sortAsc, setSortAsc] = useState(false);

const getDirectionLabel = (dir: string) => {
if (dir === "long") return "📈 上昇";
if (dir === "short") return "📉 下落";
return "⏸ 待機";
};

const getDirectionColor = (dir: string) => {
if (dir === "long") return "lime";
if (dir === "short") return "red";
return "gray";
};

const selectStyle = {
background: "#1e293b",
color: "white",
border: "1px solid #334155",
borderRadius: "6px",
padding: "5px 10px"
};

// ✅ データ取得（修正済み）
const fetchTrades = async () => {
const { data: { user } } = await supabase.auth.getUser();


if (!user) {
  router.push("/login");
  return;
}

const { data, error } = await supabase
  .from("trades")
  .select("*")
  .eq("user_id", user.id)
  .order("trade_date", { ascending: false });

if (error) {
  console.error(error);
} else {
  setTrades(data || []);
}


};

useEffect(() => {
fetchTrades();
}, []);

// ✅ メモ保存（追加）
const saveNote = async () => {
if (!selectedTrade) return;


const { data: { user } } = await supabase.auth.getUser();

await supabase
  .from("trades")
  .update({ note })
  .eq("id", selectedTrade.id)
  .eq("user_id", user?.id);

fetchTrades();


};

// ✅ フィルター
const filteredTrades = trades.filter((t) => {
if (t.pair !== selectedPair) return false;
if (filterPhase && t.phase !== filterPhase) return false;
if (filterTimeframe && t.timeframe !== filterTimeframe) return false;
if (filterDirection && t.direction !== filterDirection) return false;
return true;
});

const pairs = [
"USDJPY","GBPJPY","GBPUSD","GBPAUD",
"EURJPY","EURUSD","EURAUD",
"GOLD","NASDAQ","US02Y"
];

const sortedTrades = [...filteredTrades].sort((a, b) => {
if (sortKey === "trade_date") {
return sortAsc
? new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
: new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime();
}


return sortAsc
  ? String(a[sortKey]).localeCompare(String(b[sortKey]))
  : String(b[sortKey]).localeCompare(String(a[sortKey]));


});

return (
<div style={{
height: "100vh",
display: "flex",
background: "#0f172a",
color: "white"
}}>


  {/* 左 */}
  <div style={{
    width: "220px",
    borderRight: "1px solid #1e293b",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  }}>
    <div style={{ fontSize: "20px", fontWeight: "bold" }}>
      🚀 FOXERA
    </div>

    <button
      onClick={() => router.push("/upload")}
      style={btnBlue}
    >
      🚀 Upload
    </button>

    <button onClick={() => router.push("/Kanban")} style={btnGreen}>
      📊 看板
    </button>

    <div style={{ height: "1px", background: "#1e293b" }} />

    <div style={{ opacity: 0.7 }}>Markets</div>

    {pairs.map((p) => (
      <div
        key={p}
        onClick={() => setSelectedPair(p)}
        style={{
          padding: "10px",
          borderRadius: "6px",
          cursor: "pointer",
          background: selectedPair === p ? "#1e293b" : "transparent"
        }}
      >
        {p}
      </div>
    ))}
  </div>

  {/* 中央 */}
  <div style={{ flex: 1, padding: "15px" }}>

    {/* フィルター */}
    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
      <select style={selectStyle} onChange={(e) => setFilterPhase(e.target.value)}>
        <option value="">Phase</option>
        <option>Trend</option>
        <option>Pullback</option>
        <option>Entry</option>
        <option>Trigger</option>
      </select>

      <select style={selectStyle} onChange={(e) => setFilterTimeframe(e.target.value)}>
        <option value="">TF</option>
        <option>5M</option>
        <option>15M</option>
        <option>30M</option>
        <option>1H</option>
        <option>4H</option>
        <option>1D</option>
        <option>1W</option>
      </select>

      <select style={selectStyle} onChange={(e) => setFilterDirection(e.target.value)}>
        <option value="">Direction</option>
        <option value="long">上昇</option>
        <option value="short">下落</option>
        <option value="wait">待機</option>
      </select>
    </div>

    {/* ヘッダー */}
    <div style={headerStyle}>
      <div style={{ width: "100px" }}>日付</div>
      <div style={{ width: "110px" }}>銘柄</div>
      <div style={{ width: "80px" }}>TF</div>
      <div style={{ width: "120px" }}>方向</div>
      <div style={{ width: "120px" }}>ステータス</div>
      <div style={{ flex: 1 }}>メモ</div>
      <div style={{ width: "60px" }}></div>
    </div>

    {/* 一覧 */}
    {sortedTrades.map((trade) => (
      <div
        key={trade.id}
        onClick={() => {
          setSelectedTrade(trade);
          setNote(trade.note || "");
        }}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px",
          borderBottom: "1px solid #1e293b",
          cursor: "pointer",
          background: selectedTrade?.id === trade.id ? "#1e293b" : "transparent"
        }}
      >
        <div style={{ width: "100px" }}>{trade.trade_date?.split("T")[0]}</div>
        <div style={{ width: "110px", fontWeight: "bold" }}>{trade.pair}</div>
        <div style={{ width: "80px" }}>{trade.timeframe}</div>

        <div style={{ width: "120px", color: getDirectionColor(trade.direction) }}>
          {getDirectionLabel(trade.direction)}
        </div>

        <div style={{ width: "120px" }}>{trade.phase}</div>

        <div style={{
          flex: 1,
          fontSize: "12px",
          opacity: 0.8,
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis"
        }}>
          {trade.note}
        </div>

        <div style={{ width: "60px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/trades/${trade.id}`);
            }}
            style={editBtn}
          >
            ✏️
          </button>
        </div>
      </div>
    ))}
  </div>

  {/* 右 */}
  <div style={{
    width: "520px",
    borderLeft: "1px solid #1e293b",
    padding: "10px",
    display: "flex",
    flexDirection: "column"
  }}>
    {selectedTrade ? (
      <>
        <div style={{ flex: 1, background: "black" }}>
          <img
            src={selectedTrade.image_url}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain"
            }}
          />
        </div>

        <div style={detailBox}>
          <p><b>{selectedTrade.pair}</b></p>
          <p>{selectedTrade.trade_date?.split("T")[0]}</p>

          <p style={{ color: getDirectionColor(selectedTrade.direction) }}>
            {getDirectionLabel(selectedTrade.direction)}
          </p>

          <p>TF：{selectedTrade.timeframe}</p>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={textareaStyle}
          />

          <button onClick={saveNote} style={btnGreen}>
            💾 保存
          </button>
        </div>
      </>
    ) : (
      <p>選択してください</p>
    )}
  </div>

</div>


);
}

// styles
const headerStyle = {
display: "flex",
padding: "10px",
borderBottom: "2px solid #1e293b",
fontWeight: "bold"
};

const btnBlue = {
padding: "12px",
background: "#2563eb",
borderRadius: "8px",
color: "white",
border: "none",
cursor: "pointer"
};

const btnGreen = {
padding: "10px",
background: "#16a34a",
borderRadius: "8px",
color: "white",
border: "none",
cursor: "pointer"
};

const editBtn = {
width: "32px",
height: "32px",
background: "#16a34a",
borderRadius: "6px",
border: "none",
color: "white",
cursor: "pointer"
};

const detailBox = {
marginTop: "10px",
background: "#1e293b",
padding: "10px",
borderRadius: "8px"
};

const textareaStyle = {
width: "100%",
height: "80px",
background: "#0f172a",
color: "white",
border: "1px solid #334155",
borderRadius: "6px",
padding: "8px"
};
