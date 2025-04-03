import { useState } from "react";
import HashingVisualizer from "@/components/visualizers/HashingVisualizer";

export default function HashingView() {
  const [hashData] = useState<Map<string, number>>(
    new Map([])
  );

  return <HashingVisualizer data={hashData} />;
}
