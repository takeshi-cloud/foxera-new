"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { BoardCard } from "./BoardCard/BoardCard";
import { useState } from "react";

// ✅ 分離したコンポーネント
import { Header } from "./CenterPanel/Header";
import { Row } from "./CenterPanel/Row";
import { useBoards } from "@/lib/useBoards";


// =============================
// 型定義
// =============================
type Board = {
  id: string;
  pair: string;
  phase: string;
  direction: "long" | "short";
  timeframe_type: "long" | "short";
};


export const CenterPanel = ({
  boards,
  screenshots,
  load,
  actions,
  activePair,
  setActivePair,
}: any) => {

  // =============================
  // 🔹 フェーズ一覧
  // =============================
  const phases = ["Reversal", "Trend", "Pullback", "Trigger"];


  // =============================
  // 🔹 データ分割（長期 / 短期）
  // =============================
  const longBoards = boards.filter(
    (b: Board) => b.timeframe_type === "long"
  );

  const shortBoards = boards.filter(
    (b: Board) => b.timeframe_type === "short"
  );


  // =============================
  // 🔹 長期カード（現在の状況用）
  // =============================
  const longCards = longBoards.map((b: Board) => ({
    ...b,
  }));


  // =============================
  // 🔹 通貨ペア正規化（比較用）
  // =============================
  const normalize = (pair: string) =>
    pair?.replace("/", "").toUpperCase();


  // =============================
  // 🔹 フィルター状態（LONG / SHORT）
  // =============================
  const [showLong, setShowLong] = useState(true);
  const [showShort, setShowShort] = useState(true);


console.log(boards);
  return (
    <div style={{ flex: 1, padding: "12px", color: "white" }}>

      {/* ========================================= */}
      {/* 🟦 現在の状況 */}
      {/* ========================================= */}

      <h3 style={{ marginBottom: "10px" }}>現在の状況</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}
      >

        {/* =============================
            左カラム
        ============================= */}
        <div>
          <Header />

{[...longCards]
  .sort((a: any, b: any) => {
    const priority = (p: string) => {
      if (p === "Trigger") return 0;
      if (p === "Pullback") return 1;
      return 2;
    };
    return priority(a.phase) - priority(b.phase);
  })
  .filter((_: any, i: number) => i % 2 === 0)
  .map((card: any) => (   // ← 🔥これが必要
    <Row
      key={card.id}
      card={card}
      shortBoards={shortBoards}
      activePair={activePair}
      setActivePair={setActivePair}
      screenshots={screenshots} 
    />
  ))}
        </div>


        {/* =============================
            右カラム
        ============================= */}
        <div>
          <Header />

{[...longCards]
  .sort((a: any, b: any) => {
    const priority = (p: string) => {
      if (p === "Trigger") return 0;
      if (p === "Pullback") return 1;
      return 2;
    };
    return priority(a.phase) - priority(b.phase);
  })
  .filter((_: any, i: number) => i % 2 === 1)
  .map((card: any) => (
    <Row
      key={card.id}
      card={card}
      shortBoards={shortBoards}
      activePair={activePair}
      setActivePair={setActivePair}
    />
  ))}
        </div>

      </div>



      {/* ========================================= */}
      {/* 🟢 長期フェーズ */}
      {/* ========================================= */}

      {/* --- タイトル + フィルターUI --- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "16px",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0 }}>①長期フェーズ</h3>

        {/* FILTERラベル（視認性用） */}
        <span
          style={{
            fontSize: "11px",
            color: "#b0c0d6",
            marginLeft: "8px",
          }}
        >
          FILTER
        </span>

        {/* --- フィルターボタン --- */}
        <div style={{ display: "flex", gap: "6px" }}>

          {/* LONG表示切替 */}
          <button
            onClick={() => setShowLong(!showLong)}
            style={{
              background: showLong ? "#22c55e" : "#1e293b",
              color: showLong ? "white" : "#64748b",
              padding: "4px 10px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              boxShadow: showLong ? "0 0 8px #22c55e88" : "none",
              transition: "all 0.15s ease",
            }}
          >
            LONG
          </button>

          {/* SHORT表示切替 */}
          <button
            onClick={() => setShowShort(!showShort)}
            style={{
              background: showShort ? "#ef4444" : "#1e293b",
              color: showShort ? "white" : "#64748b",
              padding: "4px 10px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              boxShadow: showShort ? "0 0 8px #ef444488" : "none",
              transition: "all 0.15s ease",
            }}
          >
            SHORT
          </button>

        </div>
      </div>


      {/* --- 長期カードエリア --- */}
      <div style={{ display: "flex", gap: "12px" }}>
        {phases.map((phase) => {

          // フェーズごとに抽出
          const items = longBoards.filter(
            (b: Board) => b.phase === phase
          );

          return (
            <Droppable key={phase} droppableId={`long-${phase}`}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    flex: 1,
                    minHeight: "120px",
                    background: "#0f172a",
                    borderRadius: "8px",
                    padding: "8px",
                    border: "1px solid #334155",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",   // ← 横中央
                  }}
                >

                  {/* フェーズタイトル */}
                  <h4 style={{
                      fontSize: "16px",
                      margin:"0",
                      marginBottom: "5px",
                       }}>
                    {phase}
                  </h4>

                  {/* フィルター適用 + 描画 */}
                  {items
                    .filter((item: Board) => {
                      if (item.direction === "long" && !showLong) return false;
                      if (item.direction === "short" && !showShort) return false;
                      return true;
                    })
                    .map((item: Board, index: number) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id.toString()}
                        index={index}
                      >
                        {(provided) => (
 <BoardCard
  item={item}
  boards={boards}
  screenshots={screenshots}
  provided={provided}
  load={load}
  actions={actions}
  active={normalize(activePair) === normalize(item.pair)}
  onClick={() => setActivePair(item.pair)}
  type="long"
/>
                        )}
                      </Draggable>
                    ))}

                  {/* DnDプレースホルダ */}
                  {provided.placeholder}

                </div>
              )}
            </Droppable>
          );
        })}
      </div>



