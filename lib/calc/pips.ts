
export const getPipSize = (pair: string) => {
  if (!pair) return 0.0001;

  // 円系
  if (pair.includes("JPY")) return 0.01;

  // GOLDとか指数はとりあえず1
  if (pair.includes("GOLD") || pair.includes("NAS")) return 1;

  return 0.0001;
};

export const toPips = (diff: number, pair: string) => {
  const pipSize = getPipSize(pair);
  return diff / pipSize;
};