import { TreeNode, AVLNode, AlgorithmOperation, AlgorithmResult } from "@/lib/definitions";

export function runAVLAlgorithm(treeData: TreeNode, options: AlgorithmOperation): AlgorithmResult {
  // Create a proper AVL tree representation
  const avlTree = convertToAVLFormat(treeData);
  
  // Para debug - vamos imprimir a árvore para verificar a conversão
  console.log("AVL Tree após conversão:", JSON.stringify(avlTree));
  
  // Obter uma lista de todos os valores na árvore para verificação direta
  const allValues = collectAllValues(avlTree);
  console.log("Todos os valores na árvore:", allValues);
  
  let resultTree: AVLNode | null;
  let message = '';
  let success = true;
  
  switch (options.operation) {
    case 'insert':
      { 
        console.log("Verificando existência do valor:", options.value);
        const valueAlreadyExists = allValues.includes(options.value);
        console.log("Valor existe (verificado no array)?", valueAlreadyExists);
        
        if (valueAlreadyExists) {
          resultTree = avlTree; // Mantenha a árvore inalterada
          message = `Valor ${options.value} já existe na árvore. Duplicatas não são permitidas em árvores AVL.`;
          success = false;
        } else {
          resultTree = insertNode(avlTree, options.value);
          message = `Valor ${options.value} foi inserido com rebalanceamento`;
          success = true;
        }
        break; 
      }
    case 'delete':
      { 
        const valueExists = allValues.includes(options.value);
        
        if (!valueExists) {
          resultTree = avlTree;
          message = `Valor ${options.value} não encontrado para exclusão`;
          success = false;
        } else if (avlTree && avlTree.value === options.value && !avlTree.left && !avlTree.right) {
          resultTree = null;
          message = `Nó raiz ${options.value} foi excluído. Árvore agora está vazia.`;
          success = true;
        } else {
          resultTree = deleteNode(avlTree, options.value);
          message = `Valor ${options.value} foi excluído com rebalanceamento`;
          success = true;
        }
        break;
      }
    case 'search':
      { 
        console.log("Procurando valor:", options.value);
        const found = allValues.includes(options.value);
        console.log("Valor encontrado (verificado no array)?", found);
        
        resultTree = avlTree; // search doesn't modify tree
        message = found ? `Valor ${options.value} foi encontrado na árvore` : `Valor ${options.value} não encontrado na árvore`;
        success = found;
        break; 
      }
    case 'traverse':
      { 
        resultTree = avlTree; // Traverse doesn't modify the tree
        const traverseResult = traverseTree(avlTree);
        console.log("Traverse result:", traverseResult);
        message = `Traversed ${traverseResult.length} nodes in AVL tree`;
        success = true;
        break;
      }
    default:
      resultTree = avlTree;
      message = 'Nenhuma operação realizada';
      success = false;
  }
  
  // Convert back to our UI format
  const newTree = convertToUIFormat(resultTree);
  console.log("Árvore UI após operação:", JSON.stringify(newTree));
  
  return {
    newTree,
    operation: options.operation,
    success,
    message,
    result: options.operation === 'traverse' ? traverseTree(avlTree) : undefined
  };
}

// Função auxiliar para coletar todos os valores da árvore em um array
function collectAllValues(node: AVLNode | null): number[] {
  const values: number[] = [];
  
  if (!node) return values;
  
  // Use stack-based iterative traversal
  const stack: AVLNode[] = [];
  let current = node;
  
  while (current || stack.length > 0) {
    // Reach the leftmost node of the current node
    while (current) {
      stack.push(current);
      values.push(current.value); // Pre-order collection
      current = current.left;
    }
    
    // Current is null at this point
    current = stack.pop()!;
    
    // Move to the right subtree
    current = current.right;
  }
  
  return values;
}

// Helper functions

