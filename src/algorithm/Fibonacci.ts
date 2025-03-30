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

// Simplified Fibonacci heap operations
function insertNode(tree: TreeNode, value: number): void {
  // For demonstration, add as a new leaf in a balanced way
  if (!tree.children) {
    tree.children = [];
  }
  
  // If less than 2 children, just add directly
  if (tree.children.length < 2) {
    tree.children.push({ value });
    return;
  }
  
  // Find the shallowest child to add to
  let minDepth = Infinity;
  let targetChild = null;
  
  for (const child of tree.children) {
    const depth = getTreeDepth(child);
    if (depth < minDepth) {
      minDepth = depth;
      targetChild = child;
    }
  }
  
  // Insert into the shallowest subtree
  if (targetChild) {
    insertNode(targetChild, value);
  }
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
  if (tree.value === value && parent) {
    // Remove this node from parent's children
    if (parent.children) {
      const index = parent.children.findIndex(child => child.value === value);
      if (index !== -1) {
        // If the node has children, move them up
        if (tree.children && tree.children.length > 0) {
          // Add this node's children to parent
          parent.children.splice(index, 1, ...tree.children);
        } else {
          // Just remove the node
          parent.children.splice(index, 1);
        }
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

// Helper function to get tree depth
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

// Fixed update function with proper traversal
function updateNode(tree: TreeNode, value: number, newValue: number): boolean {
  // Check current node
  if (tree.value === value) {
    tree.value = newValue;
    return true;
  }
  
  // If no children, value not found
  if (!tree.children || tree.children.length === 0) return false;
  
  // Check all children recursively
  for (let i = 0; i < tree.children.length; i++) {
    if (updateNode(tree.children[i], value, newValue)) {
      return true;
    }
  }
  
  return false;
}
