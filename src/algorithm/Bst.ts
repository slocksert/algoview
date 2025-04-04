import { TreeNode, BSTNode, AlgorithmOperation, AlgorithmResult } from "@/lib/definitions";

// BST insert operation - converts from our UI tree format
export function runBSTAlgorithm(treeData: TreeNode, options: AlgorithmOperation): AlgorithmResult {
  // Create a proper BST representation (with left/right instead of children array)
  const bstTree = convertToBSTFormat(treeData);
  
  let resultTree: BSTNode | null;
  let message = '';
  let success = true;
  
  switch (options.operation) {
    case 'insert':
      // Verificação mais rigorosa de duplicados - verifica ANTES de tentar inserir
      if (searchNode(bstTree, options.value)) {
        // Retorna a árvore exatamente como estava, sem modificações
        resultTree = bstTree;
        message = `Valor ${options.value} já existe na árvore. Duplicatas não são permitidas em BST.`;
        success = false;
      } else {
        // Só insere se não for duplicata
        resultTree = insertNode(bstTree, options.value);
        message = `Valor ${options.value} foi inserido com sucesso`;
        success = true;
      }
      break;
    case 'delete':
      // Check if value exists first
      if (!searchNode(bstTree, options.value)) {
        resultTree = bstTree;
        message = `Value ${options.value} not found for deletion`;
        success = false;
      } else if (bstTree && bstTree.value === options.value && !bstTree.left && !bstTree.right) {
        // Special case: Deleting the only node (root)
        resultTree = null;
        message = `Root node ${options.value} was deleted. Tree is now empty.`;
        success = true;
      } else {
        resultTree = deleteNode(bstTree, options.value);
        message = `Value ${options.value} was deleted successfully`;
        success = true;
      }
      break;
    case 'search':
      { const found = searchNode(bstTree, options.value);
      resultTree = bstTree; // search doesn't modify tree
      message = found ? `Value ${options.value} was found` : `Value ${options.value} not found`;
      success = found;
      break; }
    default:
      resultTree = bstTree;
      message = 'No operation performed';
      success = false;
  }
  
  // Convert back to our UI tree format
  const newTree = convertToUIFormat(resultTree);
  
  return {
    newTree,
    operation: options.operation,
    success,
    message
  };
}

// Helper functions

// Convert our UI tree format (children array) to BST format (left/right)
function convertToBSTFormat(uiNode: TreeNode | null): BSTNode | null {
  if (!uiNode || uiNode.isEmpty) return null;
  
  // Create the root node
  const root: BSTNode = {
    value: uiNode.value,
    left: null,
    right: null
  };
  
  // Use a stack to process nodes iteratively
  interface StackItem {
    uiNode: TreeNode;
    bstNode: BSTNode;
  }
  
  const stack: StackItem[] = [{ uiNode, bstNode: root }];
  
  while (stack.length > 0) {
    const { uiNode, bstNode } = stack.pop()!;
    
    if (uiNode.children && uiNode.children.length > 0) {
      // Process left child
      if (uiNode.children[0] && !uiNode.children[0].isEmpty) {
        const leftBSTNode: BSTNode = {
          value: uiNode.children[0].value,
          left: null,
          right: null
        };
        bstNode.left = leftBSTNode;
        stack.push({ uiNode: uiNode.children[0], bstNode: leftBSTNode });
      }
      
      // Process right child
      if (uiNode.children.length > 1 && !uiNode.children[1].isEmpty) {
        const rightBSTNode: BSTNode = {
          value: uiNode.children[1].value,
          left: null,
          right: null
        };
        bstNode.right = rightBSTNode;
        stack.push({ uiNode: uiNode.children[1], bstNode: rightBSTNode });
      }
    }
  }
  
  return root;
}