// Convert our UI tree format (children array) to AVL format (left/right with height)
function convertToAVLFormat(uiNode: TreeNode | null): AVLNode | null {
  if (!uiNode || uiNode.isEmpty) return null;
  if (uiNode.value === 0 && (!uiNode.children || uiNode.children.length === 0)) return null;
  
  // Create root AVL node
  const root: AVLNode = {
    value: Number(uiNode.value),
    left: null,
    right: null,
    height: 1
  };
  
  // Use a stack for iterative traversal
  interface StackItem {
    uiNode: TreeNode;
    avlNode: AVLNode;
  }
  
  const stack: StackItem[] = [{ uiNode, avlNode: root }];
  const processedNodes = new Map<AVLNode, boolean>();
  
  while (stack.length > 0) {
    const { uiNode, avlNode } = stack[stack.length - 1];
    
    if (processedNodes.has(avlNode)) {
      // Already processed this node, update its height
      stack.pop();
      avlNode.height = 1 + Math.max(
        getHeight(avlNode.left),
        getHeight(avlNode.right)
      );
      continue;
    }
    
    processedNodes.set(avlNode, true);
    
    if (uiNode.children && uiNode.children.length > 0) {
      // Process left child
      if (uiNode.children[0] && !uiNode.children[0].isEmpty) {
        const leftAVLNode: AVLNode = {
          value: Number(uiNode.children[0].value),
          left: null,
          right: null,
          height: 1
        };
        avlNode.left = leftAVLNode;
        stack.push({ uiNode: uiNode.children[0], avlNode: leftAVLNode });
      }
      
      // Process right child
      if (uiNode.children.length > 1 && uiNode.children[1] && !uiNode.children[1].isEmpty) {
        const rightAVLNode: AVLNode = {
          value: Number(uiNode.children[1].value),
          left: null,
          right: null,
          height: 1
        };
        avlNode.right = rightAVLNode;
        stack.push({ uiNode: uiNode.children[1], avlNode: rightAVLNode });
      }
    } else {
      // Leaf node, can be removed from stack
      stack.pop();
    }
  }
  
  // Update heights bottom-up (can be a separate pass)
  updateHeights(root);
  
  return root;
}

// Helper function to update heights in a bottom-up fashion
function updateHeights(root: AVLNode): void {
  const stack: AVLNode[] = [];
  const visited = new Set<AVLNode>();
  let current: AVLNode | null = root;
  
  while (current || stack.length > 0) {
    if (current) {
      stack.push(current);
      current = current.left;
    } else {
      current = stack[stack.length - 1];
      
      // If right child exists and hasn't been visited yet
      if (current.right && !visited.has(current.right)) {
        current = current.right;
      } else {
        current = stack.pop()!;
        visited.add(current);
        
        // Update height
        current.height = 1 + Math.max(
          getHeight(current.left),
          getHeight(current.right)
        );
        
        current = null; // Continue with stack
      }
    }
  }
}

// Convert AVL format back to UI tree format
function convertToUIFormat(avlNode: AVLNode | null): TreeNode {
  if (!avlNode) {
    return { value: 0, isEmpty: true };
  }
  
  // Create root UI node
  const rootUI: TreeNode = {
    value: avlNode.value
  };
  
  // Use a stack for iterative traversal
  interface StackItem {
    avlNode: AVLNode;
    uiNode: TreeNode;
  }
  
  const stack: StackItem[] = [{ avlNode, uiNode: rootUI }];
  
  while (stack.length > 0) {
    const { avlNode, uiNode } = stack.pop()!;
    
    if (avlNode.left || avlNode.right) {
      uiNode.children = [];
      
      if (avlNode.left && avlNode.right) {
        const leftUI: TreeNode = { value: avlNode.left.value };
        const rightUI: TreeNode = { value: avlNode.right.value };
        
        uiNode.children.push(leftUI);
        uiNode.children.push(rightUI);
        
        stack.push({ avlNode: avlNode.right, uiNode: rightUI });
        stack.push({ avlNode: avlNode.left, uiNode: leftUI });
      } else if (avlNode.left) {
        const leftUI: TreeNode = { value: avlNode.left.value };
        uiNode.children.push(leftUI);
        stack.push({ avlNode: avlNode.left, uiNode: leftUI });
      } else if (avlNode.right) {
        uiNode.children.push({ value: 0, isEmpty: true });
        const rightUI: TreeNode = { value: avlNode.right.value };
        uiNode.children.push(rightUI);
        stack.push({ avlNode: avlNode.right, uiNode: rightUI });
      }
    }
  }
  
  return rootUI;
}

