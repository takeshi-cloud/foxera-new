"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import Link from "next/link";

export const LeftPanel = ({
  wait,
  newPair,
  market,
  setNewPair,
  addPair,
  cursor,
  setCursor,
  load,
  actions,
}: any) => {
  const { removeBoard } = actions;

  // =============================
  // 🔹 価格データ合成（UI用）
  // =============================
  const merged = wait.map((item: any) => {
    const m = market?.find?.((m: any) => m.pair === item.pair);

    return {
      ...item,
      price: m?.price ?? market?.price,
    };
  });

  return (
    <Droppable droppableId="wait">
      {(provided) => (
        <div
  ref={provided.innerRef}
  {...provided.droppableProps}
  style={{
    height: "100vh",        // ★固定
    overflow: "hidden",     // ★外スクロール禁止
    padding: "12px",
    background: "#0f172a",
  }}
>
          {/* =============================
              🔹 タイトル
          ============================= */}
          <h3 style={{ color: "white" }}>通貨ペア</h3>

          {/* =============================
              🔹 追加フォーム
          ============================= */}
          <div
            style={{
              display: "flex",
              flexDirection: "column", 
              gap: "6px",
              marginBottom: "12px",
            }}
          >
            <input
              value={newPair}
              onChange={(e) => setNewPair(e.target.value)}
              placeholder="USDJPY"
              style={{
                flex: 1,
                height: "30px",
                padding: "4px",
                fontSize: "12px",
                borderRadius: "4px",
                border: "1px solid #334155",
                background: "#020617",
                color: "white",
              }}
            />

            <button
              onClick={addPair}
              style={{
                padding: "4px 8px",
                fontSize: "12px",
                borderRadius: "4px",
                background: "#22c55e",
                color: "white",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              追加
            </button>
          </div>

          {/* =============================
              🔥 スクロールBOX（縦横）
          ============================= */}
          <div
            style={{
              height: "calc(100vh - 350px)",
              overflowY: "auto",
              overflowX: "auto",
              border: "1px solid #334155",
              borderRadius: "10px",
              padding: "8px",
              marginBottom: "12px",
            }}
          >
            {merged.map((item: any, index: number) => (
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
                    style={{
                      background: "#334155",
                      padding: "8px",
                      borderRadius: "6px",
                      marginBottom: "6px",
                      color: "white",
                      ...provided.draggableProps.style,
                    }}
                  >
                    {/* =============================
                        🔹 横スクロール内容
                    ============================= */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",              // ←詰めた🔥
                        minWidth: "320px",       // ←ギリ見せ用🔥
                        overflow: "hidden",      // ←途中切れ表現🔥
                      }}
                    >
                      {/* ❌ボタン */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBoard(item.id).then(load);
                        }}
                        style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          marginRight: "2px", // ←近づけた🔥
                        }}
                      >
                        ×
                      </button>

                      {/* 通貨ペア */}
                      <b>{item.pair}</b>

                      {/* 現在価格（ギリ見える） */}
                      <div style={{ fontSize: "12px", opacity: 0.8 }}>
                        {item.price != null
                          ? Number(item.price).toFixed(3)
                          : "--"}
                      </div>

                      {/* 右側（スクロールで出る） */}
                      <div style={{ fontSize: "11px", opacity: 0.5 }}>
                        🇯🇵 Tokyo --
                      </div>

                      <div style={{ fontSize: "11px", opacity: 0.5 }}>
                        🇪🇺 London --
                      </div>

                      <div style={{ fontSize: "11px", opacity: 0.5 }}>
                        🇺🇸 NY --
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
          </div>

          {/* =============================
              🔹 MENU（スクロール外）
          ============================= */}
          <div>
            <div style={{ fontSize: "12px", opacity: 0.5 }}>MENU</div>

            <Link href="/upload">
              <div className="menuBtn">📤 アップロード</div>
            </Link>

            <Link href="/history_image">
              <div className="menuBtn">📊 ギャラリー</div>
            </Link>



            <Link href="/trades">
              <div className="menuBtn">📊 トレード記録日誌</div>
            </Link>
            
            <div
             className="menuBtn green"
             style={{ color: "white",fontSize:"15px" }}   
             >
            <div className="menuBtn green">過去チャート検証</div>
            <div className="menuBtn green">PIVOTレーダー</div>
            <div className="menuBtn green">通貨強弱レーダー</div>
          </div>
        </div>
        </div>
      )}
    </Droppable>
  );
};