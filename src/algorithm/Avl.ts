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
    case 'update':
      { 
        const valueExists = allValues.includes(Number(options.value));
        const newValueExists = options.value !== options.newValue && allValues.includes(Number(options.newValue || 0));
        
        if (!valueExists) {
          resultTree = avlTree;
          message = `Valor ${options.value} não encontrado para atualização`;
          success = false;
        } else if (newValueExists) {
          resultTree = avlTree;
          message = `Novo valor ${options.newValue} já existe na árvore. Escolha um valor único.`;
          success = false;
        } else {
          resultTree = deleteNode(avlTree, options.value);
          resultTree = insertNode(resultTree, options.newValue || 0);
          message = `Valor ${options.value} foi atualizado para ${options.newValue} com rebalanceamento automático`;
          success = true;
        }
        break;
      }
    case 'balance':
      { const initialBalance = isTreeBalanced(avlTree);
      if (initialBalance) {
        resultTree = avlTree;
        message = "Árvore já está balanceada";
        success = true;
      } else {
        resultTree = rebuildBalancedTree(avlTree);
        message = "Árvore foi balanceada com sucesso";
        success = true;
      }
      break; }
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
    message
  };
}

// Função auxiliar para coletar todos os valores da árvore em um array
function collectAllValues(node: AVLNode | null): number[] {
  const values: number[] = [];
  
  function traverse(n: AVLNode | null) {
    if (!n) return;
    values.push(n.value);
    traverse(n.left);
    traverse(n.right);
  }
  
  traverse(node);
  return values;
}

// Helper functions

// Convert our UI tree format (children array) to AVL format (left/right with height)
function convertToAVLFormat(uiNode: TreeNode | null): AVLNode | null {
  if (!uiNode || uiNode.isEmpty) return null;
  
  if (uiNode.value === 0 && (!uiNode.children || uiNode.children.length === 0)) {
    return null;
  }
  
  const avlNode: AVLNode = {
    value: Number(uiNode.value),
    left: null,
    right: null,
    height: 1
  };
  
  if (uiNode.children && uiNode.children.length > 0) {
    if (uiNode.children[0]) {
      avlNode.left = convertToAVLFormat(uiNode.children[0]);
    }
    
    if (uiNode.children.length > 1 && uiNode.children[1]) {
      avlNode.right = convertToAVLFormat(uiNode.children[1]);
    }
    
    avlNode.height = Math.max(
      getHeight(avlNode.left),
      getHeight(avlNode.right)
    ) + 1;
  }
  
  return avlNode;
}

// Convert AVL format back to UI tree format
function convertToUIFormat(avlNode: AVLNode | null): TreeNode {
  if (!avlNode) {
    return { value: 0, isEmpty: true };
  }
  
  const uiNode: TreeNode = {
    value: avlNode.value
  };
  
  if (avlNode.left || avlNode.right) {
    uiNode.children = [];
    
    if (avlNode.left && avlNode.right) {
      uiNode.children.push(convertToUIFormat(avlNode.left));
      uiNode.children.push(convertToUIFormat(avlNode.right));
    } else if (avlNode.left) {
      uiNode.children.push(convertToUIFormat(avlNode.left));
    } else if (avlNode.right) {
      uiNode.children.push({ value: 0, isEmpty: true });
      uiNode.children.push(convertToUIFormat(avlNode.right));
    }
  }
  
  return uiNode;
}

// AVL Tree functions - Improved per Knuth's algorithms
function getHeight(node: AVLNode | null): number {
  if (!node) return 0;
  return node.height;
}

function getBalance(node: AVLNode | null): number {
  if (!node) return 0;
  return getHeight(node.left) - getHeight(node.right);
}

// Optimized right rotation following Knuth's approach
function rightRotate(y: AVLNode): AVLNode {
  const x = y.left as AVLNode;
  const T2 = x.right;
  
  x.right = y;
  y.left = T2;
  
  y.height = 1 + Math.max(getHeight(y.left), getHeight(y.right));
  x.height = 1 + Math.max(getHeight(x.left), getHeight(x.right));
  
  return x;
}

