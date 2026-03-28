
export const RightPanel = ({ market }: any) => {
  return (
    <div
      style={{
        height: "100%",
        padding: "12px",
        color: "white",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div>📈 リアルタイム価格</div>

      {Array.isArray(market) ? (
        market.map((m: any) => (
          <div key={m.pair} style={{ fontSize: "18px" }}>
            {m.pair} : {m.price}
          </div>
        ))
      ) : (
        <div>{market?.price ?? "-"}</div>
      )}
    </div>
  );
};