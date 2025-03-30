import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { BarChartVisualizerProps } from "@/lib/definitions";


const BarChartVisualizer = ({ 
  data, 
  width = 500, 
  height = 300, 
  animate = true 
}: BarChartVisualizerProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return; // Adiciona verificação para evitar erros com dados vazios
    
    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current);
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Create a group element for the chart
    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.map((_, i) => i.toString()))
      .range([0, chartWidth])
      .padding(0.3);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data) || 100])
      .range([chartHeight, 0]);
    
    // Add X axis
    chart.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale));
    
    // Add Y axis
    chart.append("g")
      .call(d3.axisLeft(yScale));
    
    // Add bars
    chart.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (_, i) => xScale(i.toString()) || 0)
      .attr("width", xScale.bandwidth())
      .attr("fill", (_d, i) => d3.interpolateViridis(i / data.length))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);
      
    if (animate) {
      chart.selectAll(".bar")
        .attr("y", chartHeight)
        .attr("height", 0)
        .transition()
        .duration(800)
        .attr("y", d => yScale(d as number))
        .attr("height", d => chartHeight - yScale(d as number));
    } else {
      chart.selectAll(".bar")
        .attr("y", d => yScale(d as number))
        .attr("height", d => chartHeight - yScale(d as number));
    }
    
    // Add labels
    chart.selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (_, i) => (xScale(i.toString()) || 0) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d as number) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .text(d => d);
      
    if (animate) {
      chart.selectAll(".label")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .delay(400)
        .style("opacity", 1);
    }
    
  }, [data, width, height, animate, margin.top, margin.right, margin.bottom, margin.left]);

  return (
    <div className="w-full overflow-hidden">
      <svg 
        ref={svgRef} 
        width="100%" 
        height={height} 
        viewBox={`0 0 ${width} ${height}`} 
        preserveAspectRatio="xMidYMid meet"
      ></svg>
    </div>
  );
};

export default BarChartVisualizer;
