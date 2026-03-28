
// ===== カラム幅（Header / Row 共通）=====
// Pair広め・Dir小さめ・Phase固定でズレ防止
export const COLS = "1.6fr 0.5fr 0.5fr 1fr 1fr 0.5fr 0.5fr";


// ===== フェーズカラー =====
export const getPhaseColor = (phase: string) => {
  switch (phase) {
    case "Pullback":
      return "#06b6d4"; // 緑（チャンス）

    case "Trigger":
      return "#eab308"; // 黄色（エントリー直前）

    case "Trend":
      return "#1e293b"; // ダーク（抑え）

    case "Reversal":
      return "#1e293b"; // ダーク（抑え）

    default:
      return "#334155";
  }
};


// ===== 方向カラー =====
export const getDirColor = (dir: string) => {
  if (dir === "long") return "#22c55e";
  if (dir === "short") return "#ef4444";
  return "#aaa";
};


// ===== フェーズ表示（5文字固定）=====
export const formatPhase = (phase: string) => {
  switch (phase) {
    case "Reversal": return "Rever";
    case "Trend": return "Trend";
    case "Pullback": return "Pullb";
    case "Trigger": return "Trigg";
    default: return "-";
  }
};