// Convert BST format (left/right) back to our UI tree format (children array)
function convertToUIFormat(bstNode: BSTNode | null): TreeNode {
  if (!bstNode) {
    return { value: 0, isEmpty: true };
  }
  
  // Create the root node for UI format
  const rootUI: TreeNode = {
    value: bstNode.value
  };
  
  // Use a stack to process nodes iteratively
  interface StackItem {
    bstNode: BSTNode;
    uiNode: TreeNode;
  }
  
  const stack: StackItem[] = [{ bstNode, uiNode: rootUI }];
  
  while (stack.length > 0) {
    const { bstNode, uiNode } = stack.pop()!;
    
    // If there are children, create the children array
    if (bstNode.left || bstNode.right) {
      uiNode.children = [];
      
      // Case 1: Both left and right children exist
      if (bstNode.left && bstNode.right) {
        const leftUI: TreeNode = { value: bstNode.left.value };
        const rightUI: TreeNode = { value: bstNode.right.value };
        
        uiNode.children.push(leftUI);
        uiNode.children.push(rightUI);
        
        stack.push({ bstNode: bstNode.left, uiNode: leftUI });
        stack.push({ bstNode: bstNode.right, uiNode: rightUI });
      }
      // Case 2: Only left child exists
      else if (bstNode.left) {
        const leftUI: TreeNode = { value: bstNode.left.value };
        uiNode.children.push(leftUI);
        stack.push({ bstNode: bstNode.left, uiNode: leftUI });
      }
      // Case 3: Only right child exists
      else if (bstNode.right) {
        uiNode.children.push({ value: 0, isEmpty: true });
        const rightUI: TreeNode = { value: bstNode.right.value };
        uiNode.children.push(rightUI);
        stack.push({ bstNode: bstNode.right, uiNode: rightUI });
      }
    }
  }
  
  return rootUI;
}

// BST operations following Knuth's algorithms
// Insertion algorithm with iterative approach
function insertNode(root: BSTNode | null, value: number): BSTNode {
  // Base case - creating a new node
  if (!root) {
    return { value, left: null, right: null };
  }
  
  // Clone the tree for immutability
  const newRoot = { ...root };
  let current = newRoot;
  const path: { node: BSTNode, direction: 'left' | 'right' }[] = [];
  
  // Find the insertion point
  while (true) {
    if (value === current.value) {
      return newRoot; // Value already exists, return unchanged
    }
    
    if (value < current.value) {
      if (current.left === null) {
        current.left = { value, left: null, right: null };
        break;
      } else {
        path.push({ node: current, direction: 'left' });
        current = current.left;
      }
    } else {
      if (current.right === null) {
        current.right = { value, left: null, right: null };
        break;
      } else {
        path.push({ node: current, direction: 'right' });
        current = current.right;
      }
    }
  }
  
  return newRoot;
}

// Search algorithm following Knuth's approach
function searchNode(root: BSTNode | null, value: number): boolean {
  // Tail-recursive version for efficiency (can be compiled to loops)
  let current = root;
  
  while (current) {
    if (value === current.value) {
      return true;
    }
    
    // Follow the correct path - no unnecessary comparisons
    current = value < current.value ? current.left : current.right;
  }
  
  return false;
}

// Deletion algorithm per Knuth's approach
function deleteNode(root: BSTNode | null, value: number): BSTNode | null {
  if (!root) return null;
  
  // Create a copy for immutability
  const newRoot = { ...root };
  
  if (value < root.value) {
    newRoot.left = deleteNode(root.left, value);
    return newRoot;
  } 
  
  if (value > root.value) {
    newRoot.right = deleteNode(root.right, value);
    return newRoot;
  }
  
  // Value equals root.value - this is the node to be deleted
  
  // Case 1: No children (leaf node)
  if (!root.left && !root.right) {
    return null;
  }
  
  // Case 2: Only one child
  if (!root.left) return root.right;
  if (!root.right) return root.left;
  
  // Case 3: Two children
  // Knuth's optimization: Use direct in-order successor for replacement
  newRoot.value = minValue(root.right);
  // Delete the in-order successor
  newRoot.right = deleteNode(root.right, newRoot.value);
  
  return newRoot;
}

// Minimum value finder per Knuth
function minValue(node: BSTNode): number {
  // Iterative implementation is more efficient than recursive
  let current = node;
  
  // Follow left path to the minimum
  while (current.left) {
    current = current.left;
  }
  
  return current.value;
}

