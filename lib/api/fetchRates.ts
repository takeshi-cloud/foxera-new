
import { supabase } from "../supabase";
export const fetchRates = async (pair: string) => {
  console.log("🔥 fetch start:", pair);

  const cleanPair = pair.trim().toUpperCase();

 const { data, error } = await supabase
  .from("pivot_levels")
  .select("*")
  .ilike("pair", `%${cleanPair}%`);

  console.log("🔥 supabase data:", data);
   console.log("🔥 cleanPair:", cleanPair);
  console.log("🔥 data:", data);
  console.log("🔥 error:", error);

  if (error) {
    console.log("❌ supabase error:", error);
    return null;
  }

  return data?.[0] || null;
};