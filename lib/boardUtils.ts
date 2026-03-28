// =========================================
// 🟦 監視候補（WAIT の母集団）
// =========================================
// WAIT は DB に保存しないので、
// 「監視候補の全ペア」から board に存在しないペアを WAIT として扱う。
//
// 必要に応じて増やしてOK。
// （ユーザーが追加する WAIT ペアは別管理でもOK）
const ALL_PAIRS = [
  "USDJPY",
  "EURJPY",
  "GBPJPY",
  "GBPUSD",
  "EURUSD",
  "GOLD",
  "NASDAQ",
];


// =========================================
// 🟥 分類（LONG / SHORT / WAIT）
// =========================================
// WAIT = board に存在しないペア
// LONG = timeframe_type === "long"
// SHORT = timeframe_type === "short"
export const splitBoards = (boards: any[]) => {
  const long = boards.filter(b => b.timeframe_type === "long");
  const short = boards.filter(b => b.timeframe_type === "short");

  // board に存在するペア
  const usedPairs = new Set(boards.map(b => b.pair));

  // WAIT = ALL_PAIRS - usedPairs
  const wait = ALL_PAIRS.filter(p => !usedPairs.has(p));

  return { long, short, wait };
};


// =========================================
// 🟩 フィルター（方向フィルター）
// =========================================
export const filterBoards = (boards: any[], filter: string) => {
  if (filter === "all") return boards;
  return boards.filter(b => b.direction === filter);
};


// =========================================
// 🟨 フェーズ抽出（フェーズごとに抽出）
// =========================================
export const getPhaseBoards = (boards: any[], phase: string, filter: string) => {
  return filterBoards(boards, filter).filter(b => b.phase === phase);
};


// =========================================
// 🟧 状況生成（LONG/SHORT の状態一覧）
// =========================================
// WAIT は DB に存在しないので対象外。
// board に存在するペアだけを対象にする。
export const buildStatus = (boards: any[]) => {
  const pairs = [...new Set(boards.map(b => b.pair))];

  return pairs.map(pair => {
    const long = boards.find(b => b.pair === pair && b.timeframe_type === "long");
    const short = boards.find(b => b.pair === pair && b.timeframe_type === "short");

    return {
      pair,
      longPhase: long?.phase || "-",
      shortPhase: short?.phase || "-",
      longDir: long?.direction || "-",
      shortDir: short?.direction || "-"
    };
  });
};