// Optimized left rotation following Knuth's approach
function leftRotate(x: AVLNode): AVLNode {
  const y = x.right as AVLNode;
  const T2 = y.left;
  
  y.left = x;
  x.right = T2;
  
  x.height = 1 + Math.max(getHeight(x.left), getHeight(x.right));
  y.height = 1 + Math.max(getHeight(y.left), getHeight(y.right));
  
  return y;
}

// Improved insertion algorithm following Knuth's AVL approach
function insertNode(node: AVLNode | null, value: number): AVLNode {
  if (!node) {
    return { value: Number(value), left: null, right: null, height: 1 };
  }

  if (Number(value) === node.value) {
    return node;
  }

  const newNode = { ...node };
  
  if (value < node.value) {
    newNode.left = insertNode(node.left, value);
  } else {
    newNode.right = insertNode(node.right, value);
  }

  newNode.height = 1 + Math.max(getHeight(newNode.left), getHeight(newNode.right));

  const balance = getBalance(newNode);

  if (balance > 1 && newNode.left && value < newNode.left.value) {
    return rightRotate(newNode);
  }

  if (balance < -1 && newNode.right && value > newNode.right.value) {
    return leftRotate(newNode);
  }

  if (balance > 1 && newNode.left && value > newNode.left.value) {
    newNode.left = leftRotate(newNode.left);
    return rightRotate(newNode);
  }

  if (balance < -1 && newNode.right && value < newNode.right.value) {
    newNode.right = rightRotate(newNode.right);
    return leftRotate(newNode);
  }

  return newNode;
}

// Optimized deletion algorithm per Knuth's approach
function deleteNode(root: AVLNode | null, value: number): AVLNode | null {
  if (!root) return null;
  
  if (value < root.value) {
    root.left = deleteNode(root.left, value);
  } else if (value > root.value) {
    root.right = deleteNode(root.right, value);
  } else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    
    root.value = minValue(root.right);
    root.right = deleteNode(root.right, root.value);
  }
  
  if (!root) return null;
  
  root.height = 1 + Math.max(getHeight(root.left), getHeight(root.right));
  
  const balance = getBalance(root);
  
  if (balance > 1 && getBalance(root.left) >= 0) {
    return rightRotate(root);
  }
  
  if (balance > 1 && getBalance(root.left) < 0 && root.left) {
    root.left = leftRotate(root.left);
    return rightRotate(root);
  }
  
  if (balance < -1 && getBalance(root.right) <= 0) {
    return leftRotate(root);
  }
  
  if (balance < -1 && getBalance(root.right) > 0 && root.right) {
    root.right = rightRotate(root.right);
    return leftRotate(root);
  }
  
  return root;
}

function minValue(node: AVLNode): number {
  let current = node;
  while (current.left) {
    current = current.left;
  }
  return current.value;
}

// Check if a tree is balanced according to AVL rules
function isTreeBalanced(node: AVLNode | null): boolean {
  if (!node) return true;
  
  const balance = getBalance(node);
  if (balance > 1 || balance < -1) {
    return false;
  }
  
  return isTreeBalanced(node.left) && isTreeBalanced(node.right);
}

// Improved tree balancing algorithm - follows Knuth's Day-Stout-Warren algorithm pattern
function rebuildBalancedTree(root: AVLNode | null): AVLNode | null {
  if (!root) return null;
  
  const values: number[] = [];
  
  function inOrderTraversal(node: AVLNode | null) {
    if (!node) return;
    inOrderTraversal(node.left);
    values.push(node.value);
    inOrderTraversal(node.right);
  }
  
  inOrderTraversal(root);
  
  function buildOptimalBST(values: number[], start: number, end: number): AVLNode | null {
    if (start > end) return null;
    
    const mid = Math.floor((start + end) / 2);
    const node: AVLNode = {
      value: values[mid],
      left: null,
      right: null,
      height: 1
    };
    
    node.left = buildOptimalBST(values, start, mid - 1);
    node.right = buildOptimalBST(values, mid + 1, end);
    
    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
    
    return node;
  }
  
  return buildOptimalBST(values, 0, values.length - 1);
}