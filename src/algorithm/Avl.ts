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
      // Verificação rigorosa para impedir duplicatas usando comparação direta no array de valores
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
      // Usar a mesma abordagem confiável - verificando no array de todos os valores
      { 
        const valueExists = allValues.includes(options.value);
        
        if (!valueExists) {
          resultTree = avlTree;
          message = `Valor ${options.value} não encontrado para exclusão`;
          success = false;
        } else if (avlTree && avlTree.value === options.value && !avlTree.left && !avlTree.right) {
          // Special case: Deleting the only node (root)
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
      // Usar a mesma abordagem confiável usada no insert - verificando no array de todos os valores
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
      // Obtemos todos os valores para uma verificação mais direta
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
          // For update, delete old and insert new with rebalancing
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
        // Use the rebuild approach for more reliable balancing
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
  
  // Convert back to our UI tree format
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
  
  // Para árvores geradas aleatoriamente, podemos ter nós sem o campo isEmpty
  // mas que deveriam ser tratados como vazios
  if (uiNode.value === 0 && (!uiNode.children || uiNode.children.length === 0)) {
    return null;
  }
  
  // Criar cópia do nó para evitar referências problemáticas
  const avlNode: AVLNode = {
    value: Number(uiNode.value), // Garantir que o valor é um número
    left: null,
    right: null,
    height: 1
  };
  
  if (uiNode.children && uiNode.children.length > 0) {
    // Para lidar com árvores não-binárias, garantimos que pegamos apenas os dois primeiros filhos
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
    // Return an empty tree representation when AVL is null
    return { value: 0, isEmpty: true };
  }
  
  const uiNode: TreeNode = {
    value: avlNode.value
  };
  
  if (avlNode.left || avlNode.right) {
    uiNode.children = [];
    
    // Case 1: We have both left and right children
    if (avlNode.left && avlNode.right) {
      uiNode.children.push(convertToUIFormat(avlNode.left));
      uiNode.children.push(convertToUIFormat(avlNode.right));
    }
    // Case 2: We only have left child
    else if (avlNode.left) {
      uiNode.children.push(convertToUIFormat(avlNode.left));
    }
    // Case 3: We only have right child
    else if (avlNode.right) {
      // Add a placeholder for the missing left node
      // to maintain correct tree structure in UI visualization
      uiNode.children.push({ value: 0, isEmpty: true });
      uiNode.children.push(convertToUIFormat(avlNode.right));
    }
  }
  
  return uiNode;
}

// AVL Tree functions
function getHeight(node: AVLNode | null): number {
  if (!node) return 0;
  return node.height;
}

function getBalance(node: AVLNode | null): number {
  if (!node) return 0;
  return getHeight(node.left) - getHeight(node.right);
}

function rightRotate(y: AVLNode): AVLNode {
  const x = y.left as AVLNode; // We know this exists because we're rotating right
  const T2 = x.right;
  
  // Perform rotation
  x.right = y;
  y.left = T2;
  
  // Update heights
  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
  
  // Return new root
  return x;
}

function leftRotate(x: AVLNode): AVLNode {
  const y = x.right as AVLNode; // We know this exists because we're rotating left
  const T2 = y.left;
  
  // Perform rotation
  y.left = x;
  x.right = T2;
  
  // Update heights
  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
  
  // Return new root
  return y;
}

function insertNode(node: AVLNode | null, value: number): AVLNode {
  // Base case: Criar nó quando chegamos em uma folha
  if (!node) {
    return { value: Number(value), left: null, right: null, height: 1 };
  }

  // Verificação de duplicata: Se o valor já existe, retorna o nó sem modificações
  if (Number(value) === node.value) {
    console.log(`Valor duplicado detectado (${value}) durante a inserção`);
    return node;
  }

  // Inserção normal na sub-árvore apropriada
  const newNode = { ...node }; // Criar cópia para evitar mutação
  
  if (value < node.value) {
    newNode.left = insertNode(node.left, value);
  } else { // value > node.value (já verificamos duplicatas acima)
    newNode.right = insertNode(node.right, value);
  }

  // Atualizar altura do nó atual
  newNode.height = Math.max(getHeight(newNode.left), getHeight(newNode.right)) + 1;

  // Calcular o fator de balanceamento
  const balance = getBalance(newNode);

  // Casos de desbalanceamento e rotações
  
  // Left Left Case
  if (balance > 1 && newNode.left && value < newNode.left.value) {
    return rightRotate(newNode);
  }

  // Right Right Case
  if (balance < -1 && newNode.right && value > newNode.right.value) {
    return leftRotate(newNode);
  }

  // Left Right Case
  if (balance > 1 && newNode.left && value > newNode.left.value) {
    newNode.left = leftRotate(newNode.left);
    return rightRotate(newNode);
  }

  // Right Left Case
  if (balance < -1 && newNode.right && value < newNode.right.value) {
    newNode.right = rightRotate(newNode.right);
    return leftRotate(newNode);
  }

  return newNode;
}



function deleteNode(root: AVLNode | null, value: number): AVLNode | null {
  if (!root) return null;
  
  if (value < root.value) {
    root.left = deleteNode(root.left, value);
  } else if (value > root.value) {
    root.right = deleteNode(root.right, value);
  } else {
    // Node with only one child or no child
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    
    // Node with two children
    root.value = minValue(root.right);
    root.right = deleteNode(root.right, root.value);
  }
  
  // If the tree had only one node
  if (!root) return null;
  
  // Update height
  root.height = Math.max(getHeight(root.left), getHeight(root.right)) + 1;
  
  // Get balance factor
  const balance = getBalance(root);
  
  // Left Left Case
  if (balance > 1 && getBalance(root.left) >= 0) {
    return rightRotate(root);
  }
  
  // Left Right Case
  if (balance > 1 && getBalance(root.left) < 0 && root.left) {
    root.left = leftRotate(root.left);
    return rightRotate(root);
  }
  
  // Right Right Case
  if (balance < -1 && getBalance(root.right) <= 0) {
    return leftRotate(root);
  }
  
  // Right Left Case
  if (balance < -1 && getBalance(root.right) > 0 && root.right) {
    root.right = rightRotate(root.right as AVLNode);
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
  
  // Check if current node is balanced
  const balance = getBalance(node);
  if (balance > 1 || balance < -1) {
    return false;
  }
  
  // Recursively check left and right subtrees
  return isTreeBalanced(node.left) && isTreeBalanced(node.right);
}

// Function to rebuild a balanced AVL tree from sorted values
function rebuildBalancedTree(root: AVLNode | null): AVLNode | null {
  if (!root) return null;
  
  // Get all values from the tree in sorted order
  const values: number[] = [];
  
  // In-order traversal to get sorted values
  function inOrderTraversal(node: AVLNode | null) {
    if (!node) return;
    inOrderTraversal(node.left);
    values.push(node.value);
    inOrderTraversal(node.right);
  }
  
  inOrderTraversal(root);
  
  // Build a balanced tree from sorted values
  function buildBalancedTree(values: number[], start: number, end: number): AVLNode | null {
    if (start > end) return null;
    
    // Use the middle element as root
    const mid = Math.floor((start + end) / 2);
    const node: AVLNode = {
      value: values[mid],
      left: null,
      right: null,
      height: 1
    };
    
    // Recursively build left and right subtrees
    node.left = buildBalancedTree(values, start, mid - 1);
    node.right = buildBalancedTree(values, mid + 1, end);
    
    // Update height
    node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1;
    
    return node;
  }
  
  return buildBalancedTree(values, 0, values.length - 1);
}