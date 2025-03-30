import { TreeNode, AlgorithmOperation, AlgorithmResult } from "@/lib/definitions";

// B-tree has a more complex implementation, this is simplified
export function runBTreeAlgorithm(treeData: TreeNode, options: AlgorithmOperation): AlgorithmResult {
  // For simplicity, we'll simulate B-tree behavior by modifying the binary tree
  // In a real implementation, we'd have a dedicated B-tree class
  const bTree = JSON.parse(JSON.stringify(treeData)) as TreeNode; // Deep clone
  
  let message = '';
  let success = true;
  
  // Simplified B-tree simulation
  switch (options.operation) {
    case 'insert':
      // Find a place to insert in the tree maintaining balance
      success = insertValue(bTree, options.value);
      message = success ? `Value ${options.value} was inserted into B-tree` : 
                         `Value ${options.value} already exists`;
      break;
    case 'delete':
      success = deleteValue(bTree, options.value);
      message = success ? `Value ${options.value} was deleted from B-tree` : 
                         `Value ${options.value} not found for deletion`;
      break;
    case 'search':
      success = searchValue(bTree, options.value);
      message = success ? `Value ${options.value} was found` : `Value ${options.value} not found`;
      break;
    case 'update':
      success = updateValue(bTree, options.value, options.newValue || 0);
      message = success ? `Value ${options.value} was updated to ${options.newValue}` : 
                         `Value ${options.value} not found for update`;
      break;
  }
  
  return {
    newTree: bTree,
    operation: options.operation,
    success,
    message
  };
}

// Simplified B-tree operations (using our tree format)
function insertValue(node: TreeNode, value: number): boolean {
  // For demonstrating a B-tree-like insertion (simplified)
  if (!node.children) {
    node.children = [];
  }
  
  // If we have fewer than 2 children or we're at a leaf
  if (node.children.length < 2) {
    // Add as a child
    node.children.push({ value });
    // Sort the children by value to maintain B-tree properties
    node.children.sort((a, b) => a.value - b.value);
    return true;
  }
  
  // Find the appropriate child subtree
  if (value < node.value) {
    return insertValue(node.children[0], value);
  } else {
    return insertValue(node.children[1], value);
  }
}

// Improved search function for B-tree
function searchValue(node: TreeNode, value: number): boolean {
  // Check the current node
  if (node.value === value) return true;
  
  // If no children, value not found
  if (!node.children || node.children.length === 0) return false;
  
  // Check all children recursively
  for (let i = 0; i < node.children.length; i++) {
    if (searchValue(node.children[i], value)) {
      return true;
    }
  }
  
  return false;
}

function deleteValue(node: TreeNode, value: number, parent: TreeNode | null = null): boolean {
  // Simple delete implementation (not a true B-tree delete)
  if (node.value === value && parent) {
    // Found the node to delete
    // If this is a leaf, simply remove it from parent's children
    if (!node.children || node.children.length === 0) {
      if (parent.children) {
        parent.children = parent.children.filter(child => child.value !== value);
      }
      return true;
    }
    
    // Otherwise, if it has a single child, replace with the child
    if (node.children && node.children.length === 1) {
      // Replace this node with its child
      const index = parent.children!.findIndex(child => child.value === value);
      if (index !== -1) {
        parent.children![index] = node.children[0];
      }
      return true;
    }
    
    // Otherwise, replace with successor (simplified)
    if (node.children && node.children.length > 1) {
      // Find minimum in right subtree
      const successor = findMin(node.children[1]);
      node.value = successor;
      // Remove the successor from its original position
      return deleteValue(node.children[1], successor, node);
    }
  }
  
  // If not found and has children, search in children
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      if (deleteValue(node.children[i], value, node)) {
        return true;
      }
    }
  }
  
  return false;
}

function findMin(node: TreeNode): number {
  if (!node.children || node.children.length === 0) {
    return node.value;
  }
  return findMin(node.children[0]);
}

// Improved update function for B-tree
function updateValue(node: TreeNode, value: number, newValue: number): boolean {
  // Check current node
  if (node.value === value) {
    node.value = newValue;
    return true;
  }
  
  // If no children, value not found
  if (!node.children || node.children.length === 0) return false;
  
  // Check all children recursively
  for (let i = 0; i < node.children.length; i++) {
    if (updateValue(node.children[i], value, newValue)) {
      return true;
    }
  }
  
  return false;
}
