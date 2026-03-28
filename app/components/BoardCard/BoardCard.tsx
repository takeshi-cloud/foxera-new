"use client";
import { useBoards } from "@/lib/useBoards";

// ===== ミニボタン共通スタイル =====
const miniBtn = {
  fontSize: "10px",
  padding: "1px 5px",
  borderRadius: "4px",
  background: "#334155",
  color: "white",
  border: "1px solid #475569",
  cursor: "pointer",
};

// ===== カード本体 =====
export const BoardCard = ({
  item,
  boards,     // ← 追加
  provided,
  load,
  actions,
  active,
  onClick,
  type,
}: any) => {
  const { createShort, moveToWait, toggleDirection, removeBoard } = actions;
 const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "----.--.--";

  const d = new Date(dateStr);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}.${m}.${day}`;
};
const { hasScreenshot } = useBoards();
  // =========================================
  // 🔴 短期カード
  // =========================================
  if (type === "short") {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
      style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",

  width: "100%",
  boxSizing: "border-box",

  padding: "6px 8px",
  marginTop: "6px",
  borderRadius: "6px",

  fontSize: "13px",

  background: "#020617",

  border: item.direction === "long"
    ? "2px solid #22c55e"
    : "2px solid #a81616",

  boxShadow: active
    ? "0 0 0 3px #ff00cc, 0 0 15px #ff00cc, 0 0 30px #ff4d6d"
    : "none",

  transform: active ? "scale(1.03)" : "scale(1)",
  zIndex: active ? 10 : 1,

  cursor: "pointer",
  transition: "all 0.15s ease",

  ...provided.draggableProps.style,
}}
    >

      {/* 左：ペア＋S */}
<div style={{
  display: "flex",
  alignItems: "center",
  width: "100%"
}}>

  {/* 左：通貨名 */}
  <div style={{
    fontWeight: "bold"
  }}>
    {item.pair}
  </div>

  {/* 右：S/L + × */}
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginLeft: "auto"
  }}>

    {/* S/L */}
    <div
      onClick={(e) => {
        e.stopPropagation();
        toggleDirection(item).then(load);
      }}
      style={{
        width: "26px",
        textAlign: "center",
        fontWeight: "bold",
        borderRadius: "4px",
        background: item.direction === "long" ? "#22c55e" : "#ef4444",
        color: "white",
        cursor: "pointer"
      }}
    >
      {item.direction === "long" ? "L" : "S"}
    </div>

    {/* × */}
    <div
      onClick={(e) => {
        e.stopPropagation();
        removeBoard(item.id).then(load);
      }}
      style={{
        width: "20px",
        textAlign: "center",
        fontWeight: "bold",
        opacity: 0.7,
        cursor: "pointer"
      }}
    >
      ×
    </div>

  </div>
</div>

      </div>
  
  );
}
 // =========================================
// 🟢 長期カード（最終版）
// =========================================
return (
  <div
    ref={provided.innerRef}
    {...provided.draggableProps}
    {...provided.dragHandleProps}
    onClick={onClick}
    style={{
  background: "#020617",

  border: item.direction === "long"
    ? "2px solid #22c55e"
    : "2px solid #a81616",

  boxShadow: active
    ? "0 0 0 3px #ff00cc, 0 0 15px #ff00cc, 0 0 30px #ff4d6d"
    : "none",

  transform: active ? "scale(1.03)" : "scale(1)",
  zIndex: active ? 10 : 1,

  padding: "6px 8px",
  borderRadius: "6px",
  marginBottom: "6px",
  color: "white",
  cursor: "pointer",

  transition: "all 0.15s ease",

  ...provided.draggableProps.style,
}}
  >

    {/* =========================
        ① ペア + 方向ボタン
    ========================= */}
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <b>{item.pair}</b>

      {/* 🔥 LONG/SHORTトグル */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleDirection(item).then(load);
        }}
        style={{
          fontSize: "11px",
          padding: "2px 8px",
          borderRadius: "4px",
          border: "none",
          background:
            item.direction === "long"
              ? "#22c55e"
              : "#ef4444",
          color: "white",
          cursor: "pointer"
        }}
      >
        {item.direction.toUpperCase()}
      </button>
    </div>

    {/* =========================
        ② 日時 + TF
    ========================= */}
    <div style={{
      marginTop: "4px",
      fontSize: "11px",
      opacity: 0.8
    }}>
     {formatDate(item.created_at)} ({item.tf ?? "4H"})
    </div>

    {/* =========================
        ③ 操作
    ========================= */}
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "8px"
    }}>

      {/* ←（左パネルへ戻す） */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          moveToWait(item).then(load); // ←仕様通り
        }}
        style={{
          fontSize: "11px",
          padding: "2px 6px",
          borderRadius: "4px",
          background: "#475569",
          color: "white",
          border: "none"
        }}
      >
        ←
      </button>

      {/* 中央：リンク系 */}
      <div style={{
        display: "flex",
        gap: "10px",
        alignItems: "center"
      }}>
        {/* 🔗 upload */}
 <span
  style={{
    cursor: "pointer",
    color: hasScreenshot(item.pair, item.timeframe_type)
      ? "limegreen"
      : "#555",
    fontSize: "16px",
  }}
  onClick={(e) => {
    e.stopPropagation();
    window.location.href = "/upload";
  }}
>
  🔗
</span>

        {/* 📷 仮 */}
        <span style={{ opacity: 0.6 }}>
          📷
        </span>
      </div>

      {/* 短期生成 */}
<button
  onClick={(e) => {
    e.stopPropagation();
    const fullItem = boards.find(b => b.id === item.id);
    createShort(fullItem).then(load);


        }}
        style={{
          fontSize: "11px",
          padding: "2px 8px",
          borderRadius: "4px",
          background: "#130e1d6b",
          color: "white",
          border: "none"
        }}
      >
        短期
      </button>

    </div>

  </div>
);
};