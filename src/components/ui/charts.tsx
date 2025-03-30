import  { useEffect, useRef } from "react";
import * as d3 from "d3";

interface ChartProps {
  data: any[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export const BarChart = ({ 
  data,
  width = 600,
  height = 300,
  margin = { top: 20, right: 30, bottom: 40, left: 40 }
}: ChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const contentWidth = width - margin.left - margin.right;
    const contentHeight = height - margin.top - margin.bottom;
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, contentWidth])
      .padding(0.3);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .nice()
      .range([contentHeight, 0]);
    
    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${contentHeight})`)
      .call(d3.axisBottom(x));
    
    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(y));
    
    // Add bars
    g.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.label) || 0)
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => contentHeight - y(d.value))
      .attr("fill", "steelblue");
  }, [data, width, height, margin]);
  
  return <svg ref={svgRef} />;
};

export const LineChart = ({
  data,
  width = 600,
  height = 300,
  margin = { top: 20, right: 30, bottom: 40, left: 40 }
}: ChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const contentWidth = width - margin.left - margin.right;
    const contentHeight = height - margin.top - margin.bottom;
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const x = d3.scalePoint()
      .domain(data.map(d => d.label))
      .range([0, contentWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .nice()
      .range([contentHeight, 0]);
    
    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${contentHeight})`)
      .call(d3.axisBottom(x));
    
    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(y));
    
    // Add line
    const line = d3.line<any>()
      .x(d => x(d.label) || 0)
      .y(d => y(d.value));
    
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Add dots
    g.selectAll(".dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.label) || 0)
      .attr("cy", d => y(d.value))
      .attr("r", 5)
      .attr("fill", "steelblue");
  }, [data, width, height, margin]);
  
  return <svg ref={svgRef} />;
};

export const Radar = ({
  data,
  width = 400,
  height = 400,
  margin = { top: 50, right: 50, bottom: 50, left: 50 }
}: ChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const radius = Math.min(width, height) / 2 - Math.max(margin.top, margin.right, margin.bottom, margin.left);
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);
    
    // Features
    const features = data.map(d => d.label);
    
    // Scale
    const radialScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([0, radius]);
    
    // Angles
    const angleSlice = (Math.PI * 2) / features.length;
    
    // Axes
    features.forEach((feature, i) => {
      const angle = i * angleSlice;
      const lineCoords = {
        x: radius * Math.cos(angle - Math.PI / 2),
        y: radius * Math.sin(angle - Math.PI / 2)
      };
      
      // Draw axis line
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", lineCoords.x)
        .attr("y2", lineCoords.y)
        .attr("stroke", "#999")
        .attr("stroke-width", 1);
      
      // Add axis label
      g.append("text")
        .attr("x", 1.1 * lineCoords.x)
        .attr("y", 1.1 * lineCoords.y)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .text(feature);
    });
    
    // Concentric circles
    const circles = [0.2, 0.4, 0.6, 0.8, 1];
    circles.forEach(circle => {
      g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radius * circle)
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2");
    });
    
    // Path function
    const radarLine = d3.lineRadial<any>()
      .radius(d => radialScale(d.value))
      .angle((_, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);
    
    // Draw radar area
    g.append("path")
      .datum(data)
      .attr("d", radarLine)
      .attr("fill", "rgba(70, 130, 180, 0.3)")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2);
    
    // Add dots
    data.forEach((d, i) => {
      const angle = i * angleSlice;
      const x = radialScale(d.value) * Math.cos(angle - Math.PI / 2);
      const y = radialScale(d.value) * Math.sin(angle - Math.PI / 2);
      
      g.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 4)
        .attr("fill", "steelblue");
    });
  }, [data, width, height, margin]);
  
  return <svg ref={svgRef} />;
};
