export interface TreeNode {
    value: number;
    children?: TreeNode[];
    isEmpty?: boolean;
  }
  
  export interface BSTNode {
    value: number;
    left: BSTNode | null;
    right: BSTNode | null;
  }
  
  export interface AVLNode {
    value: number;
    left: AVLNode | null;
    right: AVLNode | null;
    height: number;
  }
  
  export interface AlgorithmOperation {
    operation: 'insert' | 'delete' | 'search' | 'update' | 'balance';
    value: number;
    newValue?: number;
  }
  
  export interface AlgorithmResult {
    newTree: TreeNode;
    operation: string;
    success: boolean;
    message?: string;
    found?: boolean;
  }

  export interface TreeVisualizerProps {
    data: TreeNode;
    type?: 'bst' | 'avl' | 'b-tree' | 'fibonacci';
    preserveViewOnUpdate?: boolean;
  }

  export interface ListVisualizerProps {
    data: number[];
  }

  export interface HashingVisualizerProps {
    data: Map<string, unknown>;
  }

  export interface BarChartVisualizerProps {
    data: number[];
    width?: number;
    height?: number;
    animate?: boolean;
  }
  
  export interface InteractiveCanvasProps {
    width?: number;
    height?: number;
    onDrag?: (dx: number, dy: number) => void;
    render?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  }

  export interface AlgorithmOperation {
    operation: 'insert' | 'delete' | 'search' | 'update' | 'balance';
    value: number;
    newValue?: number;
  }
  
  export interface AlgorithmResult {
    newTree: TreeNode;
    operation: string;
    success: boolean;
    message?: string;
  }

  export interface ViewDimensions {
    width: number;
    height: number;
  }

  export type D3Node = d3.HierarchyNode<TreeNode> & {
    x?: number;
    y?: number;
    children?: D3Node[];
  }

  export interface D3Link extends d3.HierarchyLink<TreeNode> {
    source: D3Node;
    target: D3Node;
  }

  export interface TreeNodePosition {
    value: number;
    initialPos: { x: number, y: number };
    targetPos: { x: number, y: number };
  }