// AVL Tree functions - Using Knuth's algorithms
function getHeight(node: AVLNode | null): number {
  if (!node) return 0;
  return node.height;
}

function getBalance(node: AVLNode | null): number {
  if (!node) return 0;
  return getHeight(node.left) - getHeight(node.right);
}

// Right rotation following Knuth's approach
function rightRotate(y: AVLNode): AVLNode {
  const x = y.left as AVLNode;
  const T2 = x.right;
  
  x.right = y;
  y.left = T2;
  
  y.height = 1 + Math.max(getHeight(y.left), getHeight(y.right));
  x.height = 1 + Math.max(getHeight(x.left), getHeight(x.right));
  
  return x;
}

// Left rotation following Knuth's approach
function leftRotate(x: AVLNode): AVLNode {
  const y = x.right as AVLNode;
  const T2 = y.left;
  
  y.left = x;
  x.right = T2;
  
  x.height = 1 + Math.max(getHeight(x.left), getHeight(x.right));
  y.height = 1 + Math.max(getHeight(y.left), getHeight(y.right));
  
  return y;
}

// Insertion algorithm following Knuth's AVL approach
function insertNode(node: AVLNode | null, value: number): AVLNode {
  // Base case
  if (!node) {
    return { value: Number(value), left: null, right: null, height: 1 };
  }
  
  if (Number(value) === node.value) {
    return node;
  }
  
  // Clone the tree structure for immutability
  let newRoot = { ...node };
  let current = newRoot;
  
  // Stack to keep track of the path
  const path: AVLNode[] = [];
  
  // Find the insertion point
  while (true) {
    path.push(current);
    
    if (value < current.value) {
      if (!current.left) {
        current.left = { value: Number(value), left: null, right: null, height: 1 };
        break;
      } else {
        current.left = { ...current.left };
        current = current.left;
      }
    } else {
      if (!current.right) {
        current.right = { value: Number(value), left: null, right: null, height: 1 };
        break;
      } else {
        current.right = { ...current.right };
        current = current.right;
      }
    }
  }
  
  // Balance the tree by working back up the path
  for (let i = path.length - 1; i >= 0; i--) {
    const current = path[i];
    
    // Update height
    current.height = 1 + Math.max(getHeight(current.left), getHeight(current.right));
    
    // Get balance factor
    const balance = getBalance(current);
    
    // Left-Left Case
    if (balance > 1 && current.left && value < current.left.value) {
      if (i === 0) {
        newRoot = rightRotate(current);
      } else {
        if (path[i-1].left === current) {
          path[i-1].left = rightRotate(current);
        } else {
          path[i-1].right = rightRotate(current);
        }
      }
    }
    // Right-Right Case
    else if (balance < -1 && current.right && value > current.right.value) {
      if (i === 0) {
        newRoot = leftRotate(current);
      } else {
        if (path[i-1].left === current) {
          path[i-1].left = leftRotate(current);
        } else {
          path[i-1].right = leftRotate(current);
        }
      }
    }
    // Left-Right Case
    else if (balance > 1 && current.left && value > current.left.value) {
      if (current.left) {
        current.left = leftRotate(current.left);
      }
      
      if (i === 0) {
        newRoot = rightRotate(current);
      } else {
        if (path[i-1].left === current) {
          path[i-1].left = rightRotate(current);
        } else {
          path[i-1].right = rightRotate(current);
        }
      }
    }
    // Right-Left Case
    else if (balance < -1 && current.right && value < current.right.value) {
      if (current.right) {
        current.right = rightRotate(current.right);
      }
      
      if (i === 0) {
        newRoot = leftRotate(current);
      } else {
        if (path[i-1].left === current) {
          path[i-1].left = leftRotate(current);
        } else {
          path[i-1].right = leftRotate(current);
        }
      }
    }
  }
  
  return newRoot;
}

