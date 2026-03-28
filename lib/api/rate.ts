
export const getRate = (pair: string, rates: any) => {
  console.log("🔥 pair:", pair);
  console.log("🔥 rates:", rates);
  console.log("🔥 rates.rates:", rates?.rates);

  if (!rates?.rates) return null;

  const base = pair.slice(0, 3);
  const quote = pair.slice(3, 6);

  console.log("🔥 base:", base);
  console.log("🔥 quote:", quote);

  const baseRate = rates.rates[base];
  const quoteRate = rates.rates[quote];

  console.log("🔥 baseRate:", baseRate);
  console.log("🔥 quoteRate:", quoteRate);

  if (!baseRate || !quoteRate) return null;

  return quoteRate / baseRate;
};