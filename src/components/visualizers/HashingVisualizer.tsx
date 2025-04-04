import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HashingVisualizerProps } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";


const HashingVisualizer = ({ data }: HashingVisualizerProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hashMethod, setHashMethod] = useState("universal");
  const [collisionStrategy, setCollisionStrategy] = useState("chaining");
  const [tableSize, setTableSize] = useState(10);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [hashTable, setHashTable] = useState<Map<number, Array<{key: string, value: string}>>>(
    new Map()
  );

  const { toast } = useToast();

  // Initialize hash table
  useEffect(() => {
    const initialTable = new Map<number, Array<{key: string, value: string}>>();

    // Initialize empty buckets
    for (let i = 0; i < tableSize; i++) {
      initialTable.set(i, []);
    }

    // Add initial data
    for (const [key, value] of data.entries()) {
      const hashIndex = hashFunction(key, tableSize);
      const bucket = initialTable.get(hashIndex) || [];
      bucket.push({ key, value: String(value) });
      initialTable.set(hashIndex, bucket);
    }

    setHashTable(initialTable);
  }, [data, tableSize]);

  const hashFunction = (key: string, size: number): number => {
    // Universal hashing only
    const primeNumber = 31;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * primeNumber + key.charCodeAt(i)) % size;
    }
    return hash;
  };

  const addItem = () => {
    if (!newKey || !newValue) return;

    // Verifica se a chave já existe no hash table
    const existingBucket = hashTable.get(hashFunction(newKey, tableSize));
    if (existingBucket?.some(item => item.key === newKey)) {
      toast({
        title: "Erro",
        description: "Cha chave já existe na tabela hash.",
        variant: "destructive",
      });
      return;
    }

    const hashIndex = hashFunction(newKey, tableSize);
    const newHashTable = new Map(hashTable);

    if (collisionStrategy === "chaining") {
      // For chaining, just add to the bucket
      const bucket = newHashTable.get(hashIndex) || [];
      bucket.push({ key: newKey, value: newValue });
      newHashTable.set(hashIndex, bucket);
    } else if (collisionStrategy === "linear-probing") {
      // For linear probing, find next empty slot
      let probeIndex = hashIndex;
      while (true) {
        const bucket = newHashTable.get(probeIndex) || [];
        if (bucket.length === 0) {
          newHashTable.set(probeIndex, [{ key: newKey, value: newValue }]);
          break;
        }
        probeIndex = (probeIndex + 1) % tableSize;
        // Avoid infinite loop if table is full
        if (probeIndex === hashIndex) {
          newHashTable.set(probeIndex, [...(newHashTable.get(probeIndex) || []), { key: newKey, value: newValue }]);
          break;
        }
      }
    } else if (collisionStrategy === "double-hashing") {
      // Simplified double hashing
      let i = 0;
      let probeIndex = hashIndex;
      const step = 1 + ((key) => {
        let h = 0;
        const prime = 17; // Different prime for secondary hash
        for (let i = 0; i < key.length; i++) {
          h = (h * prime + key.charCodeAt(i)) % (tableSize - 1);
        }
        return h;
      })(newKey);

      while (true) {
        const bucket = newHashTable.get(probeIndex) || [];
        if (bucket.length === 0) {
          newHashTable.set(probeIndex, [{ key: newKey, value: newValue }]);
          break;
        }
        i++;
        probeIndex = (hashIndex + i * step) % tableSize;
        // Avoid infinite loop
        if (i >= tableSize) {
          newHashTable.set(probeIndex, [...(newHashTable.get(probeIndex) || []), { key: newKey, value: newValue }]);
          break;
        }
      }
    }

    setHashTable(newHashTable);
    setNewKey("");
    setNewValue("");
  };

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const width = 700;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const boxWidth = (width - margin.left - margin.right) / tableSize;
    const boxHeight = 60;

    // Draw hash table boxes
    for (let i = 0; i < tableSize; i++) {
      g.append("rect")
        .attr("x", i * boxWidth)
        .attr("y", 0)
        .attr("width", boxWidth - 2)
        .attr("height", boxHeight)
        .attr("fill", "white")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1);

      g.append("text")
        .attr("x", i * boxWidth + boxWidth / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text(`[${i}]`);

      const bucket = hashTable.get(i) || [];
      if (bucket.length > 0) {
        // For chaining visualization
        if (collisionStrategy === "chaining") {
          bucket.forEach((item, idx) => {
            g.append("rect")
              .attr("x", i * boxWidth + 5)
              .attr("y", 30 + idx * 30)
              .attr("width", boxWidth - 12)
              .attr("height", 25)
              .attr("fill", "#4CAF50")
              .attr("stroke", "#388E3C")
              .attr("rx", 3)
              .attr("ry", 3)
              .attr("opacity", 0)
              .transition()
              .duration(500)
              .delay(idx * 100)
              .attr("opacity", 1);

            g.append("text")
              .attr("x", i * boxWidth + boxWidth / 2)
              .attr("y", 45 + idx * 30)
              .attr("text-anchor", "middle")
              .attr("font-size", "10px")
              .attr("fill", "white")
              .text(`${item.key}:${item.value}`)
              .attr("opacity", 0)
              .transition()
              .duration(500)
              .delay(idx * 100)
              .attr("opacity", 1);
          });
        } else {
          // For open addressing visualization
          g.append("rect")
            .attr("x", i * boxWidth + 5)
            .attr("y", 30)
            .attr("width", boxWidth - 12)
            .attr("height", 25)
            .attr("fill", "#2196F3")
            .attr("stroke", "#1976D2")
            .attr("rx", 3)
            .attr("ry", 3);

          g.append("text")
            .attr("x", i * boxWidth + boxWidth / 2)
            .attr("y", 45)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("fill", "white")
            .text(`${bucket[0].key}:${bucket[0].value}`);
        }
      }
    }

  }, [hashTable, tableSize, collisionStrategy]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Configuração da Função Hash</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Método de Hash</label>
                <Select value={hashMethod} onValueChange={setHashMethod} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Hashing Universal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="universal">Hashing Universal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estratégia de Colisão</label>
                <Select value={collisionStrategy} onValueChange={setCollisionStrategy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a estratégia de colisão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chaining">Encadeamento</SelectItem>
                    <SelectItem value="linear-probing">Sondagem Linear</SelectItem>
                    <SelectItem value="double-hashing">Hashing Duplo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tamanho da Tabela</label>
                <Select value={tableSize.toString()} onValueChange={(value) => setTableSize(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho da tabela" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chave</label>
                  <Input
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Digite a chave"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor</label>
                  <Input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Digite o valor"
                  />
                </div>
              </div>
              <Button onClick={addItem} className="w-full">Adicionar à Tabela Hash</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visualização da Tabela Hash</CardTitle>
        </CardHeader>
        <CardContent>
          <svg
            ref={svgRef}
            width="100%"
            height="400"
            viewBox="0 0 700 400"
            preserveAspectRatio="xMidYMid meet"
          ></svg>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500">
        <p>Esta visualização mostra uma tabela hash usando a função hash universal com {collisionStrategy} para resolução de colisões.</p>
      </div>
    </div>
  );
};

export default HashingVisualizer;
