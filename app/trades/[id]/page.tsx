"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getRate } from "@/lib/api/rate";

export default function TradeDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [trade, setTrade] = useState<any>(null);
  const [relatedTrades, setRelatedTrades] = useState<any[]>([]);

  const [pair, setPair] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [phase, setPhase] = useState("");
  const [tradeDate, setTradeDate] = useState("");
  const [direction, setDirection] = useState("wait");
  const [note, setNote] = useState("");
  const [image, setImage] = useState("");

  const pairs = [
    "USDJPY","GBPJPY","GBPUSD","GBPAUD",
    "EURJPY","EURUSD","EURAUD",
    "GOLD","NASDAQ","US02Y"
  ];

  const selectStyle = {
    width: "100%",
    padding: "6px",
    background: "#1e293b",
    color: "white",
    border: "1px solid #334155",
    borderRadius: "6px"
  };

  useEffect(() => {
    fetchTrade(id);
  }, []);

  const fetchTrade = async (targetId: string) => {
    const { data } = await supabase
      .from("trades")
      .select("*")
      .eq("id", targetId)
      .single();

    if (!data) return;

    setTrade(data);
    setImage(data.image_url);

    setPair(data.pair);
    setTimeframe(data.timeframe);
    setPhase(data.phase);
    setTradeDate(data.trade_date);
    setDirection(data.direction);
    setNote(data.note || "");

    fetchRelated(data.pair);
  };

  const fetchRelated = async (targetPair: string) => {
    const { data } = await supabase
      .from("trades")
      .select("*")
      .eq("pair", targetPair)
      .order("trade_date", { ascending: false });

    setRelatedTrades(data || []);
  };

  const changePair = async (newPair: string) => {
    const { data } = await supabase
      .from("trades")
      .select("*")
      .eq("pair", newPair)
      .order("trade_date", { ascending: false })
      .limit(1)
      .single();

    if (data) fetchTrade(data.id);
  };

  const updateTrade = async () => {
    await supabase
      .from("trades")
      .update({
        pair,
        timeframe,
        phase,
        trade_date: tradeDate,
        direction,
        note,
      })
      .eq("id", trade.id);

    alert("更新完了");
  };

  const deleteTrade = async () => {
    if (!confirm("削除する？")) return;

    await supabase.from("trades").delete().eq("id", trade.id);

    alert("削除完了");
    router.push("/");
  }

  if (!trade) return <p>Loading</p>;

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "#0f172a",
      color: "white"
    }}>

      {/* 左 */}
      <div style={{
        width: "320px",
        padding: "20px",
        borderRight: "1px solid #1e293b",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>

        {/* 🔥 ナビボタン */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => router.push("/")} style={btnGray}>
            🏠 HOME
          </button>

          <button onClick={() => router.push("/Kanban")} style={btnGreen}>
            📊 看板
          </button>
        </div>

        <h2>編集</h2>

        <p>Date</p>
        <input
          type="date"
          value={tradeDate?.split("T")[0]}
          onChange={(e)=>setTradeDate(e.target.value)}
        />

        <p>Pair</p>
        <select value={pair} onChange={(e)=>setPair(e.target.value)} style={selectStyle}>
          {pairs.map(p => <option key={p}>{p}</option>)}
        </select>

        <p>TF</p>
        <select value={timeframe} onChange={(e)=>setTimeframe(e.target.value)} style={selectStyle}>
          <option>5M</option><option>15M</option><option>30M</option>
          <option>1H</option><option>4H</option><option>1D</option><option>1W</option>
        </select>

        <p>Direction</p>
        <select value={direction} onChange={(e)=>setDirection(e.target.value)} style={selectStyle}>
          <option value="long">上昇</option>
          <option value="short">下落</option>
          <option value="wait">待機</option>
        </select>

        <p>Phase</p>
        <select value={phase} onChange={(e)=>setPhase(e.target.value)} style={selectStyle}>
          <option>Trend</option>
          <option>Pullback</option>
          <option>Entry</option>
          <option>Trigger</option>
        </select>

        <p>Note</p>
        <textarea
          value={note}
          onChange={(e)=>setNote(e.target.value)}
          style={{
            width: "100%",
            height: "80px",
            background: "#1e293b",
            color: "white",
            border: "1px solid #334155",
            borderRadius: "6px",
            padding: "8px"
          }}
        />

        <button onClick={updateTrade} style={bigBlue}>更新</button>
        <button onClick={deleteTrade} style={bigRed}>削除</button>

        {/* 履歴 */}
        <div style={{ marginTop: "10px", flex: 1 }}>
          <h4>履歴</h4>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            overflowY: "auto"
          }}>
            {relatedTrades.map((t) => (
              <div
                key={t.id}
                onClick={() => fetchTrade(t.id)}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: trade.id === t.id ? "#16a34a" : "#1e293b"
                }}
              >
                {t.trade_date?.split("T")[0]}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 右 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* 銘柄タブ */}
        <div style={{
          display: "flex",
          gap: "5px",
          padding: "10px",
          borderBottom: "1px solid #1e293b"
        }}>
          {pairs.map(p => (
            <div
              key={p}
              onClick={() => changePair(p)}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                cursor: "pointer",
                background: pair === p ? "#16a34a" : "#1e293b"
              }}
            >
              {p}
            </div>
          ))}
        </div>

        {/* チャート */}
        <div style={{
          flex: 1,
          background: "black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <img
            src={image}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain"
            }}
          />
        </div>

      </div>

    </div>
  );
}

// styles
const btnGray = {
  padding: "10px",
  background: "#334155",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const btnGreen = {
  padding: "10px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const bigBlue = {
  padding: "14px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  marginTop: "10px"
};

const bigRed = {
  padding: "14px",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "8px",
  marginTop: "10px"
};