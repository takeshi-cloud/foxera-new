"use client";

import { getMarketData } from "@/lib/api/getMarketData";
import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";

import { useBoards } from "@/lib/useBoards";
import { splitBoards } from "@/lib/boardUtils";
import {
  moveToWait,
  createShort,
  toggleDirection,
  removeBoard,
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
  const [marketData, setMarketData] = useState<any[]>([]);
  const [cursor, setCursor] = useState(0);

  const getPriceByCursor = (basePrice: number, cursor: number) => {
    return basePrice + cursor;
  };

  // WAIT は文字列のペア配列として扱う想定
  const mergedBoards = wait.map((pair: string) => {
    return {
      id: pair, // WAIT 側の Draggable 用 ID は pair を使う
      pair,
      price: getPriceByCursor(market?.price ?? 0, cursor),
    };
  });

  console.log("cursor:", cursor);

  // ================================
  // 🧊 初回ロード & ダミー
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
  // 🧲 DnD処理（最重要🔥）
  // =========================================
  const onDragEnd = async (result: any) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    // boards 上のアイテム（LONG / SHORT）かどうか
    const item = boards.find((b: any) => b.id.toString() === draggableId);

    // 🔹 item が見つからない = WAIT 側のカード
    if (!item) {
      // WAIT → LONG のみ許可
      if (destination.droppableId.startsWith("long-")) {
        const pair = draggableId; // WAIT 側は id = pair
        await insertBoard(pair.toUpperCase());
        await load();
      }
      // WAIT → SHORT / WAIT → WAIT は何もしない
      return;
    }

    // ここからは LONG / SHORT カードの移動
    const fromType = item.timeframe_type;

    let toType = "";
    if (destination.droppableId.startsWith("long-")) {
      toType = "long";
    } else if (destination.droppableId.startsWith("short-")) {
      toType = "short";
    } else if (destination.droppableId === "wait") {
      toType = "wait";
    }

    // 🔥 long ⇄ short の移動禁止（DnDではやらない）
    if (
      (fromType === "long" && toType === "short") ||
      (fromType === "short" && toType === "long")
    ) {
      return;
    }

    // 🔥 SHORT → WAIT も禁止（仕様どおり）
    if (fromType === "short" && toType === "wait") {
      return;
    }

    // =========================================
    // 🔹 WAIT移動（LONG / SHORT → WAIT = 監視終了 = 削除）
    // =========================================
    if (destination.droppableId === "wait") {
      await moveToWait(item);
      await load();
      return;
    }

    // =========================================
    // 🔹 長期：フェーズ移動
    // =========================================
    if (destination.droppableId.startsWith("long-")) {
      const phase = destination.droppableId.replace("long-", "");

      await updateBoard(
        draggableId,
        {
          timeframe_type: "long",
          phase,
        },
        item
      );

      await load();
      return;
    }

    // =========================================
    // 🔹 短期：フェーズ移動
    // =========================================
    if (destination.droppableId.startsWith("short-")) {
      const phase = destination.droppableId.replace("short-", "");

      await updateBoard(
        draggableId,
        {
          timeframe_type: "short",
          phase,
        },
        item
      );

      await load();
      return;
    }
  };

  // =========================================
  // ➕ 通貨ペア追加（WAIT 側の入力欄）
  // =========================================
  const addPair = async () => {
    if (!newPair) return;

    // 現仕様では WAIT は DB に保存しないので、
    // ここでの newPair は「監視候補リストに追加したいペア」。
    // もし動的に WAIT 候補を増やしたいなら、
    // ALL_PAIRS を外部管理にしてここで更新する設計にする。
    // いまは UI 側だけリセットしておく。
    setNewPair("");
    load();
  };

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
            background: "#020617",
          }}
        >
          {/* 🟦 左：WAITパネル */}
          <div
            style={{
              width: "180px",
              borderRight: "1px solid #334155",
              overflow: "hidden",
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
                removeBoard,
              }}
            />
          </div>

          {/* 🟩 中央：ボード管理 */}
          <div
            style={{
              width: "800px",
              borderRight: "1px solid #334155",
              overflow: "hidden",
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
                removeBoard,
              }}
            />
          </div>

          {/* 🟨 右：チャート（予定） */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
            }}
          >
            <RightPanel market={market} />
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