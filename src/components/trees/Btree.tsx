import { TreeNode } from "@/lib/definitions";

export const runBTreeAlgorithm = (data: TreeNode) => {
    // Função de inserção em uma árvore B (simplificada)
    function insertBTree(root: TreeNode | null, value: number): TreeNode {
      // A árvore B precisa de uma lógica mais complexa, mas estamos simplificando
      if (root === null) {
        return { value, children: [] };
      }
  
      if (value < root.value) {
        if (!root.children) root.children = [];
        root.children[0] = insertBTree(root.children[0] || null, value);
      } else {
        if (!root.children) root.children = [];
        root.children[1] = insertBTree(root.children[1] || null, value);
      }
      return root;
    }
  
    const newValue = Math.floor(Math.random() * 100);
    const newTree = insertBTree(data, newValue);
  
    return `Inserted value ${newValue} into B-Tree: ${JSON.stringify(newTree)}`;
  };
  