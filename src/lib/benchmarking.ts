import { runAVLAlgorithm } from '@/algorithm/Avl';
import { runBSTAlgorithm } from '@/algorithm/Bst';
import { runHashAlgorithm } from '@/algorithm/Hash';
import { runLinkedListAlgorithm } from '@/algorithm/LinkedList';
import { runSkipListAlgorithm } from '@/algorithm/SkipList';
import { TreeNode } from '@/lib/definitions';

export type BenchmarkResultsType = Record<string, Record<string, number>>;

const generateUnbalancedBST = (size: number): TreeNode => {
  if (size <= 0) return { value: 0, isEmpty: true };
  
  const root: TreeNode = { value: 1 };
  let current = root;
  
  for (let i = 2; i <= size; i++) {
    if (!current.children) {
      current.children = [];
    }
    current.children[0] = { value: 0, isEmpty: true };
    current.children[1] = { value: i };
    current = current.children[1];
  }
  
  return root;
};

const generateRandomAVL = (size: number): TreeNode => {
  if (size <= 0) return { value: 0, isEmpty: true };
  
  const values = Array.from({ length: size }, (_, i) => i + 1);
  values.sort(() => Math.random() - 0.5);
  
  const root: TreeNode = { value: values[0] };
  for (let i = 1; i < values.length; i++) {
    runAVLAlgorithm(root, { operation: 'insert', value: values[i] });
  }
  
  return root;
};

const generateBalancedTree = (size: number): TreeNode => {
  if (size <= 0) {
    return { value: 0, isEmpty: true };
  }

  const values: number[] = [];
  for (let i = 1; i <= size; i++) {
    values.push(i);
  }

  interface StackFrame {
    start: number;
    end: number;
    parent: TreeNode;
    isLeftChild: boolean;
  }

  const root: TreeNode = { value: 0 };
  const stack: StackFrame[] = [];
  
  stack.push({
    start: 0,
    end: values.length - 1,
    parent: root,
    isLeftChild: true
  });
  
  while (stack.length > 0) {
    const { start, end, parent, isLeftChild } = stack.pop()!;
    
    if (start > end) continue;
    
    const mid = Math.floor((start + end) / 2);
    const node: TreeNode = { value: values[mid] };
    
    if (parent === root) {
      root.value = values[mid];
    } else {
      if (!parent.children) {
        parent.children = [];
      }
      
      if (isLeftChild) {
        parent.children[0] = node;
      } else {
        if (parent.children.length === 0) {
          parent.children[0] = { value: 0, isEmpty: true };
        }
        parent.children[1] = node;
      }
    }
    
    if (mid + 1 <= end) {
      stack.push({
        start: mid + 1,
        end: end,
        parent: node,
        isLeftChild: false
      });
    }
    
    if (start <= mid - 1) {
      stack.push({
        start: start,
        end: mid - 1,
        parent: node,
        isLeftChild: true
      });
    }
  }
  
  return root;
};

const generateTestValues = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * size * 10) + size);
};

const manualBenchmark = (fn: () => void, iterations = 50): number => {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  return (end - start) / iterations;
};

// Função especial de benchmark para travessia que é mais precisa
// para operações muito rápidas executando mais iterações
const traversalBenchmark = (fn: () => any, expectedSize: number): number => {
  // Aumentamos o número de iterações para operações rápidas
  const minIterations = 20;
  const maxIterations = 100;
  
  // Primeiro, validamos se a travessia retorna o número correto de elementos
  const result = fn();
  const actualSize = Array.isArray(result) ? result.length : 
                    (typeof result === 'object' && result !== null) ? 
                    Object.keys(result).length : 0;
  
  console.log(`Traverse validation: expected ${expectedSize}, actual ${actualSize}`);
  
  if (actualSize < expectedSize * 0.9) {
    console.warn(`⚠️ Traverse may be incomplete. Expected ~${expectedSize} items, got ${actualSize}`);
  }
  
  // Executa a travessia várias vezes para obter uma medição mais precisa
  // Aumenta o número de iterações para operações mais rápidas
  let totalTime = 0;
  const iterations = Math.max(minIterations, Math.min(maxIterations, Math.ceil(1000 / expectedSize)));
  
  // Executa um teste preliminar para estimar o tempo
  const startPrelim = performance.now();
  for (let i = 0; i < 5; i++) {
    fn();
  }
  const prelimTime = performance.now() - startPrelim;
  
  // Se for muito rápido, aumenta ainda mais as iterações
  const finalIterations = prelimTime < 10 ? iterations * 10 : iterations;
  
  console.log(`Running traverse benchmark with ${finalIterations} iterations`);
  
  const start = performance.now();
  for (let i = 0; i < finalIterations; i++) {
    fn();
  }
  const end = performance.now();
  
  return (end - start) / finalIterations;
};

export const createBenchmarkTree = (dataSize: number, forceBalanced = true) => {
  console.log("Creating benchmark tree with data size:", dataSize);

  const tree = forceBalanced ? 
    generateBalancedTree(dataSize) : 
    generateUnbalancedBST(dataSize);
    
  let actualNodeCount = 0;
  const countNodes = (node: TreeNode) => {
    if (!node || node.isEmpty) return;
    actualNodeCount++;
    if (node.children) {
      node.children.forEach(child => countNodes(child));
    }
  };
  
  countNodes(tree);
  console.log(`Actual nodes in the created tree: ${actualNodeCount} (requested: ${dataSize})`);

  return tree;
};

