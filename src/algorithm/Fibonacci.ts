import { TreeNode, AlgorithmOperation, AlgorithmResult } from "@/lib/definitions";

export function runFibonacciTreeAlgorithm(treeData: TreeNode, options: AlgorithmOperation): AlgorithmResult {
  // For demonstration, we'll simulate Fibonacci heap behavior with our tree structure
  const fibTree = JSON.parse(JSON.stringify(treeData)) as TreeNode; // Deep clone

  let message = '';
  let success = true;
  
  switch (options.operation) {
    case 'insert':
      // In a Fibonacci heap, insertion is simple - just add at the root level
      insertNode(fibTree, options.value);
      message = `Value ${options.value} was inserted into Fibonacci tree`;
      break;
    case 'delete':
      success = deleteNode(fibTree, options.value);
      message = success ? `Value ${options.value} was deleted from Fibonacci tree` : 
                         `Value ${options.value} not found for deletion`;
      break;
    case 'search':
      success = searchNode(fibTree, options.value);
      message = success ? `Value ${options.value} was found` : `Value ${options.value} not found`;
      break;
    case 'update':
      success = updateNode(fibTree, options.value, options.newValue || 0);
      message = success ? `Value ${options.value} was updated to ${options.newValue}` : 
                         `Value ${options.value} not found for update`;
      break;
  }
  
  return {
    newTree: fibTree,
    operation: options.operation,
    success,
    message
  };
}

// Improved Fibonacci heap operations following Knuth's algorithms
function insertNode(tree: TreeNode, value: number): void {
  // In a real Fibonacci heap, we would:
  // 1. Create a new node as a new tree in the root list
  // 2. Update the min pointer if needed
  // 3. Increment the size counter
  
  if (!tree.children) {
    tree.children = [];
  }
  
  // Knuth's optimization: Insert directly at root level for O(1) insertion
  tree.children.push({ value });
  
  // Ensure the potential new minimum is correctly positioned
  consolidateRoots(tree);
}

// Consolidation operation to maintain heap order property
function consolidateRoots(tree: TreeNode): void {
  if (!tree.children || tree.children.length <= 1) return;
  
  // Sort children by value to simulate min-heap property
  tree.children.sort((a, b) => a.value - b.value);
  
  // Limit the number of children to log n as per Fibonacci heap theory
  // This is a simplification, as real consolidation would merge trees of the same degree
  const maxRootNodes = Math.ceil(Math.log2(tree.children.length + 1));
  if (tree.children.length > maxRootNodes) {
    // Consolidate: Merge trees with same rank
    // For this simulation, we simply keep the smallest ones in the root list
    // and make the others children of appropriate nodes
    while (tree.children.length > maxRootNodes) {
      const lastNode = tree.children.pop();
      if (lastNode) {
        // Find the appropriate place to merge this node
        let mergeTarget = findMergeTarget(tree.children);
        if (!mergeTarget.children) mergeTarget.children = [];
        mergeTarget.children.push(lastNode);
        // Preserve heap order
        mergeTarget.children.sort((a, b) => a.value - b.value);
      }
    }
  }
}

function findMergeTarget(nodes: TreeNode[]): TreeNode {
  // In a real implementation, we would find a node with the same degree
  // For this simplified version, we pick the node with fewest children
  let minChildren = Infinity;
  let target = nodes[0];
  
  for (const node of nodes) {
    const childCount = node.children ? node.children.length : 0;
    if (childCount < minChildren) {
      minChildren = childCount;
      target = node;
    }
  }
  
  return target;
}

// Improved search function that properly checks all nodes
function searchNode(tree: TreeNode, value: number): boolean {
  // Check the current node's value
  if (tree.value === value) return true;
  
  // If no children, value not found
  if (!tree.children || tree.children.length === 0) return false;
  
  // Check all children recursively
  for (let i = 0; i < tree.children.length; i++) {
    if (searchNode(tree.children[i], value)) {
      return true;
    }
  }
  
  return false;
}

function deleteNode(tree: TreeNode, value: number, parent: TreeNode | null = null): boolean {
  // In a real Fibonacci heap, delete would:
  // 1. Find the node
  // 2. Decrease its key to negative infinity
  // 3. Extract the minimum (which would now be our target)
  
  if (tree.value === value && parent) {
    // Found the node to delete
    if (parent.children) {
      const index = parent.children.findIndex(child => child.value === value);
      if (index !== -1) {
        // If node has children, add them to the parent's children list (like extract-min)
        if (tree.children && tree.children.length > 0) {
          // Add all children to the root list
          parent.children.splice(index, 1, ...tree.children);
        } else {
          // Just remove the node
          parent.children.splice(index, 1);
        }
        
        // After deleting, consolidate to maintain heap structure
        consolidateRoots(parent);
        return true;
      }
    }
  }
  
  // Recursively search in children
  if (tree.children) {
    for (let i = 0; i < tree.children.length; i++) {
      if (deleteNode(tree.children[i], value, tree)) {
        return true;
      }
    }
  }
  
  return false;
}

// Helper function to get tree depth (used for visualization balance)
function getTreeDepth(node: TreeNode): number {
  if (!node || !node.children || node.children.length === 0) {
    return 1;
  }
  
  let maxChildDepth = 0;
  for (const child of node.children) {
    const depth = getTreeDepth(child);
    if (depth > maxChildDepth) {
      maxChildDepth = depth;
    }
  }
  
  return maxChildDepth + 1;
}

// Improved update function with proper traversal and heap property maintenance
function updateNode(tree: TreeNode, value: number, newValue: number): boolean {
  // In Fibonacci heap, we would:
  // 1. Find the node
  // 2. Perform decrease-key or increase-key operation
  // 3. Ensure heap order is maintained
  
  // Find the node and its parent
  const result = findNodeAndParent(tree, value);
  if (!result.found) return false;
  
  const { node, parent } = result;
  
  // Update the value
  node.value = newValue;
  
  // If decreased, we might need to move up
  if (newValue < value && parent) {
    // In a real Fibonacci heap, we'd cut this node and make it a root
    // For our simulation, we'll move it directly if it's smaller than its parent
    if (newValue < parent.value) {
      // Remove from current position
      if (parent.children) {
        const index = parent.children.findIndex(child => child.value === newValue);
        if (index !== -1) {
          parent.children.splice(index, 1);
        }
      }
      
      // Add to root level of the tree
      if (!tree.children) tree.children = [];
      tree.children.push(node);
      
      // Consolidate to maintain heap structure
      consolidateRoots(tree);
    }
  } else {
    // If increased, we might need to bubble down (in a min-heap)
    // For our simulation, we'll just consolidate the subtree
    if (node.children && node.children.length > 0) {
      consolidateRoots(node);
    }
  }
  
  return true;
}

// Helper function to find a node and its parent
function findNodeAndParent(tree: TreeNode, value: number, parent: TreeNode | null = null): { found: boolean, node: TreeNode, parent: TreeNode | null } {
  if (tree.value === value) {
    return { found: true, node: tree, parent };
  }
  
  if (!tree.children || tree.children.length === 0) {
    return { found: false, node: tree, parent };
  }
  
  for (const child of tree.children) {
    const result = findNodeAndParent(child, value, tree);
    if (result.found) {
      return result;
    }
  }
  
  return { found: false, node: tree, parent };
}
