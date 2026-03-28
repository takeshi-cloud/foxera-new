"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { getBoard, updateBoardPhase } from "@/lib/board";
export default function Kanban() {
  const router = useRouter();
  const [boards, setBoards] = useState<any[]>([]);
  const [board, setBoard] = useState<any>({});
  const [waitTrades, setWaitTrades] = useState<any[]>([]);

  const phases = [ "Reversal","Trend", "Pullback", "Trigger"];
  const directions = ["long", "short"];

  //カードの中身を新しく作る
  const fetchBoard = async () => {
  const { data: { user } } = await supabase.auth.getUser();
 
  if (!user) return;

  const data = await getBoard(user.id);

  // 初期化
  const newBoard: any = {};
  const wait: any[] = [];

  directions.forEach((dir) => {
    newBoard[dir] = {};
    phases.forEach((p) => {
      newBoard[dir][p] = [];
    });
  });

  data.forEach((item: any) => {
    if (item.direction === "wait") {
      wait.push(item);
    } else {
      newBoard[item.direction]?.[item.phase]?.push(item);
    }
  });

  setBoard(newBoard);
  setWaitTrades(wait);
};

useEffect(() => {
  fetchBoard();
}, []);


  const fetchTrades = async () => {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("trade_date", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    // 最新だけ
    const latestMap: any = {};

    data.forEach((trade: any) => {
      const key = trade.pair;

      if (
        !latestMap[key] ||
        new Date(trade.trade_date) > new Date(latestMap[key].trade_date)
      ) {
        latestMap[key] = trade;
      }
    });

    const latestTrades = Object.values(latestMap);

    // 初期化
    const newBoard: any = {};
    const wait: any[] = [];

    directions.forEach((dir) => {
      newBoard[dir] = {};
      phases.forEach((p) => {
        newBoard[dir][p] = [];
      });
    });

    // 分類
    latestTrades.forEach((trade: any) => {
      const dir = trade.direction;

      if (dir === "long" || dir === "short") {
        if (newBoard[dir][trade.phase]) {
          newBoard[dir][trade.phase].push(trade);
        }
      } else {
        wait.push(trade);
      }
    });

    setBoard(newBoard);
    setWaitTrades(wait);
  };

  // 🔥 ドラッグ終了
  const onDragEnd = async (result: any) => {
  if (!result.destination) return;

  const dest = result.destination.droppableId;
  const boardId = result.draggableId;

  // WAIT
  if (dest === "wait") {
    await updateBoardPhase(boardId, "wait", "wait");
  } else {
    const [dir, phase] = dest.split("-");

    await updateBoardPhase(boardId, phase, dir);
  }

  fetchBoard();
  };
  const toggleDirection = async (item: any) => {
  const newDir = item.direction === "long" ? "short" : "long";

  await updateBoardPhase(item.id, item.phase, newDir);

  fetchBoard(); // 再読み込み
 };
  const renderCard = (item: any, index: number, dir: string) => (
  <Draggable
    key={item.id}
    draggableId={item.id.toString()}
    index={index}
  >
    {(provided) => (
      <div
  ref={provided.innerRef}
  {...provided.draggableProps}
  {...provided.dragHandleProps}
  onClick={() => router.push(`/trades/${item.id}`)}
  style={{
    background: "#334155",
    marginBottom: "10px",
    padding: "12px",
    borderRadius: "10px",
    cursor: "pointer",
    borderLeft:
      item.direction === "long"
        ? "4px solid #22c55e"
        : "4px solid #ef4444",
    ...provided.draggableProps.style,
  }}
>

  {/* 上段 */}
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }}>

    {/* 銘柄 */}
    <p style={{ fontWeight: "bold", fontSize: "16px" }}>
      {item.pair}
    </p>

    {/* 方向（クリックで変更） */}
    <span
      onClick={(e) => {
        e.stopPropagation(); // ページ遷移防止
        toggleDirection(item);
      }}
      style={{
        background:
          item.direction === "long" ? "#0ea5e9" : "#dc2626",
        padding: "6px 10px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      {item.direction.toUpperCase()}
    </span>
  </div>

  {/* 下段 */}
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    marginTop: "6px",
    fontSize: "12px",
    opacity: 0.8
  }}>
    <span>STR: {item.strength || "-"}</span>
    <span>PD: {item.pivot_distance || "-"}</span>
  </div>

</div>
    )}
  </Draggable>
);


  return (
    <div style={{ padding: "20px", background: "#0f172a", color: "white", minHeight: "100vh" }}>
      <h1>🔥 Trading Command Center</h1>

      <button
        onClick={() => router.push("/")}
        style={{
          marginBottom: "20px",
          padding: "10px",
          borderRadius: "8px",
          background: "#333",
          color: "white",
          border: "none",
        }}
      >
        🏠 HOME
      </button>

      <DragDropContext onDragEnd={onDragEnd}>

        {/* LONG / SHORT */}
        {directions.map((dir) => (
          <div key={dir} style={{ marginBottom: "50px" }}>
            <h2 style={{ color: dir === "long" ? "lime" : "red" }}>
              {dir === "long" ? "📈 LONG" : "📉 SHORT"}
            </h2>

            <div style={{ display: "flex", gap: "15px" }}>
              {phases.map((phase) => (
                <Droppable
                  key={phase}
                  droppableId={`${dir}-${phase}`}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        flex: 1,
                        background: "#1e293b",
                        padding: "10px",
                        borderRadius: "10px",
                        minHeight: "300px",
                      }}
                    >
                      <h3 style={{ textAlign: "center" }}>{phase}</h3>

                      {board[dir]?.[phase]?.map((trade: any, index: number) =>
                        renderCard(trade, index, dir)
                      )}

                      {provided.placeholder}

                      {board[dir]?.[phase]?.length === 0 && (
                        <p style={{ opacity: 0.3, textAlign: "center" }}>
                          なし
                        </p>
                      )}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        ))}

        {/* WAIT */}
        <Droppable droppableId="wait" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ marginTop: "40px" }}
            >
              <h2 style={{ color: "gray" }}>⏸ WAIT</h2>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {waitTrades.map((trade: any, index: number) => (
                  <Draggable
                    key={trade.id}
                    draggableId={trade.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => router.push(`/trades/${trade.id}`)}
                        style={{
                          width: "180px",
                          background: "#444",
                          padding: "10px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          ...provided.draggableProps.style,
                        }}
                      >
                        <p><b>{trade.pair}</b></p>
                        <p>{trade.trade_date?.split("T")[0]}</p>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>

      </DragDropContext>
    </div>
  );
}