export const runBenchmarks = async (
  algorithms: string[],
  dataSize: number,
  onProgress: (progress: number) => void,
  useOptimized: boolean = true
): Promise<BenchmarkResultsType> => {
  const results: BenchmarkResultsType = {};
  const operations = ['insert', 'search', 'delete', 'traverse'];
  const totalTests = algorithms.length * operations.length + algorithms.length;
  let testsCompleted = 0;

  const availableAlgorithms = algorithms;

  algorithms.forEach(algo => {
    results[algo] = {};
  });

  console.log(`Starting benchmarks for ${dataSize} nodes with optimization: ${useOptimized}`);
  
  const algorithmTrees: Record<string, TreeNode> = {};
  
  availableAlgorithms.forEach(algo => {
    let tree: TreeNode;
    
    if (algo === 'bst') {
      tree = generateUnbalancedBST(dataSize);
    } else if (algo === 'avl') {
      tree = generateRandomAVL(dataSize);
    } else {
      tree = generateBalancedTree(dataSize);
    }
    
    algorithmTrees[algo] = tree;
    console.log(`Created ${algo} tree with ${dataSize} nodes`);
  });
  
  const testValues = generateTestValues(Math.min(dataSize, 100));

  const updateProgress = () => {
    testsCompleted++;
    onProgress((testsCompleted / totalTests) * 100);
  };

  for (const algo of availableAlgorithms) {
    for (const op of operations) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          let msPerOp = 0;
          
          const getAlgorithmFunction = (algorithm: string) => {
            switch(algorithm) {
              case 'avl': return runAVLAlgorithm;
              case 'bst': return runBSTAlgorithm;
              case 'hash': return runHashAlgorithm;
              case 'linked-list': return runLinkedListAlgorithm;
              case 'skip-list': return runSkipListAlgorithm;
              default: return runAVLAlgorithm;
            }
          };
          
          const algorithmFn = getAlgorithmFunction(algo);
          const initialTree = algorithmTrees[algo];
          
          console.log(`Running ${op} benchmark on ${algo} with tree size: ${dataSize}`);
          
          const iterations = Math.max(3, Math.min(20, 2000 / dataSize));
          
          if (op === 'insert') {
            msPerOp = manualBenchmark(() => {
              if (algo === 'hash') {
                algorithmFn(initialTree, {
                  operation: 'insert',
                  value: testValues[Math.floor(Math.random() * testValues.length)],
                  optimized: useOptimized
                });
              } else {
                algorithmFn(initialTree, {
                  operation: 'insert',
                  value: testValues[Math.floor(Math.random() * testValues.length)]
                });
              }
            }, iterations);
          } else if (op === 'search') {
            msPerOp = manualBenchmark(() => {
              if (algo === 'hash') {
                algorithmFn(initialTree, {
                  operation: 'search',
                  value: Math.floor(Math.random() * dataSize) + 1,
                  optimized: useOptimized
                });
              } else {
                algorithmFn(initialTree, {
                  operation: 'search',
                  value: Math.floor(Math.random() * dataSize) + 1
                });
              }
            }, iterations);
          } else if (op === 'delete') {
            msPerOp = manualBenchmark(() => {
              if (algo === 'hash') {
                algorithmFn(initialTree, {
                  operation: 'delete',
                  value: Math.floor(Math.random() * dataSize) + 1,
                  optimized: useOptimized
                });
              } else {
                algorithmFn(initialTree, {
                  operation: 'delete',
                  value: Math.floor(Math.random() * dataSize) + 1
                });
              }
            }, iterations);
          }
          
          const capitalized = op.charAt(0).toUpperCase() + op.slice(1);
          results[algo][capitalized] = msPerOp;
          
          updateProgress();
          resolve();
        }, 100);
      });
    }
  }

  for (const algo of availableAlgorithms) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const getAlgorithmFunction = (algorithm: string) => {
          switch(algorithm) {
            case 'avl': return runAVLAlgorithm;
            case 'bst': return runBSTAlgorithm;
            case 'hash': return runHashAlgorithm;
            case 'linked-list': return runLinkedListAlgorithm;
            case 'skip-list': return runSkipListAlgorithm;
            default: return runAVLAlgorithm;
          }
        };
        
        const algorithmFn = getAlgorithmFunction(algo);
        
        // Use a função especializada para benchmarking de travessia
        const traversalFn = () => {
          if (algo === 'hash') {
            return algorithmFn(algorithmTrees[algo], {
              operation: 'traverse',
              optimized: useOptimized
            }).result;
          } else {
            return algorithmFn(algorithmTrees[algo], {
              operation: 'traverse',
            }).result;
          }
        };
        
        const traversalTime = traversalBenchmark(traversalFn, dataSize);
        
        results[algo]['Traversal'] = traversalTime;
        resolve();
      }, 100);
    });
  }

  return results;
};
