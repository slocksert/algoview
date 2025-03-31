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

const BenchmarkResults = ({ results, algorithms, dataSize }: BenchmarkResultsProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  useEffect(() => {
    if (!svgRef.current || !results) return;
    
    renderChart();
  }, [results, algorithms]);
  
  const renderChart = () => {
    if (!results || !svgRef.current) return;
    
    const operations = ["Insert", "Search", "Delete", "Traversal"];
    const chartData = operations.map(op => ({
      operation: op,
      ...Object.fromEntries(
        Object.entries(results)
          .filter(([algo]) => algorithms.includes(algo))
          .map(([algo, data]) => [
            algo, data[op] || 0
          ])
      )
    }));
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 800; // Increased from 600
    const height = 400; // Increased from 300
    const margin = { top: 20, right: 120, bottom: 40, left: 50 };
    const contentWidth = width - margin.left - margin.right;
    const contentHeight = height - margin.top - margin.bottom;
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleBand()
      .domain(operations)
      .range([0, contentWidth])
      .padding(0.3);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData as BenchmarkData[], d => {
        // Extract all numeric values that are definitely numbers (not undefined)
        const numericValues: number[] = [];
        
        Object.entries(d).forEach(([key, value]) => {
          if (key !== "operation" && typeof value === 'number') {
            numericValues.push(value);
          }
        });
        
        // If no values are found, return a default
        return numericValues.length > 0 ? Math.max(...numericValues) : 10;
      }) || 10])
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
      .text("Time (ms)");
    
    // Add bars
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
    algorithms.forEach((algo, i) => {
      g.selectAll(`.bar-${algo}`)
        .data(chartData)
        .enter()
        .append("rect")
        .attr("class", `bar-${algo}`)
        .attr("x", d => (x(d.operation) || 0) + x.bandwidth() / algorithms.length * i)
        .attr("width", x.bandwidth() / algorithms.length)
        .attr("y", d => y((d as BenchmarkData)[algo] as number || 0))
        .attr("height", d => contentHeight - y((d as BenchmarkData)[algo] as number || 0))
        .attr("fill", colorScale(algo))
        .on("mouseover", function(_event, d) {
          d3.select(this).attr("opacity", 0.8);
          
          // Add tooltip
          g.append("text")
            .attr("class", "tooltip")
            .attr("x", (x(d.operation) || 0) + x.bandwidth() / 2)
            .attr("y", y((d as BenchmarkData)[algo] as number || 0) - 5)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .text(`${((d as BenchmarkData)[algo] as number || 0).toFixed(2)} ms`);
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
        .text(algo.toUpperCase());
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <svg ref={svgRef} />
        
        <div className="mt-4 text-sm text-gray-500">
          <p>Benchmark results for data size: {dataSize.toLocaleString()} elements</p>
          <p>Lower bars indicate better performance (less time)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BenchmarkResults;
