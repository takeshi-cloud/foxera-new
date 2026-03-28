"use client";

import { COLS } from "./utils";

export const Header = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: COLS, // 👈 utilsと統一
        fontSize: "10px",          // 👈 小さくしてズレ防止
        opacity: 0.6,
        marginBottom: "4px",
        gap: "4px",
        padding: "0 6px"           // 👈 Rowと揃える（重要）
      }}
    >
      <div>Pair</div>
      <div>Dir①</div>
      <div>Dir②</div>
      <div>　　Ph①</div>
      <div>　　Ph②</div>
      <div>PD</div>
      <div>CS</div>
    </div>
  );
};