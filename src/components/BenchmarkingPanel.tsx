import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast"; // Fixed import path
import * as d3 from "d3";

// Mock data for benchmarking charts
const generateMockBenchmarkData = (algorithms: string[], dataSize: number) => {
  const operations = ["Insert", "Search", "Delete", "Traversal"];
  const results: Record<string, Record<string, number>> = {};

  algorithms.forEach(algo => {
    results[algo] = {};
    operations.forEach(op => {
      // Generate mock time (ms) based on algorithm and data size
      let baseTime = Math.random() * 10;
      
      // Make some algorithms faster/slower for different operations
      if (algo === "bst" && op === "Search") baseTime *= 1.5;
      if (algo === "avl" && op === "Insert") baseTime *= 2;
      if (algo === "hash" && op === "Search") baseTime *= 0.3;
      if (algo === "skip-list" && op === "Traversal") baseTime *= 0.7;
      
      // Scale with data size (not linear for all algorithms)
      let scaleFactor = dataSize / 1000;
      if (algo === "bst") scaleFactor = Math.log2(dataSize) / Math.log2(1000);
      if (algo === "hash") scaleFactor = 1;
      
      results[algo][op] = baseTime * scaleFactor;
    });
  });
  
  return results;
};

const BenchmarkingPanel = () => {
  const [dataSize, setDataSize] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Record<string, Record<string, number>> | null>(null);
  const [activeTab, setActiveTab] = useState("performance");
  const [selectedDataStructures, setSelectedDataStructures] = useState([
    "bst", "avl", "b-tree", "hash", "skip-list"
  ]);
  const { toast } = useToast();

  const runBenchmark = () => {
    if (selectedDataStructures.length === 0) {
      toast({
        title: "No Data Structures Selected",
        description: "Please select at least one data structure to benchmark.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setResults(null);
    
    toast({
      title: "Benchmark Started",
      description: `Running benchmarks with data size: ${dataSize}`,
    });
    
    // Simulate benchmark progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Generate mock results
          const benchmarkResults = generateMockBenchmarkData(selectedDataStructures, dataSize);
          setResults(benchmarkResults);
          setIsRunning(false);
          
          toast({
            title: "Benchmark Completed",
            description: "View the results in the charts below",
          });
          
          return 100;
        }
        return newProgress;
      });
    }, 300);
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
      title: "Results Exported",
      description: "Benchmark results saved as JSON",
    });
  };
  
  const renderBarChart = () => {
    if (!results) return <div className="h-64 flex items-center justify-center bg-gray-50">Run benchmark to see results</div>;
    
    // Create the chart after the component is mounted
    setTimeout(() => {
      const operations = ["Insert", "Search", "Delete", "Traversal"];
      const chartData = operations.map(op => ({
        operation: op,
        ...Object.fromEntries(
          Object.entries(results).map(([algo, data]) => [
            algo, data[op] || 0
          ])
        )
      }));
      
      const svgRef = d3.select("#benchmark-chart");
      if (svgRef.empty()) return;
      
      svgRef.selectAll("*").remove();
      
      const width = 600;
      const height = 300;
      const margin = { top: 20, right: 120, bottom: 40, left: 50 };
      const contentWidth = width - margin.left - margin.right;
      const contentHeight = height - margin.top - margin.bottom;
      
      const svg = svgRef
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      const x = d3.scaleBand()
        .domain(operations)
        .range([0, contentWidth])
        .padding(0.3);
      
      const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => 
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          d3.max(Object.entries(d).filter(([k]) => k !== "operation").map(([_, v]) => typeof v === 'number' ? v : 0))
        ) || 10])
        .range([contentHeight, 0]);
      
      // Add X axis
      svg.append("g")
        .attr("transform", `translate(0,${contentHeight})`)
        .call(d3.axisBottom(x));
      
      // Add Y axis
      svg.append("g")
        .call(d3.axisLeft(y).ticks(5));
      
      // Y axis label
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -contentHeight / 2)
        .attr("text-anchor", "middle")
        .text("Time (ms)");
      
      // Add bars
      const algorithms = selectedDataStructures;
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
      
      algorithms.forEach((algo, i) => {
        svg.selectAll(`.bar-${algo}`)
          .data(chartData)
          .enter()
          .append("rect")
          .attr("class", `bar-${algo}`)
          .attr("x", d => (x(d.operation) || 0) + x.bandwidth() / algorithms.length * i)
          .attr("width", x.bandwidth() / algorithms.length)
          .attr("y", d => y((d as Record<string, number | string>)[algo] as number || 0))
          .attr("height", d => contentHeight - y((d as Record<string, number | string>)[algo] as number || 0))
          .attr("fill", colorScale(algo));
      });
      
      // Add legend
      const legend = svg.append("g")
        .attr("transform", `translate(${contentWidth + 10}, 0)`);
      
      algorithms.forEach((algo, i) => {
        const legendRow = legend.append("g")
          .attr("transform", `translate(0, ${i * 20})`);
        
        legendRow.append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", colorScale(algo));
          
        legendRow.append("text")
          .attr("x", 15)
          .attr("y", 10)
          .attr("text-anchor", "start")
          .style("font-size", "12px")
          .text(algo.toUpperCase());
      });
    }, 0);
    
    return <svg id="benchmark-chart"></svg>;
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Benchmarking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data Size: {dataSize.toLocaleString()}</Label>
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
                <Label>Select Data Structures to Benchmark</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "bst", label: "Binary Search Tree" },
                    { id: "avl", label: "AVL Tree" },
                    { id: "b-tree", label: "B-Tree" },
                    { id: "hash", label: "Hash Table" },
                    { id: "skip-list", label: "Skip List" },
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
                  {isRunning ? "Running..." : "Run Benchmark"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={exportResults}
                  disabled={!results}
                  className="flex-1"
                >
                  Export Results
                </Button>
              </div>
              
              {isRunning && (
                <div className="space-y-2">
                  <Label>Progress</Label>
                  <Progress value={progress} />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="performance" className="flex-1">Performance</TabsTrigger>
                  <TabsTrigger value="memory" className="flex-1">Memory Usage</TabsTrigger>
                  <TabsTrigger value="comparison" className="flex-1">Comparison</TabsTrigger>
                </TabsList>
                
                <TabsContent value="performance" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="overflow-x-auto">
                        {renderBarChart()}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="memory" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="h-64 flex items-center justify-center bg-gray-50">
                        Memory usage analysis will be shown here
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="comparison" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="h-64 flex items-center justify-center bg-gray-50">
                        Algorithm comparison will be shown here
                      </div>
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
            <CardTitle>Summary Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">
                Benchmark completed with data size: <strong>{dataSize.toLocaleString()}</strong>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.keys(results).length > 0 && (
                  <>
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Fastest Search</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {Object.entries(results)
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          .filter(([_, data]) => data.Search !== undefined)
                          .sort((a, b) => (a[1].Search || 0) - (b[1].Search || 0))[0] && (
                          <div>
                            <div className="text-3xl font-bold">
                              {Object.entries(results)
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                .filter(([_, data]) => data.Search !== undefined)
                                .sort((a, b) => (a[1].Search || 0) - (b[1].Search || 0))[0][0].toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {Object.entries(results)
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                .filter(([_, data]) => data.Search !== undefined)
                                .sort((a, b) => (a[1].Search || 0) - (b[1].Search || 0))[0][1].Search.toFixed(2)} ms
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Fastest Insert</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {Object.entries(results)
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          .filter(([_, data]) => data.Insert !== undefined)
                          .sort((a, b) => (a[1].Insert || 0) - (b[1].Insert || 0))[0] && (
                          <div>
                            <div className="text-3xl font-bold">
                              {Object.entries(results)
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                .filter(([_, data]) => data.Insert !== undefined)
                                .sort((a, b) => (a[1].Insert || 0) - (b[1].Insert || 0))[0][0].toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {Object.entries(results)
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                .filter(([_, data]) => data.Insert !== undefined)
                                .sort((a, b) => (a[1].Insert || 0) - (b[1].Insert || 0))[0][1].Insert.toFixed(2)} ms
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Best Overall</CardTitle>
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
                          <div className="text-sm text-gray-500">Best average performance</div>
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
