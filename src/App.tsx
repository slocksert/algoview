import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import TreeVisualizer from "@/components/visualizers/TreeVisualizer";
import ListVisualizer from "@/components/visualizers/ListVisualizer";
import HashingVisualizer from "@/components/visualizers/HashingVisualizer";
import BenchmarkingPanel from "@/components/BenchmarkingPanel";
import ChallengesPanel from "@/components/ChallengesPanel";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import { runBSTAlgorithm } from "@/algorithm/Bst";
import { runAVLAlgorithm } from "@/algorithm/Avl";
import { runBTreeAlgorithm } from "@/algorithm/Btree";
import { runFibonacciTreeAlgorithm } from "@/algorithm/Fibonacci";
import { TreeNode, AlgorithmOperation } from "@/lib/definitions";

export default function KnuthVisualizer() {
  const [activeTab, setActiveTab] = useState("data-structures");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("bst");
  const [isRunning, setIsRunning] = useState(false);
  const [operationMessage, setOperationMessage] = useState("");
  const [operationValue, setOperationValue] = useState<number>(0);
  const [newValue, setNewValue] = useState<number>(0);
  const [selectedOperation, setSelectedOperation] = useState<string>("insert");
  const [searchResult, setSearchResult] = useState<string>("");
  const { toast } = useToast();

  const [treeData, setTreeData] = useState<TreeNode>({
    value: 50,
    children: [
      { value: 30, children: [{ value: 20 }, { value: 40 }] },
      { value: 70, children: [{ value: 60 }, { value: 80 }] }
    ]
  });
  const [listData] = useState<number[]>([15, 25, 35, 45, 55]);
  const [hashData] = useState<Map<string, number>>(new Map([["key1", 10], ["key2", 20], ["key3", 30]]));
  const [barData] = useState<number[]>([10, 20, 30, 40, 50]);

  const generateRandomTreeData = () => {
    try {
      if (isRunning) return;
      
      setIsRunning(true);
      setSearchResult("");
      
      if (selectedAlgorithm === "bst") {
        const generateBST = (depth: number, min: number, max: number): TreeNode | null => {
          if (depth <= 0 || max <= min) return null;
          
          const value = Math.floor(Math.random() * (max - min)) + min;
          const node: TreeNode = { value };
          const leftChild = generateBST(depth - 1, min, value);
          const rightChild = generateBST(depth - 1, value + 1, max);
          
          if (leftChild || rightChild) {
            node.children = [];
            if (leftChild) node.children.push(leftChild);
            if (rightChild) node.children.push(rightChild);
          }
          
          return node;
        };
        
        const newTree = generateBST(3, 1, 100);
        if (newTree) {
          setTreeData(newTree);
        }
      } else {
        const generateTree = (depth: number): TreeNode | null => {
          if (depth <= 0) return null;
          
          const value = Math.floor(Math.random() * 100) + 1;
          const node: TreeNode = { value };
          const childCount = Math.floor(Math.random() * 3);
          
          if (childCount > 0 && depth > 1) {
            node.children = [];
            for (let i = 0; i < childCount; i++) {
              const child = generateTree(depth - 1);
              if (child) node.children.push(child);
            }
          }
          
          return node;
        };
        
        const newTree = generateTree(3);
        if (newTree) {
          setTreeData(newTree);
        }
      }
      
      toast({
        title: "Árvore Gerada",
        description: "Uma nova árvore aleatória foi gerada",
      });
    } catch (error) {
      console.error("Erro ao gerar árvore:", error);
      toast({
        title: "Erro",
        description: "Falha ao gerar árvore aleatória",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const executeOperation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setOperationMessage("");
    setSearchResult("");

    if (!operationValue && selectedOperation !== 'search' && selectedOperation !== 'balance') {
      toast({
        title: "Erro de Validação",
        description: "Por favor, insira um valor para a operação",
        variant: "destructive",
      });
      setIsRunning(false);
      return;
    }

    toast({
      title: "Algoritmo Iniciado",
      description: `Executando operação ${selectedOperation} em ${selectedAlgorithm}`,
    });

    let result;
    const operation: AlgorithmOperation = {
      operation: selectedOperation as 'insert' | 'delete' | 'search' | 'update' | 'balance',
      value: operationValue
    };

    if (selectedOperation === 'update') {
      operation.newValue = newValue;
    }

    try {
      switch (selectedAlgorithm) {
        case "bst":
          result = runBSTAlgorithm(treeData, operation);
          break;
        case "avl":
          result = runAVLAlgorithm(treeData, operation);
          break;
        case "b-tree":
          result = runBTreeAlgorithm(treeData, operation);
          break;
        case "fibonacci":
          result = runFibonacciTreeAlgorithm(treeData, operation);
          break;
        default:
          throw new Error("Algoritmo não suportado");
      }

      if (result) {
        if (result.newTree) {
          setTreeData(result.newTree);
        }
        
        if (result.message) {
          setOperationMessage(result.message);
        }
        
        if (selectedOperation === 'search') {
          setSearchResult(result.found 
            ? `Valor ${operationValue} encontrado na árvore` 
            : `Valor ${operationValue} não encontrado na árvore`);
        }
      }
    } catch (error) {
      console.error("Erro na operação:", error);
      toast({
        title: "Erro na Operação",
        description: error instanceof Error ? error.message : "Falha ao executar a operação",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }

    console.log(result);

    toast({
      title: "Operação Executada",
      description: result?.message || `Operação ${selectedOperation} concluída`,
    });
  };

  const exportData = () => {
    let dataToExport;
    let filename;

    switch (selectedAlgorithm) {
      case "bst":
        dataToExport = JSON.stringify(treeData);
        filename = "dados-bst.json";
        break;
      default:
        dataToExport = JSON.stringify(barData);
        filename = "dados-algoritmo.json";
    }

    const blob = new Blob([dataToExport], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);

    toast({
      title: "Exportação Bem-Sucedida",
      description: `Dados exportados como ${filename}`,
    });
  };

  return (
    <>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Visualizador de Algoritmo de Knuth</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="data-structures">Estruturas de Dados</TabsTrigger>
            <TabsTrigger value="hashing">Hashing</TabsTrigger>
            <TabsTrigger value="lists">Listas Ligadas</TabsTrigger>
            <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
            <TabsTrigger value="challenges">Desafios</TabsTrigger>
          </TabsList>

          <TabsContent value="data-structures" className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o Tipo de Árvore" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bst">Árvore de Busca Binária</SelectItem>
                  <SelectItem value="avl">Árvore AVL</SelectItem>
                  <SelectItem value="b-tree">Árvore B</SelectItem>
                  <SelectItem value="fibonacci">Árvore de Fibonacci</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button onClick={generateRandomTreeData} disabled={isRunning}>Gerar Árvore Aleatória</Button>
                <Button variant="outline" onClick={exportData}>Exportar Dados</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-1">
                <Select
                  value={selectedOperation}
                  onValueChange={setSelectedOperation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Operação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insert">Inserir</SelectItem>
                    <SelectItem value="delete">Deletar</SelectItem>
                    <SelectItem value="search">Buscar</SelectItem>
                    <SelectItem value="update">Atualizar</SelectItem>
                    {selectedAlgorithm === "avl" && <SelectItem value="balance">Balancear</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-1">
                <Input
                  type="number"
                  placeholder="Insira o valor"
                  value={operationValue || ""}
                  onChange={(e) => setOperationValue(parseInt(e.target.value) || 0)}
                />
              </div>

              {selectedOperation === 'update' && (
                <div className="md:col-span-1">
                  <Input
                    type="number"
                    placeholder="Novo valor"
                    value={newValue || ""}
                    onChange={(e) => setNewValue(parseInt(e.target.value) || 0)}
                  />
                </div>
              )}

              <div className={`md:col-span-${selectedOperation === 'update' ? 2 : 3}`}>
                <Button
                  onClick={executeOperation}
                  disabled={isRunning}
                  variant="default"
                  className="w-full">
                  {isRunning ? "Executando..." : `Executar ${selectedOperation}`}
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <ErrorBoundary>
                  {operationMessage && (
                    <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-md">
                      {operationMessage}
                    </div>
                  )}

                  {searchResult && (
                    <div className={`mb-4 p-2 rounded-md ${
                      searchResult.includes("não encontrado")
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {searchResult}
                    </div>
                  )}

                  <div className="flex justify-center">
                    {selectedAlgorithm === "bst" && <TreeVisualizer data={treeData} />}
                    {selectedAlgorithm === "avl" && <TreeVisualizer data={treeData} type="avl" />}
                    {selectedAlgorithm === "b-tree" && <TreeVisualizer data={treeData} type="b-tree" />}
                    {selectedAlgorithm === "fibonacci" && <TreeVisualizer data={treeData} type="fibonacci" />}
                  </div>
                </ErrorBoundary>
              </CardContent>
            </Card>

            <div className="text-sm text-gray-500">
              <p>Esta visualização mostra a estrutura e operações de {selectedAlgorithm.toUpperCase()}.</p>
            </div>
          </TabsContent>

          <TabsContent value="hashing" className="space-y-4">
            <HashingVisualizer data={hashData} />
          </TabsContent>

          <TabsContent value="lists" className="space-y-4">
            <ListVisualizer data={listData} />
          </TabsContent>

          <TabsContent value="benchmarking" className="space-y-4">
            <BenchmarkingPanel />
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            <ChallengesPanel />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </>
  );
}
