"use client";


import { getMarketData } from "@/lib/api/getMarketData";
import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { supabase } from "@/lib/supabase";

import { useBoards } from "@/lib/useBoards";
import { splitBoards } from "@/lib/boardUtils";
import {
  moveToWait,
  createShort,
  toggleDirection,
  removeBoard
} from "@/lib/boardActions";

import { insertBoard, updateBoard } from "@/lib/boardService";

import { LeftPanel } from "./components/LeftPanel";
import { CenterPanel } from "./components/CenterPanel";
import { RightPanel } from "./components/RightPanel";

// =========================================
// 🧠 メインページ（全体管理）
// =========================================
export const dynamic = "force-dynamic";
export default function Home() {

  // =========================================
  // 📦 DBデータ取得
  // =========================================
  const { boards, load } = useBoards();

  // =========================================
  // activePairをHomeに追加
  // =========================================
  const [activePair, setActivePair] = useState<string | null>(null);
  const [market, setMarket] = useState<any>(null);
const loadMarket = async (pair: string) => {
  const data = await getMarketData(pair);
  setMarket(data);
};
console.log("activePair:", activePair);

  // =========================================
  // 🔀 派生データ（WAITだけ）
  // =========================================
  const { wait } = splitBoards(boards);
 
  // =========================================
  // 🎛 UI状態
  // =========================================
  const [newPair, setNewPair] = useState("");
  const [marketData, setMarketData] = useState([]);
  //通貨ペアカーソル作成
  const [cursor, setCursor] = useState(0);
  const getPriceByCursor = (basePrice: number, cursor: number) => {
  return basePrice + cursor;
};
  const mergedBoards = wait.map((item: any) => {
  return {
    ...item,
    price: getPriceByCursor(market?.price ?? 0, cursor),
   };
   });
 console.log("cursor:", cursor);

 //-------------------------------------
// 手動更新
//-------------------------------------


// =========================================
// 🧲 DnD処理（最重要🔥）
// =========================================
const onDragEnd = async (result: any) => {
  const { destination, draggableId } = result;

  if (!destination) return;

  // 🔹 対象アイテム取得
  const item = boards.find(
    (b: any) => b.id.toString() === draggableId
  );
  if (!item) return;

  // 🔹 通貨ペア正規化（これ重要🔥）
  const normalize = (p: string) =>
    p?.replace("/", "").toUpperCase();

  // =========================================
  // 🟥 長期フェーズの重複禁止
  // =========================================
  if (destination.droppableId.startsWith("long")) {
    const exists = boards.some(
      (b: any) =>
        normalize(b.pair) === normalize(item.pair) &&
        b.timeframe_type === "long" &&
        b.id !== item.id
    );

    if (exists) {
      alert("同じ通貨ペアは長期に2つ入れません");
      return;
    }
  }

  // =========================================
  // 🔹 移動先タイプ判定
  // =========================================
  const fromType = item.timeframe_type;

  let toType = "";

  if (destination.droppableId.startsWith("long-")) {
    toType = "long";
  } else if (destination.droppableId.startsWith("short-")) {
    toType = "short";
  } else if (destination.droppableId === "wait") {
    toType = "wait";
  }

  // 🔥 long ⇄ short の移動禁止
  if (
    (fromType === "long" && toType === "short") ||
    (fromType === "short" && toType === "long")
  ) {
    return;
  }

  // =========================================
  // 🔹 WAIT移動
  // =========================================
  if (destination.droppableId === "wait") {
    await moveToWait(item);

  // =========================================
  // 🔹 長期
  // =========================================
  } else if (destination.droppableId.startsWith("long-")) {
    const phase = destination.droppableId.replace("long-", "");

    await updateBoard(
      draggableId,
      {
        timeframe_type: "long",
        phase,
      },
      item
    );

  // ===== 短期 =====
  } else if (destination.droppableId.startsWith("short-")) {
    const phase = destination.droppableId.replace("short-", "");

    await updateBoard(
      draggableId,
     {
  timeframe_type: "short",
  phase
},
      item
    );
  }

  load();
};
  // =========================================
  // ➕ 通貨ペア追加
  // =========================================
  const addPair = async () => {
    if (!newPair) return;

    await insertBoard(newPair.toUpperCase());

    setNewPair("");
    load();
  };

  // ================================
// 🧊 初回ロード & Realtime購読
// ================================
useEffect(() => {
  console.log("🔥 ダミーデータ投入");

  const dummy = [
    { pair: "USDJPY", price: 150 },
    { pair: "EURJPY", price: 160 },
  ];

  setMarketData(dummy);
}, []);


  // =========================================
  // 🖥 UIレイアウト（3分割）
  // =========================================
  return (
    <>
    <DragDropContext onDragEnd={onDragEnd}>

      <div
        style={{
          display: "flex",
          height: "100vh",
          minWidth: "1100px",
          background: "#020617"
        }}
      >

        {/* ========================================= */}
        {/* 🟦 左：WAITパネル */}
        {/* ========================================= */}


        <div
          style={{
            width: "180px",
            borderRight: "1px solid #334155",
            overflow: "hidden"
          }}
        >
          
          <LeftPanel
            wait={mergedBoards}
            market={market}
            cursor={cursor}        
            setCursor={setCursor}  
            newPair={newPair}
            setNewPair={setNewPair}
            addPair={addPair}
            load={load}
            actions={{
              createShort,
              toggleDirection,
              moveToWait,
              removeBoard
            }}
          />
        </div>

        {/* ========================================= */}
        {/* 🟩 中央：ボード管理 */}
        {/* ========================================= */}
        <div
          style={{
            width: "800px",
            borderRight: "1px solid #334155",
            overflow: "hidden"
          }}
        >
          <CenterPanel
            boards={boards}
            load={load}
            activePair={activePair}
            setActivePair={setActivePair}
            actions={{
              createShort,
              toggleDirection,
              moveToWait,
              removeBoard
            }}
          />
        </div>

        {/* ========================================= */}
        {/* 🟨 右：チャート（予定） */}
        {/* ========================================= */}
        <div
          style={{
            flex: 1,
            overflow: "auto"
          }}
        >
          <RightPanel 
          market={market} 
          />
        </div>

      </div>
    </DragDropContext>

   <div style={{ color: "white", padding: "10px" }}>
  <div>activePair: {activePair}</div>
  <div>market: {JSON.stringify(market)}</div>
</div>
</>
  );
  
}