{/* ========================================= */}
{/* 🔴 短期フェーズ */}
{/* ========================================= */}

<h3 style={{ marginTop: "10px", marginBottom: "10px" }}>
  ②短期フェーズ
</h3>

<div style={{ display: "flex", gap: "12px" }}>
  {phases.map((phase) => {

    // フェーズごとに抽出
    const items = shortBoards.filter(
      (b: Board) => b.phase === phase
    );

    return (
      <Droppable key={phase} droppableId={`short-${phase}`}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex: 1,
              minHeight: "120px",
              background: "#0f172a",
              borderRadius: "8px",
              padding: "8px",
              border: "1px solid #334155",

              display: "flex",
              flexDirection: "column",
              alignItems: "center", // ← 長期と統一
            }}
          >

            {/* フェーズタイトル */}
            <h4
              style={{
                fontSize: "16px",
                margin: "0",
                marginBottom: "5px",
              }}
            >
              {phase}
            </h4>

            {/* フィルター適用 + 描画 */}
            {items
              .filter((item: Board) => {
                if (item.direction === "long" && !showLong) return false;
                if (item.direction === "short" && !showShort) return false;
                return true;
              })
              .map((item: Board, index: number) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id.toString()}
                  index={index}
                >
                  {(provided) => (
 <BoardCard
  item={item}
  boards={boards}   
  screenshots={screenshots}
  provided={provided}
  load={load}
  actions={actions}
  active={normalize(activePair) === normalize(item.pair)}
  onClick={() => setActivePair(item.pair)}
  type="short"
/>
                  )}
                </Draggable>
              ))}

            {/* DnDプレースホルダ */}
            {provided.placeholder}

          </div>
        )}
      </Droppable>
    );
  })}
</div>

    </div>
  );
};