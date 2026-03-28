
import { fetchRates } from "@/lib/api/fetchRates";
import { getRate } from "@/lib/api/rate";
import { calcPivot, getNearestPivot } from "@/lib/calc/pivot";

export const getMarketData = async (pair: string) => {
  console.log("🔥 getMarketData start:", pair);

  const rates = await fetchRates(pair);

if (!rates) return null;

const price = rates.current_price;
console.log("🔥 rates:", rates);
  console.log("🔥 price:", price);
  console.log("🔥 current_price:", rates?.current_price);

  if (!price) {
    console.log("❌ price死んでる");
    return null;
  }

  const high = price * 1.01;
  const low = price * 0.99;
  const close = price;

  const pivots = calcPivot(high, low, close);

  const nearest = getNearestPivot(price, pivots);

  return {
    price,
    pivots,
    nearest
  };
};