import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListVisualizerProps } from "@/lib/definitions";


const ListVisualizer = ({ data }: ListVisualizerProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [listType, setListType] = useState("singly");
  const [listData, setListData] = useState<number[]>(data);
  const [newValue, setNewValue] = useState("");
  const [newPosition, setNewPosition] = useState("0");
  const [animation, setAnimation] = useState<string | null>(null);
  
  // Add element to list
  const addElement = () => {
    const position = parseInt(newPosition);
    if (isNaN(position) || position < 0 || position > listData.length) {
      alert("Invalid position!");
      return;
    }
    if (!newValue) return;
    const value = parseInt(newValue);
    
    if (isNaN(value)) return;
    
    const newData = [...listData];
    if (position >= 0 && position <= newData.length) {
      newData.splice(position, 0, value);
      setListData(newData);
      setNewValue("");
    }
  };
  
  // Remove element from list
  const removeElement = () => {
    const position = parseInt(newPosition);
    if (isNaN(position) || position < 0 || position >= listData.length) {
      alert("Invalid position!");
      return;
    }
    if (listData.length === 0) return;
    
    if (position >= 0 && position < listData.length) {
      const newData = [...listData];
      newData.splice(position, 1);
      setListData(newData);
    }
  };
  
  // Run self-organizing list algorithms
  const runMoveToFront = () => {
    if (listData.length <= 1) return;
    
    setAnimation("move-to-front");
    
    // Simulate searching for an element and moving it to front
    const targetIndex = Math.floor(Math.random() * listData.length);
    setTimeout(() => {
      const newData = [...listData];
      const target = newData[targetIndex];
      newData.splice(targetIndex, 1);
      newData.unshift(target);
      setListData(newData);
      setAnimation(null);
    }, 1500);
  };
  
  const runTransposition = () => {
    if (listData.length <= 1) return;
    
    setAnimation("transposition");
    
    // Simulate searching for an element and swapping with predecessor
    const targetIndex = Math.floor(Math.random() * (listData.length - 1)) + 1;
    setTimeout(() => {
      const newData = [...listData];
      const temp = newData[targetIndex];
      newData[targetIndex] = newData[targetIndex - 1];
      newData[targetIndex - 1] = temp;
      setListData(newData);
      setAnimation(null);
    }, 1500);
  };
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current);
    const height = 200;
    const nodeRadius = 25;
    const nodeDistance = 120;
    
    const g = svg.append("g")
      .attr("transform", `translate(50, ${height / 2})`);
    
    // Draw nodes
    listData.forEach((value, i) => {
      // Node
      const nodeG = g.append("g")
        .attr("transform", `translate(${i * nodeDistance}, 0)`)
        .attr("class", "node");
      
      // Node circle
      nodeG.append("circle")
        .attr("r", nodeRadius)
        .attr("fill", () => {
          if (animation === "move-to-front" && i === 0) return "#4CAF50";
          if (animation === "transposition" && (i === 0 || i === 1)) return "#2196F3";
          return "#FF5722";
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);
      
      // Node value
      nodeG.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .attr("fill", "white")
        .attr("font-weight", "bold")
        .text(value);
      
      // For doubly linked lists, add backward pointers
      if (listType === "doubly" && i > 0) {
        // Draw backward arrow
        nodeG.append("path")
          .attr("d", `M${-nodeRadius} -5 L${-nodeDistance + nodeRadius} -5`)
          .attr("stroke", "#999")
          .attr("stroke-width", 1.5)
          .attr("fill", "none")
          .attr("marker-end", "url(#arrow)");
      }
      
      // For skip lists, add skip connections
      if (listType === "skip" && i % 2 === 0 && i < listData.length - 2) {
        const skipDistance = 2 * nodeDistance;
        nodeG.append("path")
          .attr("d", `M${nodeRadius} -15 L${skipDistance - nodeRadius} -15`)
          .attr("stroke", "#E91E63")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "5,5")
          .attr("fill", "none")
          .attr("marker-end", "url(#arrow)");
      }
    });
    
    // Define arrow marker
    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999");
    
    // Draw forward connections between nodes
    listData.forEach((_, i) => {
      if (i < listData.length - 1) {
        const startX = i * nodeDistance + nodeRadius;
        const endX = (i + 1) * nodeDistance - nodeRadius;
        
        g.append("path")
          .attr("d", `M${startX} 0 L${endX} 0`)
          .attr("stroke", "#999")
          .attr("stroke-width", 1.5)
          .attr("fill", "none")
          .attr("marker-end", "url(#arrow)");
      }
    });
    
    // If using self-organizing list algorithms, add visual cues
    if (animation) {
      if (animation === "move-to-front") {
        g.append("text")
          .attr("x", nodeDistance / 2)
          .attr("y", -60)
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .attr("fill", "#4CAF50")
          .text("Move-To-Front: Element moved to head of list");
      } else if (animation === "transposition") {
        g.append("text")
          .attr("x", nodeDistance / 2)
          .attr("y", -60)
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .attr("fill", "#2196F3")
          .text("Transposition: Elements swapped");
      }
    }
    
  }, [listData, listType, animation]);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Linked List Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={listType} onValueChange={setListType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select list type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="singly">Singly Linked List</SelectItem>
                  <SelectItem value="doubly">Doubly Linked List</SelectItem>
                  <SelectItem value="skip">Skip List</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={runMoveToFront} disabled={!!animation}>Move-To-Front</Button>
                <Button onClick={runTransposition} disabled={!!animation}>Transposition</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Modify List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Value</label>
                  <Input 
                    value={newValue} 
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Enter value"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position</label>
                  <Input 
                    value={newPosition} 
                    onChange={(e) => setNewPosition(e.target.value)}
                    placeholder="Enter position"
                    type="number"
                    min="0"
                    max={listData.length.toString()}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={addElement}>Add Element</Button>
                <Button onClick={removeElement} variant="destructive">Remove Element</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Linked List Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <svg 
              ref={svgRef} 
              width="100%" 
              height="200" 
              viewBox="0 0 800 200"
              preserveAspectRatio="xMidYMid meet"
            ></svg>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-gray-500">
        <p>This visualization shows a {listType} linked list with {listData.length} elements.</p>
        {listType === "skip" && (
          <p>Skip lists allow for faster traversal by providing "shortcuts" between distant nodes.</p>
        )}
      </div>
    </div>
  );
};

export default ListVisualizer;
