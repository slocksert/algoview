import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TreeVisualizer from "@/components/visualizers/TreeVisualizer";
import TreeOperations from "@/components/TreeOperations";
import { useToast } from "@/hooks/use-toast";
import { runBSTAlgorithm } from "@/algorithm/Bst";
import { runAVLAlgorithm } from "@/algorithm/Avl";
import { runBTreeAlgorithm } from "@/algorithm/Btree";
import { runFibonacciTreeAlgorithm } from "@/algorithm/Fibonacci";
import { TreeNode, AlgorithmOperation } from "@/lib/definitions";

export default function DataStructuresView() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'bst' | 'avl' | 'b-tree' | 'fibonacci'>("bst");
  const [isRunning, setIsRunning] = useState(false);
  const [operationMessage, setOperationMessage] = useState("");
  const [searchResult, setSearchResult] = useState<string>("");
  const { toast } = useToast();

  const [treeData, setTreeData] = useState<TreeNode>({
    value: 50,
    children: [
      { value: 30, children: [{ value: 20 }, { value: 40 }] },
      { value: 70, children: [{ value: 60 }, { value: 80 }] }
    ]
  });

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

  const executeOperation = (operation: AlgorithmOperation) => {
    if (isRunning) return;
    setIsRunning(true);
    setOperationMessage("");
    setSearchResult("");

    toast({
      title: "Algoritmo Iniciado",
      description: `Executando operação ${operation.operation} em ${selectedAlgorithm}`,
    });

    let result;

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
        
        if (operation.operation === 'search') {
          setSearchResult(result.found 
            ? `Valor ${operation.value} encontrado na árvore` 
            : `Valor ${operation.value} não encontrado na árvore`);
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
      description: result?.message || `Operação ${operation.operation} concluída`,
    });
  };

  const exportData = () => {
    const dataToExport = JSON.stringify(treeData);
    const filename = `dados-${selectedAlgorithm}.json`;
    
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

  const handleAlgorithmChange = (value: string) => {
    setSelectedAlgorithm(value as 'bst' | 'avl' | 'b-tree' | 'fibonacci');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={selectedAlgorithm} onValueChange={handleAlgorithmChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o Tipo de Árvore" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bst">BST</SelectItem>
            <SelectItem value="avl">AVL</SelectItem>
            <SelectItem value="b-tree">B Tree</SelectItem>
            <SelectItem value="fibonacci">Fibonacci Tree</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button onClick={generateRandomTreeData} disabled={isRunning}>Gerar Árvore Aleatória</Button>
          <Button variant="outline" onClick={exportData}>Exportar Dados</Button>
        </div>
      </div>

      <TreeOperations 
        onExecuteOperation={executeOperation} 
        isRunning={isRunning} 
        selectedAlgorithm={selectedAlgorithm} 
      />

      <Card>
        <CardContent className="p-6">
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
            <TreeVisualizer data={treeData} type={selectedAlgorithm} />
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500">
        <p>Esta visualização mostra a estrutura e operações de {selectedAlgorithm.toUpperCase()}.</p>
      </div>
    </div>
  );
}
