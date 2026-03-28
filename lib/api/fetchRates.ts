export const fetchRates = async (pair: string) => {
  const symbol = pair.toUpperCase(); // USDJPY など
  const API_KEY = process.env.NEXT_PUBLIC_TWELVEDATA_KEY;

  const url = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${API_KEY}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json?.price) {
      console.log("❌ TwelveData error:", json);
      return null;
    }

    return {
      pair,
      current_price: Number(json.price),
    };
  } catch (e) {
    console.log("❌ fetchRates error:", e);
    return null;
  }
};