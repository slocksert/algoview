import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface BenchmarkResultsProps {
  results: Record<string, Record<string, number>>;
  algorithms: string[];
  dataSize: number;
}

type BenchmarkData = {
  operation: string;
  [key: string]: number | string; // Add index signature to allow any string indexing
};

// Map of operation names from API to display names
const operationMapping: Record<string, string> = {
  "Insert": "Inserir",
  "Search": "Buscar",
  "Delete": "Deletar",
  "Traverse": "Travessia",
  "Traversal": "Travessia"  // Adding both possible API names to map to same display name
};

const BenchmarkResults = ({ results, algorithms, dataSize }: BenchmarkResultsProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  useEffect(() => {
    if (!svgRef.current || !results) return;
    
    renderChart();
  }, [results, algorithms]);
  
  const renderChart = () => {
    if (!results || !svgRef.current) return;
    
    // Get available operations from the actual results
    const apiOperations = new Set<string>();
    Object.values(results).forEach(data => {
      Object.keys(data).forEach(op => apiOperations.add(op));
    });
    
    // Create chart data from results
    const chartData = Array.from(apiOperations).map(apiOp => {
      const displayOp = operationMapping[apiOp] || apiOp;
      const dataPoint: BenchmarkData = { operation: displayOp };
      
      // Add data for each algorithm
      algorithms.forEach(algo => {
        if (results[algo] && typeof results[algo][apiOp] === 'number') {
          dataPoint[algo] = results[algo][apiOp];
        } else {
          dataPoint[algo] = 0;
        }
      });
      
      return dataPoint;
    });
    
    console.log("Chart data:", chartData);
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 800; 
    const height = 400;
    const margin = { top: 20, right: 120, bottom: 40, left: 50 };
    const contentWidth = width - margin.left - margin.right;
    const contentHeight = height - margin.top - margin.bottom;
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Get all display operation names available in chart data
    const operations = chartData.map(d => d.operation);
    
    const x = d3.scaleBand()
      .domain(operations)
      .range([0, contentWidth])
      .padding(0.3);
    
    // Find the maximum value to set the y scale
    const maxValue = d3.max(chartData, d => {
      const values = algorithms.map(algo => typeof d[algo] === 'number' ? d[algo] as number : 0);
      return Math.max(...values, 0.1); // Ensure there's a minimum value
    }) || 10;
    
    const y = d3.scaleLinear()
      .domain([0, maxValue * 1.1]) // Add 10% padding at the top
      .range([contentHeight, 0]);
    
    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${contentHeight})`)
      .call(d3.axisBottom(x));
    
    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(5));
    
    // Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -contentHeight / 2)
      .attr("text-anchor", "middle")
      .text("Tempo (ms)");
    
    // Add bars
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Map of algorithm names to display names
    const algoDisplayNames: Record<string, string> = {
      "bst": "BST",
      "avl": "AVL",
      "hash": "HASH",
      "skip-list": "SKIP LIST"
    };
    
    algorithms.forEach((algo, i) => {
      g.selectAll(`.bar-${algo}`)
        .data(chartData)
        .enter()
        .append("rect")
        .attr("class", `bar-${algo}`)
        .attr("x", d => (x(d.operation) || 0) + x.bandwidth() / algorithms.length * i)
        .attr("width", x.bandwidth() / algorithms.length)
        .attr("y", d => {
          const value = (d[algo] as number) || 0;
          return y(value);
        })
        .attr("height", d => {
          const value = (d[algo] as number) || 0;
          return contentHeight - y(value);
        })
        .attr("fill", colorScale(algo))
        .on("mouseover", function(_event, d) {
          d3.select(this).attr("opacity", 0.8);
          
          const value = (d[algo] as number) || 0;
          
          // Add tooltip
          g.append("text")
            .attr("class", "tooltip")
            .attr("x", (x(d.operation) || 0) + x.bandwidth() / 2)
            .attr("y", y(value) - 5)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .text(`${algoDisplayNames[algo]}: ${value.toFixed(2)} ms`);
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 1);
          g.selectAll(".tooltip").remove();
        });
    });
    
    // Add legend
    const legend = g.append("g")
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
        .text(algoDisplayNames[algo] || algo.toUpperCase());
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação de Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <svg ref={svgRef} />
        
        <div className="mt-4 text-sm text-gray-500">
          <p>Resultado do Benchmark: {dataSize.toLocaleString()} elementos</p>
          <p>Barras menores indicam melhor performance (menos tempo)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BenchmarkResults;
