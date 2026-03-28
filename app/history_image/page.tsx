"use client";

import { Suspense } from "react";
import History from "./History";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ color: "white" }}>Loading...</div>}>
      <History />
    </Suspense>
  );
}