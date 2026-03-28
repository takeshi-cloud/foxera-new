
import { getPhaseColor, COLS, formatPhase } from "./utils";

export const Row = ({ card, shortBoards, activePair, setActivePair }: any) => {

  const normalize = (pair: string) =>
    pair?.replace("/", "").toUpperCase();

  const isActive =
    normalize(activePair) === normalize(card.pair);

  // ↓ あとは既存コード
  // ===== 同じペアの短期を取得 =====
  const s = shortBoards.find(
    (b: any) => b.pair === card.pair
  );

  // ===== L / S バッジ =====
  const DirBadge = (dir: string | null) => {
    if (!dir) {
      return <span style={{ opacity: 0.3 }}>-</span>;
    }

    const isLong = dir === "long";

    return (
      <div
        style={{
          width: "20px",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "13px",
          borderRadius: "4px",
          background: isLong ? "#16a34a" : "#dc2626",
          color: "white"
        }}
      >
        {isLong ? "L" : "S"}
      </div>
    );
  };

  return (
    
    <div
    onClick={() => setActivePair(card.pair)}   // ★追加
style={{
  display: "grid",
  gridTemplateColumns: COLS,
  gap: "4px",

  background: "#020617", // ← 常に固定

  padding: "4px 6px",
  borderRadius: "6px",
  marginBottom: "4px",
  fontSize: "13px",
  alignItems: "center",

  border: isActive
    ? "2px solid #ff4d6d"
    : "1px solid #1e293b",

  boxShadow: isActive
    ? "0 0 0 2px #ff00cc, 0 0 12px #ff00cc, 0 0 24px #ff4d6d"
    : "none",

  transform: isActive
    ? "scale(1.02)"
    : "scale(1)",

  zIndex: isActive ? 10 : 1,

  cursor: "pointer",
  transition: "all 0.15s ease"
}}
    >
      {/* Pair（強調） */}
      
      <div
        style={{
          fontWeight: "bold",
          fontSize: "14px",         // 👈 目立たせる
          letterSpacing: "0.3px"
        }}
      >
        {card.pair}
      </div>

      {/* Dir①（長期） */}
      <div style={{ textAlign: "center" }}>
        {DirBadge(card.direction)}
      </div>

      {/* Dir②（短期） */}
      <div style={{ textAlign: "center" }}>
        {s ? DirBadge(s.direction) : "-"}
      </div>

      {/* L-phase（5文字固定） */}
      <div
        style={{
          background: getPhaseColor(card.phase),
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "11px",
          textAlign: "center",
          fontWeight:"bold",
          minWidth: "48px"          // 👈 ズレ防止
        }}
      >
        {formatPhase(card.phase)}
      </div>

      {/* S-phase */}
      <div
        style={{
          background: s ? getPhaseColor(s.phase) : "#333",
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "11px",
          textAlign: "center",
          fontWeight:"bold",
          minWidth: "48px"
        }}
      >
        {s ? formatPhase(s.phase) : "-"}
      </div>

      {/* PD */}
      <div style={{ textAlign: "center", opacity: 0.5 }}>
        -
      </div>

      {/* CS */}
      <div style={{ textAlign: "center", opacity: 0.5 }}>
        -
      </div>

      <div style={{ fontSize: "10px", opacity: 0.6 }}>
  {card.price?.toFixed(2)}
</div>
    </div>
  );
};