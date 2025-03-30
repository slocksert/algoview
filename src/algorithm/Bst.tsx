import { TreeNode } from "../lib/definitions";

export const runBSTAlgorithm = (data: TreeNode, operation: string = 'insert', value?: number) => {
    // Função para verificar se um valor já existe na BST
    function searchBST(root: TreeNode | null, value: number): boolean {
      if (root === null) return false;
      if (root.value === value) return true;
      
      const children = root.children || [];
      if (value < root.value) {
        return searchBST(children[0] || null, value);
      } else {
        return searchBST(children[1] || null, value);
      }
    }

    // Função de inserção em uma árvore binária de busca
    function insertBST(root: TreeNode | null, value: number): { tree: TreeNode, message: string, success: boolean } {
      // Verifica se a árvore está vazia
      if (root === null) {
        return { 
          tree: { value, children: [] },
          message: `Valor ${value} inserido com sucesso na árvore vazia.`,
          success: true
        };
      }

      // Verifica se o valor já existe
      if (searchBST(root, value)) {
        return {
          tree: root,
          message: `Valor ${value} já existe na árvore.`,
          success: false
        };
      }

      // Insere normalmente
      if (value < root.value) {
        if (!root.children) root.children = [];
        const result = insertBST(root.children[0] || null, value);
        root.children[0] = result.tree;
        return { tree: root, message: result.message, success: result.success };
      } else {
        if (!root.children) root.children = [];
        const result = insertBST(root.children[1] || null, value);
        root.children[1] = result.tree;
        return { tree: root, message: result.message, success: result.success };
      }
    }
  
    const valueToInsert = value || Math.floor(Math.random() * 100); // Usar o valor fornecido ou gerar aleatório
    
    if (operation === 'insert') {
      const result = insertBST(data, valueToInsert);
      return `${result.message} ${result.success ? 'Árvore atualizada.' : 'Árvore não modificada.'}`;
    }
    
    // Pode adicionar outras operações aqui (delete, search, etc.)
    return `Operação '${operation}' não implementada. Árvore não modificada.`;
};
