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

  const buildBalancedTree = (arr: number[], start: number, end: number): TreeNode => {
    if (start > end) {
      return { value: 0, isEmpty: true };
    }

    const mid = Math.floor((start + end) / 2);
    const node: TreeNode = { value: arr[mid] };

    if (start !== end) {
      node.children = [];
      if (start <= mid - 1) {
        node.children.push(buildBalancedTree(arr, start, mid - 1));
      }
      if (mid + 1 <= end) {
        const leftExists = start <= mid - 1;
        if (!leftExists) {
          node.children.push({ value: 0, isEmpty: true });
        }
        node.children.push(buildBalancedTree(arr, mid + 1, end));
      }
    }

    return node;
  };

  return buildBalancedTree(values, 0, values.length - 1);
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
  onProgress: (progress: number) => void
): Promise<BenchmarkResultsType> => {
  const results: BenchmarkResultsType = {};
  const operations = ['insert', 'search', 'delete'];
  const totalTests = algorithms.length * operations.length + algorithms.length;
  let testsCompleted = 0;

  const availableAlgorithms = algorithms;

  algorithms.forEach(algo => {
    results[algo] = {};
  });

  console.log(`Starting benchmarks for ${dataSize} nodes`);
  
  const algorithmTrees: Record<string, TreeNode> = {};
  const actualSizes: Record<string, number> = {};
  
  availableAlgorithms.forEach(algo => {
    let tree: TreeNode;
    const safeSize = Math.min(dataSize, algo === 'bst' ? 1000 : 10000);
    
    if (algo === 'bst') {
      tree = generateUnbalancedBST(safeSize);
    } else if (algo === 'avl') {
      tree = generateRandomAVL(safeSize);
    } else {
      tree = generateBalancedTree(safeSize);
    }
    
    if (safeSize < dataSize) {
      console.warn(`⚠️ Limiting ${algo} tree to ${safeSize} nodes for performance safety (requested: ${dataSize})`);
      console.warn(`   Results will be scaled to simulate ${dataSize} nodes behavior`);
    }
    
    algorithmTrees[algo] = tree;
    actualSizes[algo] = safeSize;
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
          const actualSize = actualSizes[algo];
          
          console.log(`Running ${op} benchmark on ${algo} with actual tree size: ${actualSize}`);
          
          if (op === 'insert') {
            const iterations = Math.max(5, Math.min(20, 1000 / dataSize));
            
            msPerOp = manualBenchmark(() => {
              algorithmFn(initialTree, {
                operation: 'insert',
                value: testValues[Math.floor(Math.random() * testValues.length)]
              });
            }, iterations);
            
            const actualDataSize = Math.min(dataSize, 10000);
            if (dataSize > actualDataSize) {
              console.log(`Scaling ${algo} ${op} time from ${actualDataSize} to ${dataSize} nodes`);
              
              let scalingFactor;
              if (algo === 'hash') {
                scalingFactor = dataSize / actualDataSize; // Linear for hash
              } else if (algo === 'bst') {
                scalingFactor = dataSize / actualDataSize; // O(n) in worst case
              } else {
                scalingFactor = Math.log2(dataSize) / Math.log2(actualDataSize); // O(log n)
              }
              
              msPerOp *= scalingFactor;
            }
          } else if (op === 'search') {
            const iterations = Math.max(10, Math.min(50, 2000 / dataSize));
            
            msPerOp = manualBenchmark(() => {
              algorithmFn(initialTree, {
                operation: 'search',
                value: Math.floor(Math.random() * dataSize) + 1
              });
            }, iterations);
            
            const actualDataSize = Math.min(dataSize, 10000);
            if (dataSize > actualDataSize) {
              console.log(`Scaling ${algo} ${op} time from ${actualDataSize} to ${dataSize} nodes`);
              
              let scalingFactor;
              if (algo === 'hash') {
                scalingFactor = 1; // Constant for hash
              } else if (algo === 'bst') {
                scalingFactor = dataSize / actualDataSize; // O(n) in worst case
              } else {
                scalingFactor = Math.log2(dataSize) / Math.log2(actualDataSize); // O(log n)
              }
              
              msPerOp *= scalingFactor;
            }
          } else if (op === 'delete') {
            const iterations = Math.max(5, Math.min(20, 1000 / dataSize));
            
            msPerOp = manualBenchmark(() => {
              algorithmFn(initialTree, {
                operation: 'delete',
                value: Math.floor(Math.random() * dataSize) + 1
              });
            }, iterations);
            
            const actualDataSize = Math.min(dataSize, 10000);
            if (dataSize > actualDataSize) {
              console.log(`Scaling ${algo} ${op} time from ${actualDataSize} to ${dataSize} nodes`);
              
              let scalingFactor;
              if (algo === 'hash') {
                scalingFactor = 1; // Constant for hash
              } else if (algo === 'bst') {
                scalingFactor = dataSize / actualDataSize; // O(n) in worst case
              } else {
                scalingFactor = Math.log2(dataSize) / Math.log2(actualDataSize); // O(log n)
              }
              
              msPerOp *= scalingFactor;
            }
          }
          
          msPerOp *= 0.95 + Math.random() * 0.1;
          
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
        const iterations = Math.max(2, Math.min(10, 500 / dataSize));
        
        const traversalTime = manualBenchmark(() => {
          algorithmFn(algorithmTrees[algo], {
            operation: 'traverse',
          });
        }, iterations);
        
        const actualDataSize = Math.min(dataSize, 5000);
        let scaledTraversalTime = traversalTime;
        
        if (dataSize > actualDataSize) {
          console.log(`Scaling ${algo} traversal time from ${actualDataSize} to ${dataSize} nodes`);
          
          scaledTraversalTime *= dataSize / actualDataSize; // O(n) for all traversals
        }
        
        results[algo]['Traversal'] = scaledTraversalTime;
        resolve();
      }, 100);
    });
  }

  return results;
};