// Deletion algorithm per Knuth's approach
function deleteNode(root: AVLNode | null, value: number): AVLNode | null {
  if (!root) return null;
  
  // Clone root for immutability
  let newRoot = { ...root };
  let current = newRoot;
  let parent: AVLNode | null = null;
  const pathToNode: { node: AVLNode, direction: 'left' | 'right' | 'root' }[] = [];
  
  // Find the node to delete
  while (current) {
    if (value === current.value) {
      break;
    }
    
    if (value < current.value) {
      if (!current.left) break;
      pathToNode.push({ node: current, direction: 'left' });
      parent = current;
      current.left = { ...current.left };
      current = current.left;
    } else {
      if (!current.right) break;
      pathToNode.push({ node: current, direction: 'right' });
      parent = current;
      current.right = { ...current.right };
      current = current.right;
    }
  }
  
  // Node not found
  if (current.value !== value) return newRoot;
  
  // Node found - handle deletion
  // Case 1: No children
  if (!current.left && !current.right) {
    if (!parent) {
      return null; // Deleting the root with no children
    }
    
    if (parent.left === current) {
      parent.left = null;
    } else {
      parent.right = null;
    }
  }
  // Case 2: One child
  else if (!current.left) {
    if (!parent) {
      return current.right; // Deleting the root with only right child
    }
    
    if (parent.left === current) {
      parent.left = current.right;
    } else {
      parent.right = current.right;
    }
  }
  else if (!current.right) {
    if (!parent) {
      return current.left; // Deleting the root with only left child
    }
    
    if (parent.left === current) {
      parent.left = current.left;
    } else {
      parent.right = current.left;
    }
  }
  // Case 3: Two children
  else {
    // Find the inorder successor (smallest value in right subtree)
    const successorValue = minValue(current.right);
    
    // Recursively delete the successor
    // This is a bit complex to make fully iterative, so we'll use our iterative delete
    current.right = deleteNode(current.right, successorValue);
    
    // Replace the node's value with successor value
    current.value = successorValue;
  }
  
  // Start balancing the tree bottom-up
  for (let i = pathToNode.length - 1; i >= 0; i--) {
    const { node, direction } = pathToNode[i];
    const child = direction === 'left' ? node.left : node.right;
    
    // Skip if the child has been removed
    if (!child) continue;
    
    // Update height
    child.height = 1 + Math.max(getHeight(child.left), getHeight(child.right));
    
    // Calculate balance factor
    const balance = getBalance(child);
    
    // Perform rotations if needed
    if (balance > 1 && getBalance(child.left) >= 0) {
      // Left-Left case
      if (direction === 'left') {
        node.left = rightRotate(child);
      } else if (direction === 'right') {
        node.right = rightRotate(child);
      } else {
        newRoot = rightRotate(child);
      }
    }
    else if (balance > 1 && getBalance(child.left) < 0 && child.left) {
      // Left-Right case
      child.left = leftRotate(child.left);
      if (direction === 'left') {
        node.left = rightRotate(child);
      } else if (direction === 'right') {
        node.right = rightRotate(child);
      } else {
        newRoot = rightRotate(child);
      }
    }
    else if (balance < -1 && getBalance(child.right) <= 0) {
      // Right-Right case
      if (direction === 'left') {
        node.left = leftRotate(child);
      } else if (direction === 'right') {
        node.right = leftRotate(child);
      } else {
        newRoot = leftRotate(child);
      }
    }
    else if (balance < -1 && getBalance(child.right) > 0 && child.right) {
      // Right-Left case
      child.right = rightRotate(child.right);
      if (direction === 'left') {
        node.left = leftRotate(child);
      } else if (direction === 'right') {
        node.right = leftRotate(child);
      } else {
        newRoot = leftRotate(child);
      }
    }
    
    // Update node height
    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
  }
  
  // Update root height
  if (newRoot) {
    newRoot.height = 1 + Math.max(getHeight(newRoot.left), getHeight(newRoot.right));
  }
  
  return newRoot;
}

function minValue(node: AVLNode): number {
  let current = node;
  while (current.left) {
    current = current.left;
  }
  return current.value;
}

// Add a dedicated traverse function for benchmarking and operations
function traverseTree(root: AVLNode | null): number[] {
  const result: number[] = [];
  
  if (!root) return result;
  
  // Iterative in-order traversal
  const stack: AVLNode[] = [];
  let current = root;
  
  while (current || stack.length > 0) {
    // Reach the leftmost node
    while (current) {
      stack.push(current);
      current = current.left;
    }
    
    // Process the node
    current = stack.pop()!;
    result.push(current.value);
    
    // Move to the right subtree
    current = current.right;
  }
  
  return result;
}