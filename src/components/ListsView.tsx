import { useState } from "react";
import ListVisualizer from "@/components/visualizers/ListVisualizer";

export default function ListsView() {
  const [listData] = useState<number[]>([15, 25, 35, 45, 55]);

  return <ListVisualizer data={listData} />;
}
