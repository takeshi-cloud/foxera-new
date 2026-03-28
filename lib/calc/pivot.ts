
export const calcPivot = (
  high: number,
  low: number,
  close: number,
  type: "normal" | "fibo" = "normal"
) => {
  const pp = (high + low + close) / 3;

  if (type === "normal") {
    return {
      PP: pp,
      R1: 2 * pp - low,
      S1: 2 * pp - high,
      R2: pp + (high - low),
      S2: pp - (high - low),
      R3: high + 2 * (pp - low),
      S3: low - 2 * (high - pp),
    };
  }

  // Fibonacci
  const diff = high - low;

  return {
    PP: pp,
    R1: pp + diff * 0.382,
    S1: pp - diff * 0.382,
    R2: pp + diff * 0.618,
    S2: pp - diff * 0.618,
    R3: pp + diff * 1,
    S3: pp - diff * 1,
  };
};

export const getNearestPivot = (
  price: number,
  pivots: any
) => {
  let nearestKey = "";
  let nearestValue = 0;
  let minDiff = Infinity;

  Object.entries(pivots).forEach(([key, value]) => {
    const diff = Math.abs(price - Number(value));

    if (diff < minDiff) {
      minDiff = diff;
      nearestKey = key;
      nearestValue = Number(value);
    }
  });

  return {
    level: nearestKey,
    value: nearestValue,
    distance: price - nearestValue,
  };
};