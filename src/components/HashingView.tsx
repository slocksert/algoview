import { useState } from "react";
import HashingVisualizer from "@/components/visualizers/HashingVisualizer";

export default function HashingView() {
  const [hashData] = useState<Map<string, number>>(
    new Map([["key1", 10], ["key2", 20], ["key3", 30]])
  );

  return <HashingVisualizer data={hashData} />;
}
