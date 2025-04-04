import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { TreeNode, TreeVisualizerProps, ViewDimensions, D3Node, D3Link } from "@/lib/definitions";

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ data, type = "bst" }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ViewDimensions>({ width: 800, height: 500 });

  // Resize handler to make the visualization responsive
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Get the parent container width
        const containerWidth = containerRef.current.offsetWidth;
        setDimensions({
          width: Math.max(containerWidth, 400), // Minimum width of 400px
          height: Math.max(500, containerWidth * 0.6) // Height proportional to width
        });
      }
    };

    // Initial size
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // D3 rendering logic
  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up the tree layout
    const { width, height } = dimensions;
    const margin = { top: 40, right: 20, bottom: 40, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create a hierarchical layout
    const root = d3.hierarchy(data) as D3Node;

    // Get tree depth to adjust spacing
    const maxDepth = root.height || 3;

    // Determine node sizing based on tree type and depth
    const nodeRadius = 20;

    // For deeper trees, adjust spacing
    const verticalSpacing = Math.min(80, innerHeight / (maxDepth + 1));

    // Create the tree layout with proper sizing
    const treeLayout = d3.tree<TreeNode>()
      .size([innerWidth, innerHeight])
      .nodeSize([nodeRadius * 3, verticalSpacing]) // Adjust node spacing
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 2));

    // Compute the tree layout
    treeLayout(root);

    // Calculate the bounding box of all nodes
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    root.descendants().forEach(d => {
      minX = Math.min(minX, d.x ?? 0);
      maxX = Math.max(maxX, d.x ?? 0);
      minY = Math.min(minY, d.y ?? 0);
      maxY = Math.max(maxY, d.y ?? 0);
    });

    // Add padding to ensure nodes aren't cut off
    minX -= nodeRadius * 2;
    maxX += nodeRadius * 2;
    minY -= nodeRadius * 2;
    maxY += nodeRadius * 2;

    // Calculate scaling factor to fit tree in view
    const xScale = innerWidth / (maxX - minX);
    const yScale = innerHeight / (maxY - minY);
    const scale = Math.min(xScale, yScale, 1); // Don't scale up beyond 1

    // Create transform for centering and scaling
    const centerX = innerWidth / 2 - ((minX + maxX) / 2) * scale;
    const centerY = innerHeight / 2 - ((minY + maxY) / 2) * scale;

    // Apply the transform to a container group
    const g = svg.append("g")
      .attr("transform", `translate(${centerX},${centerY}) scale(${scale})`);

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3]) // Allow zooming from 0.1x to 3x
      .on("zoom", (event) => {
        svg.attr("transform", event.transform.toString());
      });

    d3.select(svgRef.current)
      .call(zoom)
      .on("dblclick.zoom", null); // Disable double-click to zoom

    // Add links (edges)
    g.selectAll<SVGPathElement, D3Link>(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d => {
        const sourceY = d.source.y ?? 0;
        const targetY = d.target.y ?? 0;
        const sourceX = d.source.x ?? 0;
        const targetX = d.target.x ?? 0;
        return `M${sourceX},${sourceY}
                C${sourceX},${(sourceY + targetY) / 2}
                 ${targetX},${(sourceY + targetY) / 2}
                 ${targetX},${targetY}`;
      })
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-width", 1.5);

    // Add node groups
    const nodeGroups = g
      .selectAll<SVGGElement, D3Node>(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", d => `node ${d.children ? "node--internal" : "node--leaf"}`)
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // Add node circles with color based on tree type
    nodeGroups
      .append("circle")
      .attr("r", nodeRadius)
      .attr("fill", () => {
        switch (type) {
          case "avl":
            return "#4CAF50"; // Green for AVL
          default:
            return "#FF5722"; // Orange for BST
        }
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Add node text labels
    nodeGroups
      .append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(d => d.data.value);

    // Add legend for tree type
    svg.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text(`Visualização de ${type.toUpperCase()} `);

    // Add zoom instructions
    svg.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#666")
      .text("Use o scroll para ampliar/reduzir");

  }, [data, type, dimensions]);

  return (
    <div ref={containerRef} className="tree-visualizer w-full overflow-hidden">
      <div className="flex justify-center">
        <svg
          ref={svgRef}
          className="mx-auto border border-gray-200 rounded-md"
          style={{ maxHeight: '75vh' }}
        ></svg>
      </div>
    </div>
  );
};

export default TreeVisualizer;
