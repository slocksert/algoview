import { TreeNode, AlgorithmOperation, AlgorithmResult } from "@/lib/definitions";

// B-tree degree - controls the number of keys per node
const MIN_DEGREE = 2; // Minimum degree (t) as defined by Knuth
// In a B-tree of degree t: Each node has at most 2t-1 keys and 2t children

export function runBTreeAlgorithm(treeData: TreeNode, options: AlgorithmOperation): AlgorithmResult {
  // For simplicity, we'll simulate B-tree behavior by modifying the binary tree
  const bTree = JSON.parse(JSON.stringify(treeData)) as TreeNode; // Deep clone
  
  let message = '';
  let success = true;
  
  // Enhanced B-tree operations following Knuth's algorithms
  switch (options.operation) {
    case 'insert':
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

// Enhanced B-tree operations following Knuth's approach
function insertValue(node: TreeNode, value: number): boolean {
  // Check for duplicates first (B-trees typically don't allow duplicates)
  if (searchValue(node, value)) {
    return false;
  }
  
  if (!node.children) {
    node.children = [];
  }
  
  // B-tree insertion following Knuth's algorithm:
  // 1. If the root is full, create a new empty root and split the old root
  // 2. Insert into the appropriate leaf node, splitting nodes as needed
  
  // Check if root is full (has 2t-1 keys) and needs to be split
  const isRootFull = node.children.length >= 2 * MIN_DEGREE - 1;
  
  if (isRootFull) {
    // Create a new empty root
    const originalTree = { ...node };
    // Clear the current node
    node.value = 0;
    if (node.children) node.children = [];
    
    // Split the original root
    splitFullNode(originalTree);
    
    // Add the split results as children of the new root
    if (originalTree.children) {
      node.children = originalTree.children;
    }
  }
  
  // Now insert into the tree
  return insertNonFull(node, value);
}

// Insert into a non-full node (might recurse into children)
function insertNonFull(node: TreeNode, value: number): boolean {
  // Initialize children array if it doesn't exist
  if (!node.children) {
    node.children = [];
  }
  
  // Check if this is a leaf node
  const isLeaf = !node.children.some(child => child.children && child.children.length > 0);
  
  if (isLeaf) {
    // Just insert the value at the correct position
    let insertPos = 0;
    while (insertPos < node.children.length && value > node.children[insertPos].value) {
      insertPos++;
    }
    
    // Insert the new value
    node.children.splice(insertPos, 0, { value });
    return true;
  } else {
    // Find the child subtree where the key should be inserted
    let childIndex = 0;
    while (childIndex < node.children.length && value > node.children[childIndex].value) {
      childIndex++;
    }
    
    // Check if child exists before accessing it
    if (childIndex < node.children.length) {
      // If this child is full, split it first
      const childNode = node.children[childIndex];
      if (childNode && childNode.children && 
          childNode.children.length >= 2 * MIN_DEGREE - 1) {
        
        splitChild(node, childIndex);
        
        // After splitting, the median key is moved up to the parent
        // Determine which child to descend into based on the value
        if (value > node.children[childIndex].value) {
          childIndex++;
        }
      }
      
      // Recurse into the appropriate child
      return insertNonFull(node.children[childIndex], value);
    } else if (node.children.length > 0) {
      // If we're beyond the end, insert into the last child
      return insertNonFull(node.children[node.children.length - 1], value);
    }
    
    // Should not reach here with a well-formed tree
    return false;
  }
}

// Split a full node (has 2t-1 keys) - Knuth's algorithm
function splitFullNode(node: TreeNode): void {
  if (!node.children || node.children.length < 2 * MIN_DEGREE - 1) {
    return; // Node is not full
  }
  
  // Find the median index
  const medianIndex = Math.floor(node.children.length / 2);
  const medianValue = node.children[medianIndex].value;
  
  // Create two new child groups - left and right of median
  const leftChildren = node.children.slice(0, medianIndex);
  const rightChildren = node.children.slice(medianIndex + 1);
  
  // Update the node's value and children
  node.value = medianValue;
  
  // Create the new children structure - median as parent, original values as children
  node.children = [
    { value: getMinValue(leftChildren), children: leftChildren },
    { value: getMinValue(rightChildren), children: rightChildren }
  ];
}

// Split a child node at childIndex, moving its median key up to the parent
function splitChild(parent: TreeNode, childIndex: number): void {
  if (!parent.children || !parent.children[childIndex] || !parent.children[childIndex].children) {
    return;
  }
  
  const child = parent.children[childIndex];
  
  // Find the median
  const medianIndex = Math.floor(child.children!.length / 2);
  const medianValue = child.children![medianIndex].value;
  
  // Create two new children arrays
  const leftChildren = child.children!.slice(0, medianIndex);
  const rightChildren = child.children!.slice(medianIndex + 1);
  
  // Create a new node for the right part
  const rightNode: TreeNode = {
    value: getMinValue(rightChildren),
    children: rightChildren
  };
  
  // Update the child to represent the left part
  child.value = getMinValue(leftChildren);
  child.children = leftChildren;
  
  // Insert the median value and the new right node into the parent
  const newNode: TreeNode = { value: medianValue };
  parent.children.splice(childIndex + 1, 0, newNode, rightNode);
}

// Helper to get the minimum value in a subtree
function getMinValue(nodes: TreeNode[]): number {
  if (!nodes || nodes.length === 0) return 0;
  
  let minVal = nodes[0].value;
  for (const node of nodes) {
    if (node.value < minVal) {
      minVal = node.value;
    }
  }
  
  return minVal;
}

// Optimized search function for B-tree - follows Knuth's approach
function searchValue(node: TreeNode, value: number): boolean {
  // If the node itself has the value, we found it
  if (node.value === value) return true;
  
  // If no children, value not found
  if (!node.children || node.children.length === 0) return false;
  
  // Binary search within the node's children for optimization
  let low = 0;
  let high = node.children.length - 1;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    
    if (node.children[mid].value === value) {
      return true; // Found in this node's children
    }
    
    if (node.children[mid].value > value) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  
  // If not found in this node, check the appropriate child
  // In a B-tree, we follow the child pointer where key[i-1] < value < key[i]
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (i === node.children.length - 1 || value < node.children[i + 1].value) {
      // This is the correct child to check
      if (child && child.children && child.children.length > 0) {
        return searchValue(child, value);
      }
      break;
    }
  }
  
  return false;
}

// Delete operation following Knuth's algorithm
function deleteValue(node: TreeNode, value: number, parent: TreeNode | null = null): boolean {
  // First, check if the value exists
  if (!searchValue(node, value)) {
    return false;
  }
  
  // If the node itself has the value and it's a leaf
  if (node.value === value && (!node.children || node.children.length === 0) && parent) {
    // Simple leaf deletion
    if (parent.children) {
      parent.children = parent.children.filter(child => child.value !== value);
      return true;
    }
  }
  
  // For internal node deletion, Knuth's approach would:
  // 1. If the node has value and is internal, replace with predecessor/successor
  // 2. If the value is in a child that's about to go below minimum, merge or redistribute
  
  // If value is in this node and it's internal
  if (node.value === value && node.children && node.children.length > 0) {
    // Find predecessor (rightmost value in left subtree)
    if (node.children.length > 0) {
      const predecessor = findLargestValue(node.children[0]);
      node.value = predecessor;
      // Remove the predecessor from the left subtree
      deleteValue(node.children[0], predecessor, node);
      return true;
    }
  }
  
  // Otherwise, search in the appropriate subtree
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      // Try to delete from this child
      if (deleteValue(node.children[i], value, node)) {
        // In a full implementation, we'd rebalance here if needed
        rebalanceAfterDelete(node);
        return true;
      }
    }
  }
  
  return false;
}

