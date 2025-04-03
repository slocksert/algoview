import { TreeNode } from '@/lib/definitions';

// Skip list node
class SkipNode<T> {
  value: T;
  forward: Array<SkipNode<T> | null>;
  
  constructor(value: T, level: number) {
    this.value = value;
    this.forward = new Array(level + 1).fill(null);
  }
}

// Skip list implementation
export class SkipList<T> {
  private head: SkipNode<T>;
  private maxLevel: number;
  private level: number;
  private size: number;
  private probability: number;
  
  constructor(maxLevel = 16, probability = 0.5) {
    // Min value to serve as head
    const minValue = Number.MIN_SAFE_INTEGER as unknown as T;
    this.head = new SkipNode<T>(minValue, maxLevel);
    this.maxLevel = maxLevel;
    this.level = 0;
    this.size = 0;
    this.probability = probability;
  }
  
  // Randomly determine level for node
  private randomLevel(): number {
    let level = 0;
    while (Math.random() < this.probability && level < this.maxLevel) {
      level++;
    }
    return level;
  }
  
  // Insert a value
  insert(value: T): boolean {
    const update: Array<SkipNode<T> | null> = new Array(this.maxLevel + 1).fill(null);
    let current = this.head;
    
    // Find position to insert
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && (current.forward[i]!.value as any) < (value as any)) {
        current = current.forward[i]!;
      }
      update[i] = current;
    }
    
    // Next node at level 0
    current = current.forward[0];
    
    // Don't allow duplicates
    if (current !== null && current.value === value) {
      return false;
    }
    
    // Generate random level for new node
    const newLevel = this.randomLevel();
    
    // Update list level if needed
    if (newLevel > this.level) {
      for (let i = this.level + 1; i <= newLevel; i++) {
        update[i] = this.head;
      }
      this.level = newLevel;
    }
    
    // Create new node
    const newNode = new SkipNode(value, newLevel);
    
    // Insert node by updating references
    for (let i = 0; i <= newLevel; i++) {
      newNode.forward[i] = update[i]!.forward[i];
      update[i]!.forward[i] = newNode;
    }
    
    this.size++;
    return true;
  }
  
  // Search for a value
  search(value: T): boolean {
    let current = this.head;
    
    // Start from the highest level and work down
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && (current.forward[i]!.value as any) < (value as any)) {
        current = current.forward[i]!;
      }
    }
    
    // At level 0, check if the next node has our value
    current = current.forward[0];
    
    return current !== null && current.value === value;
  }
  
  // Delete a value
  delete(value: T): boolean {
    const update: Array<SkipNode<T> | null> = new Array(this.maxLevel + 1).fill(null);
    let current = this.head;
    
    // Find node to delete
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && (current.forward[i]!.value as any) < (value as any)) {
        current = current.forward[i]!;
      }
      update[i] = current;
    }
    
    // Get the node
    current = current.forward[0];
    
    // If value not found
    if (current === null || current.value !== value) {
      return false;
    }
    
    // Remove references to the node
    for (let i = 0; i <= this.level; i++) {
      if (update[i]!.forward[i] !== current) {
        break;
      }
      update[i]!.forward[i] = current.forward[i];
    }
    
    // Update level if needed
    while (this.level > 0 && this.head.forward[this.level] === null) {
      this.level--;
    }
    
    this.size--;
    return true;
  }
  
  // Get all values as array (traverse)
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head.forward[0];
    
    while (current !== null) {
      result.push(current.value);
      current = current.forward[0];
    }
    
    return result;
  }
  
  // Get number of elements
  getSize(): number {
    return this.size;
  }
}

// Function to run skip list algorithm operations
export function runSkipListAlgorithm(tree: TreeNode, operation: any): {
  newTree: TreeNode;
  operation: string;
  success: boolean;
  message: string;
} {
  // Create skip list
  const skipList = new SkipList<number>();
  let success = false;
  let message = '';
  
  // Convert tree to skip list if needed
  if (tree && !tree.isEmpty) {
    const processNode = (node: TreeNode) => {
      if (node && !node.isEmpty) {
        skipList.insert(Number(node.value));
        
        if (node.children) {
          for (const child of node.children) {
            processNode(child);
          }
        }
      }
    };
    
    processNode(tree);
  }
  
  // Perform operation
  switch (operation.operation) {
    case 'insert':
      success = skipList.insert(operation.value);
      message = success ? `Inserted ${operation.value}` : `Failed to insert ${operation.value}`;
      break;
    case 'search':
      success = skipList.search(operation.value);
      message = success ? `Found ${operation.value}` : `Did not find ${operation.value}`;
      break;
    case 'delete':
      success = skipList.delete(operation.value);
      message = success ? `Deleted ${operation.value}` : `Failed to delete ${operation.value}`;
      break;
    case 'traverse':
      skipList.toArray();
      success = true;
      message = 'Traversed skip list';
      break;
    default:
      message = 'Unknown operation';
  }
  
  return {
    newTree: tree, // Return the same tree as we're only benchmarking
    operation: operation.operation,
    success,
    message
  };
}
