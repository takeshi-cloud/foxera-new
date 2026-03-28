
import { calcPivot, getNearestPivot } from "@/lib/calc/pivot";
import { supabase } from "@/lib/supabase";

export async function getMarketData(pair: string) {
  const { data, error } = await supabase
    .from("prices")
    .select("*")
    .eq("pair", pair)
    .maybeSingle();

  console.log("data:", data);
  console.log("error:", error);

  if (error || !data) return null;

  const price = data.price;

  const high = price + 1;
  const low = price - 1;
  const close = price;

  const pivots = calcPivot(high, low, close);
  const nearest = getNearestPivot(price, pivots);

  return {
    price,
    pivots,
    nearest,
  };
}