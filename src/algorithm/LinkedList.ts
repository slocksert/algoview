import { TreeNode } from '@/lib/definitions';

// Node for a singly linked list
class SinglyNode<T> {
  value: T;
  next: SinglyNode<T> | null;
  
  constructor(value: T) {
    this.value = value;
    this.next = null;
  }
}

// Node for a doubly linked list
class DoublyNode<T> {
  value: T;
  next: DoublyNode<T> | null;
  prev: DoublyNode<T> | null;
  
  constructor(value: T) {
    this.value = value;
    this.next = null;
    this.prev = null;
  }
}

// Singly linked list implementation
export class SinglyLinkedList<T> {
  private head: SinglyNode<T> | null;
  private size: number;
  
  constructor() {
    this.head = null;
    this.size = 0;
  }
  
  // Insert at given position (0-based)
  insert(value: T, position: number = this.size): boolean {
    if (position < 0 || position > this.size) {
      return false;
    }
    
    const newNode = new SinglyNode(value);
    
    // Insert at the beginning
    if (position === 0) {
      newNode.next = this.head;
      this.head = newNode;
    } else {
      // Insert at other positions
      let current = this.head;
      let index = 0;
      
      while (index < position - 1) {
        current = current!.next;
        index++;
      }
      
      newNode.next = current!.next;
      current!.next = newNode;
    }
    
    this.size++;
    return true;
  }
  
  // Search for a value
  search(value: T): number {
    let current = this.head;
    let index = 0;
    
    while (current) {
      if (current.value === value) {
        return index;
      }
      current = current.next;
      index++;
    }
    
    return -1;
  }
  
  // Delete at given position
  delete(position: number): boolean {
    if (position < 0 || position >= this.size || !this.head) {
      return false;
    }
    
    // Delete from the beginning
    if (position === 0) {
      this.head = this.head.next;
    } else {
      // Delete from other positions
      let current = this.head;
      let index = 0;
      
      while (index < position - 1) {
        current = current!.next;
        index++;
      }
      
      if (current && current.next) {
        current.next = current.next.next;
      }
    }
    
    this.size--;
    return true;
  }
  
  // Get element at position
  get(position: number): T | null {
    if (position < 0 || position >= this.size || !this.head) {
      return null;
    }
    
    let current = this.head;
    let index = 0;
    
    while (index < position) {
      current = current!.next;
      index++;
    }
    
    return current ? current.value : null;
  }
  
  // Get all values as array
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    
    return result;
  }
  
  // Get number of elements
  getSize(): number {
    return this.size;
  }
  
  // Move to front (self-organizing list)
  moveToFront(value: T): boolean {
    if (!this.head) {
      return false;
    }
    
    // If already at front, do nothing
    if (this.head.value === value) {
      return true;
    }
    
    let prev = null;
    let current = this.head;
    
    while (current && current.value !== value) {
      prev = current;
      current = current.next;
    }
    
    // Value not found
    if (!current) {
      return false;
    }
    
    // Remove from current position
    prev!.next = current.next;
    
    // Move to front
    current.next = this.head;
    this.head = current;
    
    return true;
  }
  
  // Transpose (swap with predecessor)
  transpose(value: T): boolean {
    if (!this.head || !this.head.next) {
      return false;
    }
    
    // If at the head, nothing to transpose
    if (this.head.value === value) {
      return false;
    }
    
    let prev = this.head;
    let current = this.head.next;
    
    // Find the node with the value
    while (current && current.value !== value) {
      prev = current;
      current = current.next;
    }
    
    // Value not found
    if (!current) {
      return false;
    }
    
    // Swap values (easier than rewiring nodes)
    const temp = prev.value;
    prev.value = current.value;
    current.value = temp;
    
    return true;
  }
}

