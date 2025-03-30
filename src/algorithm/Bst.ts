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
    case 'update':
      { const result = updateNode(bstTree, options.value, options.newValue || 0);
        resultTree = result.tree;
        message = result.message;
        success = result.success;
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
  
  const bstNode: BSTNode = {
    value: uiNode.value,
    left: null,
    right: null
  };
  
  if (uiNode.children && uiNode.children.length > 0) {
    // Filho esquerdo - garante que não é vazio
    if (uiNode.children[0] && !uiNode.children[0].isEmpty) {
      bstNode.left = convertToBSTFormat(uiNode.children[0]);
    }
    
    // Filho direito - apenas se houver mais de um filho
    if (uiNode.children.length > 1 && !uiNode.children[1].isEmpty) {
      bstNode.right = convertToBSTFormat(uiNode.children[1]);
    }
  }
  
  return bstNode;
}

// Convert BST format (left/right) back to our UI tree format (children array)
function convertToUIFormat(bstNode: BSTNode | null): TreeNode {
  if (!bstNode) {
    // Return an empty tree representation when BST is null
    return { value: 0, isEmpty: true };
  }
  
  const uiNode: TreeNode = {
    value: bstNode.value
  };
  
  // Verificamos se temos filhos para criar o array
  if (bstNode.left || bstNode.right) {
    uiNode.children = [];
    
    // Caso 1: Temos tanto filho esquerdo quanto direito
    if (bstNode.left && bstNode.right) {
      uiNode.children.push(convertToUIFormat(bstNode.left));
      uiNode.children.push(convertToUIFormat(bstNode.right));
    }
    // Caso 2: Temos apenas filho esquerdo
    else if (bstNode.left) {
      uiNode.children.push(convertToUIFormat(bstNode.left));
    }
    // Caso 3: Temos apenas filho direito
    else if (bstNode.right) {
      // É essencial adicionar um placeholder para o nó esquerdo ausente
      // para manter a estrutura correta da árvore na visualização da UI
      uiNode.children.push({ value: 0, isEmpty: true });
      uiNode.children.push(convertToUIFormat(bstNode.right));
    }
  }
  
  return uiNode;
}

// BST operations
function insertNode(root: BSTNode | null, value: number): BSTNode {
  // Caso base - criando um novo nó
  if (!root) {
    return { value, left: null, right: null };
  }
  
  // Verificação de duplicata - não faz nada se o valor já existir
  if (value === root.value) {
    return root; // Retorna o nó sem modificação
  }
  
  // Inserção na sub-árvore correta
  if (value < root.value) {
    // Cria uma cópia do nó raiz para evitar mutação acidental
    const newRoot = { ...root };
    newRoot.left = insertNode(root.left, value);
    return newRoot;
  } else { // value > root.value
    // Cria uma cópia do nó raiz para evitar mutação acidental
    const newRoot = { ...root };
    newRoot.right = insertNode(root.right, value);
    return newRoot;
  }
}

// Implementação mais robusta de searchNode
function searchNode(root: BSTNode | null, value: number): boolean {
  // Caso base: árvore vazia ou chegamos a uma folha
  if (!root) return false;
  
  // Encontramos o valor
  if (root.value === value) return true;
  
  // Busca na sub-árvore apropriada
  if (value < root.value) {
    return searchNode(root.left, value);
  } else { // value > root.value
    return searchNode(root.right, value);
  }
}

function deleteNode(root: BSTNode | null, value: number): BSTNode | null {
  if (!root) return null;
  
  if (value < root.value) {
    root.left = deleteNode(root.left, value);
  } else if (value > root.value) {
    root.right = deleteNode(root.right, value);
  } else {
    // Node with only one child or no child
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    // Node with two children: Get the inorder successor
    root.value = minValue(root.right);
    // Delete the inorder successor
    root.right = deleteNode(root.right, root.value);
  }
  
  return root;
}

function minValue(node: BSTNode): number {
  let current = node;
  while (current.left) {
    current = current.left;
  }
  return current.value;
}

// Função para verificar se uma atualização é válida (não viola a propriedade da BST)
function isValidUpdate(root: BSTNode | null, oldValue: number, newValue: number): boolean {
  if (!root) return true;
  
  // Encontra o nó a ser atualizado e seus limites
  const nodeInfo = findNodeAndBounds(root, oldValue, -Infinity, Infinity, null);
  
  if (!nodeInfo.found) return false; // Nó não encontrado
  
  // Verifica se o novo valor está dentro dos limites válidos
  return newValue > nodeInfo.lowerBound && newValue < nodeInfo.upperBound;
}

// Função para encontrar um nó e seus limites na árvore
function findNodeAndBounds(
  node: BSTNode | null, 
  value: number, 
  lowerBound: number, 
  upperBound: number,
  parent: BSTNode | null
): { found: boolean; lowerBound: number; upperBound: number; parent: BSTNode | null } {
  if (!node) return { found: false, lowerBound, upperBound, parent };
  
  if (node.value === value) {
    return { found: true, lowerBound, upperBound, parent };
  }
  
  if (value < node.value) {
    // Se vamos para esquerda, o limite superior é o valor do nó atual
    return findNodeAndBounds(node.left, value, lowerBound, node.value, node);
  } else {
    // Se vamos para direita, o limite inferior é o valor do nó atual
    return findNodeAndBounds(node.right, value, node.value, upperBound, node);
  }
}

// Update function for BST
function updateNode(root: BSTNode | null, oldValue: number, newValue: number): {
  tree: BSTNode | null; 
  message: string; 
  success: boolean;
} {
  // Primeiro, verifica se o valor a ser atualizado existe
  const valueExists = searchNode(root, oldValue);
  
  // Depois, verifica se o novo valor já existe na árvore (exceto se for igual ao valor atual)
  const newValueExists = oldValue !== newValue && searchNode(root, newValue);
  
  if (!valueExists) {
    return {
      tree: root,
      message: `Valor ${oldValue} não encontrado para atualização`,
      success: false
    };
  } 
  
  if (newValueExists) {
    return {
      tree: root,
      message: `Novo valor ${newValue} já existe na árvore. Escolha um valor único.`,
      success: false
    };
  }
  
  // Verificar se o novo valor violaria a propriedade da BST
  const validUpdate = isValidUpdate(root, oldValue, newValue);
  
  if (!validUpdate) {
    return {
      tree: root,
      message: `Atualização inválida: o novo valor ${newValue} violaria a propriedade da BST. Escolha um valor que mantenha a ordem correta.`,
      success: false
    };
  }
  
  // Para update, precisamos excluir o valor antigo e inserir o novo
  let resultTree = deleteNode(root, oldValue);
  resultTree = insertNode(resultTree, newValue);
  
  return {
    tree: resultTree,
    message: `Valor ${oldValue} foi atualizado para ${newValue}`,
    success: true
  };
}
