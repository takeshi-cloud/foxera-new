"use client";
import { useState } from "react";

export const BoardCard = ({
  item,
  boards,
  screenshots,
  provided,
  load,
  actions,
  active,
  onClick,
  type,
}: any) => {
  const { createShort, moveToWait, toggleDirection, removeBoard, updateBoard } = actions;

  // ============================
  // 共通：日付フォーマット
  // ============================
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "----.--.--";
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  // ============================
  // TF メニュー
  // ============================
  const [showTfMenu, setShowTfMenu] = useState(false);

  // ============================
  // 最新スクショへジャンプ
  // ============================
  const goToLatestScreenshot = (pair: string, timeframe_type: string) => {
  const list = screenshots ?? [];   // ← ★ これを追加

  const filtered = list
    .filter((s) => s.pair === pair && s.timeframe_type === timeframe_type)
    .sort(
      (a, b) =>
        new Date(b.trade_date).getTime() -
        new Date(a.trade_date).getTime()
    );

  if (filtered.length === 0) {
    window.location.href = "/history";
    return;
  }

  const latest = filtered[0];
  window.location.href = `/history?select=${latest.id}`;
};

  // ============================
  // 共通：最新スクショ判定
  // ============================
  const hasRecentScreenshot = screenshots?.some(
    (s) =>
      s.pair === item.pair &&
      s.timeframe_type === item.timeframe_type &&
      Math.abs(new Date(s.trade_date).getTime() - new Date(item.trade_date).getTime()) <=
        7 * 24 * 60 * 60 * 1000
  );

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
          flexDirection: "column",
          alignItems: "flex-start",
          width: "95%",
          padding: "6px 8px",
          marginTop: "6px",
          borderRadius: "6px",
          background: "#020617",
          border: item.direction === "long" ? "2px solid #22c55e" : "2px solid #a81616",
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
        {/* ① ペア名 + L/S + × */}
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <div style={{ fontWeight: "bold" }}>{item.pair}</div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto" }}>
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
                cursor: "pointer",
              }}
            >
              {item.direction === "long" ? "L" : "S"}
            </div>

            <div
              onClick={(e) => {
                e.stopPropagation();
                removeBoard(item).then(load);
              }}
              style={{
                width: "20px",
                textAlign: "center",
                fontWeight: "bold",
                opacity: 0.7,
                cursor: "pointer",
              }}
            >
              ×
            </div>
          </div>
        </div>

        {/* ② 日付 + TF + 🔗 + 📷 */}
        <div
          style={{
            marginTop: "4px",
            fontSize: "11px",
            opacity: 0.8,
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {formatDate(item.trade_date)}

          <span
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={(e) => {
              e.stopPropagation();
              setShowTfMenu(!showTfMenu);
            }}
          >
            {item.tf ?? "NONE"} ▼
          </span>

          {/* 🔗 */}
          <span
            style={{
              cursor: "pointer",
              color: hasRecentScreenshot ? "limegreen" : "#555",
              fontSize: "16px",
            }}
            onClick={(e) => {
    e.stopPropagation();
    window.location.href = "/history_image";
  }}

          >
            🔗
          </span>

          {/* 📷 */}
          <span style={{ opacity: 0.6, fontSize: "14px" }}>📷</span>

          {showTfMenu && (
            <div
              style={{
                position: "absolute",
                background: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "4px",
                padding: "4px",
                fontSize: "11px",
                zIndex: 999,
                top: "20px",
                right: 0,
                whiteSpace: "nowrap",
              }}
            >
              {["4H", "1H", "30M", "15M", "5M"].map((tf) => (
                <div
                  key={tf}
                  style={{ padding: "2px 6px", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateBoard(item.id, { tf }, item).then(load);
                    setShowTfMenu(false);
                  }}
                >
                  {tf}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================
  // 🟢 長期カード
  // =========================================
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
      style={{
        width: "90%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        background: "#020617",
        border: item.direction === "long" ? "2px solid #22c55e" : "2px solid #a81616",
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
      {/* ① ペア + 方向 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <b style={{ marginRight: "20px" }}>{item.pair}</b>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleDirection(item).then(load);
          }}
          style={{
            fontSize: "11px",
            padding: "2px 10px",
            borderRadius: "4px",
            border: "none",
            background: item.direction === "long" ? "#22c55e" : "#ef4444",
            color: "white",
            cursor: "pointer",
          }}
        >
          {item.direction.toUpperCase()}
        </button>
      </div>

      {/* ② 日付 + TF */}
      <div style={{ marginTop: "4px", fontSize: "11px", opacity: 0.8 }}>
        <div style={{ marginTop: "4px", fontSize: "11px", opacity: 0.8, position: "relative" }}>
          {formatDate(item.trade_date)}{" "}
          <span
            style={{ cursor: "pointer", textDecoration: "underline", marginLeft: "4px" }}
            onClick={(e) => {
              e.stopPropagation();
              setShowTfMenu(!showTfMenu);
            }}
          >
            {item.tf ?? "NONE"} ▼
          </span>

          {showTfMenu && (
            <div
              style={{
                position: "absolute",
                background: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "4px",
                padding: "4px",
                fontSize: "11px",
                zIndex: 999,
                top: "20px",
                right: 0,
                whiteSpace: "nowrap",
              }}
            >
              {["4H", "1H", "30M", "15M", "5M"].map((tf) => (
                <div
                  key={tf}
                  style={{ padding: "2px 6px", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateBoard(item.id, { tf }, item).then(load);
                    setShowTfMenu(false);
                  }}
                >
                  {tf}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ③ 操作 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "8px",
          gap: "12px",
        }}
      >
        {/* ← */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            moveToWait(item).then(load);
          }}
          style={{
            fontSize: "11px",
            padding: "2px 6px",
            borderRadius: "4px",
            background: "#475569",
            color: "white",
            border: "none",
          }}
        >
          ←
        </button>

        {/* 🔗 */}
        <span
          style={{
            cursor: "pointer",
            color: hasRecentScreenshot ? "limegreen" : "#555",
            fontSize: "16px",
          }}
          onClick={(e) => {
    e.stopPropagation();
    window.location.href = "/history_image";
  }}

        >
          🔗
        </span>

        {/* 📷 */}
        <span style={{ opacity: 0.6 }}>📷</span>

        {/* 短期生成 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const fullItem = boards.find((b) => b.id === item.id);
            createShort(fullItem).then(load);
          }}
          style={{
            fontSize: "11px",
            padding: "2px 8px",
            borderRadius: "4px",
            background: "#130e1d6b",
            color: "white",
            border: "none",
          }}
        >
          短期
        </button>
      </div>
    </div>
  );
};