// Doubly linked list implementation
export class DoublyLinkedList<T> {
  private head: DoublyNode<T> | null;
  private tail: DoublyNode<T> | null;
  private size: number;
  
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }
  
  // Insert at position
  insert(value: T, position: number = this.size): boolean {
    if (position < 0 || position > this.size) {
      return false;
    }
    
    const newNode = new DoublyNode(value);
    
    // Empty list
    if (this.size === 0) {
      this.head = newNode;
      this.tail = newNode;
    } 
    // Insert at beginning
    else if (position === 0) {
      newNode.next = this.head;
      this.head!.prev = newNode;
      this.head = newNode;
    } 
    // Insert at end
    else if (position === this.size) {
      newNode.prev = this.tail;
      this.tail!.next = newNode;
      this.tail = newNode;
    } 
    // Insert in middle
    else {
      let current = this.head;
      let index = 0;
      
      while (index < position) {
        current = current!.next;
        index++;
      }
      
      newNode.prev = current!.prev;
      newNode.next = current;
      current!.prev!.next = newNode;
      current!.prev = newNode;
    }
    
    this.size++;
    return true;
  }
  
  // Search for a value
  search(value: T): number {
    let current = this.head;
    let index = 0;
    
    while (current) {
      if (current.value === value) {
        return index;
      }
      current = current.next;
      index++;
    }
    
    return -1;
  }
  
  // Delete at position
  delete(position: number): boolean {
    if (position < 0 || position >= this.size || !this.head) {
      return false;
    }
    
    // Only one element
    if (this.size === 1) {
      this.head = null;
      this.tail = null;
    } 
    // Delete from beginning
    else if (position === 0) {
      this.head = this.head.next;
      this.head!.prev = null;
    } 
    // Delete from end
    else if (position === this.size - 1) {
      this.tail = this.tail!.prev;
      this.tail!.next = null;
    } 
    // Delete from middle
    else {
      let current = this.head;
      let index = 0;
      
      while (index < position) {
        current = current!.next;
        index++;
      }
      
      current!.prev!.next = current!.next;
      current!.next!.prev = current!.prev;
    }
    
    this.size--;
    return true;
  }
  
  // Get element at position
  get(position: number): T | null {
    if (position < 0 || position >= this.size) {
      return null;
    }
    
    // Optimize by choosing the best direction to traverse
    if (position < this.size / 2) {
      // Traverse from head
      let current = this.head;
      let index = 0;
      
      while (index < position) {
        current = current!.next;
        index++;
      }
      
      return current ? current.value : null;
    } else {
      // Traverse from tail
      let current = this.tail;
      let index = this.size - 1;
      
      while (index > position) {
        current = current!.prev;
        index--;
      }
      
      return current ? current.value : null;
    }
  }
  
  // Get all values as array
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    
    return result;
  }
  
  // Get number of elements
  getSize(): number {
    return this.size;
  }
}

// Function to run linked list algorithm operations
export function runLinkedListAlgorithm(tree: TreeNode, operation: any): {
  newTree: TreeNode;
  operation: string;
  success: boolean;
  message: string;
} {
  // Create linked list
  const linkedList = new SinglyLinkedList<number>();
  let success = false;
  let message = '';
  
  // Convert tree to linked list if needed
  if (tree && !tree.isEmpty) {
    // Replace recursive approach with iterative using a stack
    const stack: TreeNode[] = [tree];
    
    while (stack.length > 0) {
      const node = stack.pop()!;
      
      if (node && !node.isEmpty) {
        linkedList.insert(Number(node.value));
        
        if (node.children) {
          // Push children in reverse order for correct processing order
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
      success = linkedList.insert(operation.value);
      message = success ? `Inserted ${operation.value}` : `Failed to insert ${operation.value}`;
      break;
    case 'search':
      { const index = linkedList.search(operation.value);
      success = index !== -1;
      message = success ? `Found ${operation.value} at index ${index}` : `Did not find ${operation.value}`;
      break; }
    case 'delete':
      // Delete by value for benchmarking
      { const deleteIndex = linkedList.search(operation.value);
      if (deleteIndex !== -1) {
        success = linkedList.delete(deleteIndex);
        message = success ? `Deleted ${operation.value}` : `Failed to delete ${operation.value}`;
      } else {
        success = false;
        message = `Value ${operation.value} not found for deletion`;
      }
      break; }
    case 'traverse':
      linkedList.toArray();
      success = true;
      message = 'Traversed linked list';
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
