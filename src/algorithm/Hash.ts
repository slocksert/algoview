import { TreeNode } from '@/lib/definitions';

// Define types for the hash table
type HashItem = {
  key: string | number;
  value: any;
};

type HashTableOptions = {
  size?: number;
  collisionStrategy?: 'chaining' | 'linear-probing' | 'double-hashing';
};

// Main hash table class that will be used in benchmarking
export class HashTable {
  private table: Array<HashItem[]>;
  private size: number;
  private collisionStrategy: 'chaining' | 'linear-probing' | 'double-hashing';
  
  constructor(options: HashTableOptions = {}) {
    this.size = options.size || 10;
    this.collisionStrategy = options.collisionStrategy || 'chaining';
    this.table = new Array(this.size);
    
    // Initialize all buckets
    for (let i = 0; i < this.size; i++) {
      this.table[i] = [];
    }
  }
  
  // Universal hash function
  private hash(key: string | number): number {
    const strKey = String(key);
    const primeNumber = 31;
    let hash = 0;
    
    for (let i = 0; i < strKey.length; i++) {
      hash = (hash * primeNumber + strKey.charCodeAt(i)) % this.size;
    }
    
    return hash;
  }
  
  // Secondary hash function for double hashing
  private hash2(key: string | number): number {
    const strKey = String(key);
    const prime = 17; // Different prime for secondary hash
    let hash = 0;
    
    for (let i = 0; i < strKey.length; i++) {
      hash = (hash * prime + strKey.charCodeAt(i)) % (this.size - 1);
    }
    
    return 1 + hash; // Ensure it's never 0
  }
  
  // Insert a key-value pair
  insert(key: string | number, value: any): boolean {
    const hashIndex = this.hash(key);
    
    // Check if key already exists
    if (this.search(key) !== undefined) {
      return false;
    }
    
    if (this.collisionStrategy === 'chaining') {
      // For chaining, just add to the bucket
      this.table[hashIndex].push({ key, value });
      return true;
    } else if (this.collisionStrategy === 'linear-probing') {
      // For linear probing, find next empty slot
      let probeIndex = hashIndex;
      let i = 0;
      
      while (this.table[probeIndex].length > 0) {
        i++;
        probeIndex = (hashIndex + i) % this.size;
        
        // Table is full
        if (i >= this.size) {
          return false;
        }
      }
      
      this.table[probeIndex].push({ key, value });
      return true;
    } else if (this.collisionStrategy === 'double-hashing') {
      // For double hashing
      const step = this.hash2(key);
      let probeIndex = hashIndex;
      let i = 0;
      
      while (this.table[probeIndex].length > 0) {
        i++;
        probeIndex = (hashIndex + i * step) % this.size;
        
        // Table is full
        if (i >= this.size) {
          return false;
        }
      }
      
      this.table[probeIndex].push({ key, value });
      return true;
    }
    
    return false;
  }
  
  // Search for a key
  search(key: string | number): any {
    const hashIndex = this.hash(key);
    
    if (this.collisionStrategy === 'chaining') {
      // For chaining, search in the bucket
      const bucket = this.table[hashIndex];
      for (const item of bucket) {
        if (item.key === key) {
          return item.value;
        }
      }
    } else if (this.collisionStrategy === 'linear-probing') {
      // For linear probing, search linearly from the hash index
      let probeIndex = hashIndex;
      let i = 0;
      
      while (this.table[probeIndex].length > 0) {
        const bucket = this.table[probeIndex];
        if (bucket.length > 0 && bucket[0].key === key) {
          return bucket[0].value;
        }
        
        i++;
        probeIndex = (hashIndex + i) % this.size;
        
        // Not found after checking all slots
        if (i >= this.size) {
          break;
        }
      }
    } else if (this.collisionStrategy === 'double-hashing') {
      // For double hashing
      const step = this.hash2(key);
      let probeIndex = hashIndex;
      let i = 0;
      
      while (this.table[probeIndex].length > 0) {
        const bucket = this.table[probeIndex];
        if (bucket.length > 0 && bucket[0].key === key) {
          return bucket[0].value;
        }
        
        i++;
        probeIndex = (hashIndex + i * step) % this.size;
        
        // Not found after checking all slots
        if (i >= this.size) {
          break;
        }
      }
    }
    
    return undefined;
  }
  
  // Delete a key
  delete(key: string | number): boolean {
    const hashIndex = this.hash(key);
    
    if (this.collisionStrategy === 'chaining') {
      // For chaining, remove from the bucket
      const bucket = this.table[hashIndex];
      for (let i = 0; i < bucket.length; i++) {
        if (bucket[i].key === key) {
          bucket.splice(i, 1);
          return true;
        }
      }
    } else if (this.collisionStrategy === 'linear-probing') {
      // For linear probing, find and mark as deleted
      let probeIndex = hashIndex;
      let i = 0;
      
      while (this.table[probeIndex].length > 0) {
        const bucket = this.table[probeIndex];
        if (bucket.length > 0 && bucket[0].key === key) {
          this.table[probeIndex] = [];
          return true;
        }
        
        i++;
        probeIndex = (hashIndex + i) % this.size;
        
        // Not found after checking all slots
        if (i >= this.size) {
          break;
        }
      }
    } else if (this.collisionStrategy === 'double-hashing') {
      // For double hashing
      const step = this.hash2(key);
      let probeIndex = hashIndex;
      let i = 0;
      
      while (this.table[probeIndex].length > 0) {
        const bucket = this.table[probeIndex];
        if (bucket.length > 0 && bucket[0].key === key) {
          this.table[probeIndex] = [];
          return true;
        }
        
        i++;
        probeIndex = (hashIndex + i * step) % this.size;
        
        // Not found after checking all slots
        if (i >= this.size) {
          break;
        }
      }
    }
    
    return false;
  }
  
  // Get all items for traversal
  traverse(): HashItem[] {
    const items: HashItem[] = [];
    
    for (const bucket of this.table) {
      for (const item of bucket) {
        items.push(item);
      }
    }
    
    return items;
  }
}

// Function to run hash algorithm operations from benchmarking
export function runHashAlgorithm(tree: TreeNode, operation: any): {
  newTree: TreeNode;
  operation: string;
  success: boolean;
  message: string;
} {
  // Create hash table with reasonable size
  const hashTable = new HashTable({ size: 50, collisionStrategy: 'chaining' });
  let success = false;
  let message = '';
  
  // Convert tree to hash table if needed (for benchmarking)
  if (tree && !tree.isEmpty) {
    // Replace recursive approach with iterative using a stack
    const stack: TreeNode[] = [tree];
    
    while (stack.length > 0) {
      const node = stack.pop()!;
      
      if (node && !node.isEmpty) {
        hashTable.insert(node.value, node.value);
        
        if (node.children) {
          // Push children in reverse order for correct processing
          for (let i = node.children.length - 1; i >= 0; i--) {
            stack.push(node.children[i]);
          }
        }
      }
    }
  }
  
  // Perform operation
  switch (operation.operation) {
    case 'insert':
      success = hashTable.insert(operation.value, operation.value);
      message = success ? `Inserted ${operation.value}` : `Failed to insert ${operation.value}`;
      break;
    case 'search':
      { const result = hashTable.search(operation.value);
      success = result !== undefined;
      message = success ? `Found ${operation.value}` : `Did not find ${operation.value}`;
      break; }
    case 'delete':
      success = hashTable.delete(operation.value);
      message = success ? `Deleted ${operation.value}` : `Failed to delete ${operation.value}`;
      break;
    case 'traverse':
      hashTable.traverse();
      success = true;
      message = 'Traversed hash table';
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