// Find the largest value in a subtree
function findLargestValue(node: TreeNode): number {
  if (!node.children || node.children.length === 0) {
    return node.value;
  }
  
  // In a B-tree, the largest value is in the rightmost path
  return findLargestValue(node.children[node.children.length - 1]);
}

// Simplified rebalancing after deletion
function rebalanceAfterDelete(node: TreeNode): void {
  // In a real B-tree implementation, we would:
  // 1. Ensure each node has at least MIN_DEGREE - 1 keys
  // 2. Merge nodes if they have too few keys
  // 3. Redistribute keys if a sibling has extra keys
  
  // This is a simplified implementation for demonstration
  if (!node.children) return;
  
  // Filter out empty children
  node.children = node.children.filter(child => 
    child.children ? child.children.length > 0 : true
  );
  
  // Recursively rebalance all children
  for (const child of node.children) {
    if (child.children && child.children.length > 0) {
      rebalanceAfterDelete(child);
    }
  }
}

// Update function for B-tree according to Knuth's approach
function updateValue(node: TreeNode, oldValue: number, newValue: number): boolean {
  // In a B-tree, the cleaner approach is to:
  // 1. Delete the old value
  // 2. Insert the new value
  // This maintains the B-tree properties correctly
  
  // First check if the old value exists
  if (!searchValue(node, oldValue)) {
    return false;
  }
  
  // Then check if the new value would be a duplicate
  if (oldValue !== newValue && searchValue(node, newValue)) {
    return false;
  }
  
  // Delete the old value
  const deleteSuccess = deleteValue(node, oldValue);
  if (!deleteSuccess) return false;
  
  // Insert the new value
  return insertValue(node, newValue);
}
