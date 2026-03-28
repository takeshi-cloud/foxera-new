
// ===== 分類 =====
export const splitBoards = (boards: any[]) => {
  return {
    long: boards.filter(b => b.timeframe_type === "long"),
    short: boards.filter(b => b.timeframe_type === "short"),
    wait: boards.filter(b => !b.timeframe_type)
  };
};

// ===== フィルター =====
export const filterBoards = (boards: any[], filter: string) => {
  if (filter === "all") return boards;
  return boards.filter(b => b.direction === filter);
};

// ===== フェーズ抽出 =====
export const getPhaseBoards = (boards: any[], phase: string, filter: string) => {
  return filterBoards(boards, filter).filter(b => b.phase === phase);
};

// ===== 状況生成 =====
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