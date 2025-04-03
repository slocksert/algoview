/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import BenchmarkResults from "./BenchmarkResults";
import { runBenchmarks, BenchmarkResultsType } from "@/lib/benchmarking";

const BenchmarkingPanel = () => {
  const [dataSize, setDataSize] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BenchmarkResultsType | null>(null);
  const [activeTab, setActiveTab] = useState("performance");
  const [selectedDataStructures, setSelectedDataStructures] = useState([
    "bst", "avl", "hash", "skip-list"
  ]);
  const { toast } = useToast();

  const runBenchmark = async () => {
    if (selectedDataStructures.length === 0) {
      toast({
        title: "Nenhuma Estrutura de Dados Selecionada",
        description: "Por favor, selecione pelo menos uma estrutura de dados para benchmark.",
        variant: "destructive",
      });
      return;
    }

    console.log("Iniciando benchmark com tamanho de dados:", dataSize);
    setIsRunning(true);
    setProgress(0);
    setResults(null);
    
    toast({
      title: "Benchmark Iniciado",
      description: `Executando benchmarks com tamanho de dados: ${dataSize}`,
    });
    
    try {
      // Run real benchmarks using Benchmark.js
      const benchmarkResults = await runBenchmarks(
        selectedDataStructures, 
        dataSize,
        (progress) => {
          console.log("Progresso do benchmark:", progress);
          setProgress(progress);
        }
      );
      
      console.log("Resultados do benchmark:", benchmarkResults);
      setResults(benchmarkResults);
      
      toast({
        title: "Benchmark Concluído",
        description: "Veja os resultados nos gráficos abaixo",
      });
    } catch (error) {
      console.error("Erro no benchmark:", error);
      toast({
        title: "Erro no Benchmark",
        description: "Ocorreu um erro ao executar os benchmarks",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };
  
  const exportResults = () => {
    if (!results) return;
    
    const jsonData = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `knuth-benchmark-results-${dataSize}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    
    toast({
      title: "Resultados Exportados",
      description: "Resultados do benchmark salvos como JSON",
    });
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Benchmark de Algoritmos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tamanho dos Dados: {dataSize.toLocaleString()}</Label>
                <Slider
                  value={[dataSize]}
                  min={100}
                  max={10000}
                  step={100}
                  onValueChange={(vals) => setDataSize(vals[0])}
                  disabled={isRunning}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Selecione as Estruturas de Dados para Benchmark</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "bst", label: "Árvore Binária de Busca" },
                    { id: "avl", label: "Árvore AVL" },
                    { id: "hash", label: "Tabela Hash" },
                    { id: "skip-list", label: "Lista Skip" },
                  ].map(item => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={item.id}
                        checked={selectedDataStructures.includes(item.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDataStructures(prev => [...prev, item.id]);
                          } else {
                            setSelectedDataStructures(prev => prev.filter(id => id !== item.id));
                          }
                        }}
                        disabled={isRunning}
                      />
                      <label 
                        htmlFor={item.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={runBenchmark} 
                  disabled={isRunning || selectedDataStructures.length === 0}
                  className="flex-1"
                >
                  {isRunning ? "Executando..." : "Executar Benchmark"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={exportResults}
                  disabled={!results}
                  className="flex-1"
                >
                  Exportar Resultados
                </Button>
              </div>
              
              {isRunning && (
                <div className="space-y-2">
                  <Label>Progresso</Label>
                  <Progress value={progress} />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="performance" className="flex-1">Desempenho</TabsTrigger>
                  <TabsTrigger value="memory" className="flex-1">Uso de Memória</TabsTrigger>
                  <TabsTrigger value="comparison" className="flex-1">Comparação</TabsTrigger>
                </TabsList>
                
                <TabsContent value="performance" className="mt-4">
                  {results ? (
                    <BenchmarkResults 
                      results={results} 
                      algorithms={selectedDataStructures} 
                      dataSize={dataSize} 
                    />
                  ) : (
                    <Card>
                      <CardContent className="p-4">
                        <div className="h-64 flex items-center justify-center bg-gray-50">
                          Execute o benchmark para ver os resultados de desempenho
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="memory" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="h-64 flex items-center justify-center bg-gray-50">
                        O uso de memória é apenas estimado - restrições do navegador impedem a análise precisa de memória
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="comparison" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      {results ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Comparação de Complexidade de Algoritmos</h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-2 border rounded">
                              <div className="font-bold">BST</div>
                              <div className="text-sm">O(log n) média</div>
                              <div className="text-sm">O(n) pior caso</div>
                            </div>
                            <div className="text-center p-2 border rounded">
                              <div className="font-bold">AVL</div>
                              <div className="text-sm">O(log n) garantido</div>
                            </div>
                            <div className="text-center p-2 border rounded">
                              <div className="font-bold">Tabela Hash</div>
                              <div className="text-sm">O(1) média</div>
                              <div className="text-sm">O(n) pior caso</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center bg-gray-50">
                          Execute o benchmark para comparar algoritmos
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo dos Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">
                Benchmark concluído com tamanho de dados: <strong>{dataSize.toLocaleString()}</strong>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.keys(results).length > 0 && (
                  <>
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Busca Mais Rápida</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {Object.entries(results)
                          .filter(([_, data]) => data.Search !== undefined)
                          .sort((a, b) => (a[1].Search || 0) - (b[1].Search || 0))[0] && (
                          <div>
                            <div className="text-3xl font-bold">
                              {Object.entries(results)
                                .filter(([_, data]) => data.Search !== undefined)
                                .sort((a, b) => (a[1].Search || 0) - (b[1].Search || 0))[0][0].toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {Object.entries(results)
                                .filter(([_, data]) => data.Search !== undefined)
                                .sort((a, b) => (a[1].Search || 0) - (b[1].Search || 0))[0][1].Search.toFixed(2)} ms
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Inserção Mais Rápida</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {Object.entries(results)
                          .filter(([_, data]) => data.Insert !== undefined)
                          .sort((a, b) => (a[1].Insert || 0) - (b[1].Insert || 0))[0] && (
                          <div>
                            <div className="text-3xl font-bold">
                              {Object.entries(results)
                                .filter(([_, data]) => data.Insert !== undefined)
                                .sort((a, b) => (a[1].Insert || 0) - (b[1].Insert || 0))[0][0].toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {Object.entries(results)
                                .filter(([_, data]) => data.Insert !== undefined)
                                .sort((a, b) => (a[1].Insert || 0) - (b[1].Insert || 0))[0][1].Insert.toFixed(2)} ms
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Melhor Geral</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div>
                          <div className="text-3xl font-bold">
                            {Object.entries(results)
                              .map(([algo, ops]) => ({
                                algo,
                                avg: Object.values(ops).reduce((sum: number, val: number) => sum + val, 0) / Object.values(ops).length
                              }))
                              .sort((a, b) => a.avg - b.avg)[0]?.algo.toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-500">Melhor desempenho médio</div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BenchmarkingPanel;
