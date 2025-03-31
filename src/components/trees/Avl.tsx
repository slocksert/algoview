import { TreeNode } from "@/lib/definitions";

export const runAVLAlgorithm = (data: TreeNode) => {
    // Função de balanceamento e inserção em uma AVL
    function insertAVL(root: TreeNode | null, value: number): TreeNode {
      // Inserir nó e balancear a árvore (simplificação)
      if (root === null) {
        return { value, children: [] };
      }
  
      // Inserção comum do BST
      if (value < root.value) {
        if (!root.children) root.children = [];
        root.children[0] = insertAVL(root.children[0] || null, value);
      } else {
        if (!root.children) root.children = [];
        root.children[1] = insertAVL(root.children[1] || null, value);
      }
  
      return root;
    }
  
    const newValue = Math.floor(Math.random() * 100);
    const newTree = insertAVL(data, newValue);
  
    return `Inserted value ${newValue} into AVL Tree: ${JSON.stringify(newTree)}`;
  };
