import { InteractiveCanvasProps } from "@/lib/definitions";
import { useEffect, useRef, useState } from "react";


export function InteractiveCanvas({ 
  width, 
  height, 
  onDrag,
  render 
}: InteractiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  
  // Make canvas fill container
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const parent = canvasRef.current.parentElement;
        canvasRef.current.width = width || parent.clientWidth;
        canvasRef.current.height = height || parent.clientHeight;
        
        // Re-render if needed
        if (render && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            render(ctx, canvasRef.current.width, canvasRef.current.height);
          }
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [width, height, render]);
  
  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastPosition({
      x: e.clientX,
      y: e.clientY
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const dx = e.clientX - lastPosition.x;
    const dy = e.clientY - lastPosition.y;
    
    if (onDrag) {
      onDrag(dx, dy);
    }
    
    setLastPosition({
      x: e.clientX,
      y: e.clientY
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  
  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'block', // Removes inline spacing
        width: '100%',
        height: '100%',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    />
  );
}
