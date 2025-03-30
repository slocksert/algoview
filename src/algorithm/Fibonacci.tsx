import { TreeNode } from "../lib/definitions";

export const runFibonacciTreeAlgorithm = (data: TreeNode) => {
    // Função para gerar uma árvore Fibonacci (simplificada)
    function insertFibonacciTree(root: TreeNode | null, value: number): TreeNode {
      if (root === null) {
        return { value, children: [] };
      }
  
      // Simulação da lógica da árvore Fibonacci
      if (value < root.value) {
        if (!root.children) root.children = [];
        root.children[0] = insertFibonacciTree(root.children[0] || null, value);
      } else {
        if (!root.children) root.children = [];
        root.children[1] = insertFibonacciTree(root.children[1] || null, value);
      }
      return root;
    }
  
    const newValue = Math.floor(Math.random() * 100);
    const newTree = insertFibonacciTree(data, newValue);
  
    return `Inserted value ${newValue} into Fibonacci Tree: ${JSON.stringify(newTree)}`;
  };
  