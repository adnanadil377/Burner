/**
 * 🎓 ZUSTAND ADVANCED PATTERNS & BEST PRACTICES
 * 
 * This file demonstrates advanced Zustand techniques you'll use in real applications.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

/**
 * 🎓 LESSON 9: Middleware
 * 
 * Zustand supports middleware to enhance your stores:
 * 
 * 1. `persist` - Saves state to localStorage/sessionStorage
 * 2. `devtools` - Redux DevTools integration for debugging
 * 3. `subscribeWithSelector` - Allows subscribing to specific state changes
 * 4. `immer` - Simplified immutable state updates
 */

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

interface TodoState {
  todos: TodoItem[];
  filter: 'all' | 'active' | 'completed';
  
  // Actions
  addTodo: (title: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
  clearCompleted: () => void;
  
  // Computed/derived values (using selectors)
  getFilteredTodos: () => TodoItem[];
  getTodoCount: () => { total: number; active: number; completed: number };
}

/**
 * 🎓 LESSON 10: DevTools Integration
 * 
 * The `devtools` middleware lets you inspect state changes in Redux DevTools.
 * Great for debugging!
 */

export const useTodoStore = create<TodoState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      todos: [],
      filter: 'all',

      addTodo: (title: string) => {
        const newTodo: TodoItem = {
          id: Date.now().toString(),
          title,
          completed: false,
          createdAt: new Date(),
        };
        
        set(
          (state) => ({ todos: [...state.todos, newTodo] }),
          false, // Don't replace state, merge it
          'addTodo' // Action name in DevTools
        );
      },

      toggleTodo: (id: string) => {
        set(
          (state) => ({
            todos: state.todos.map((todo) =>
              todo.id === id ? { ...todo, completed: !todo.completed } : todo
            ),
          }),
          false,
          'toggleTodo'
        );
      },

      deleteTodo: (id: string) => {
        set(
          (state) => ({
            todos: state.todos.filter((todo) => todo.id !== id),
          }),
          false,
          'deleteTodo'
        );
      },

      setFilter: (filter) => {
        set({ filter }, false, 'setFilter');
      },

      clearCompleted: () => {
        set(
          (state) => ({
            todos: state.todos.filter((todo) => !todo.completed),
          }),
          false,
          'clearCompleted'
        );
      },

      /**
       * 🎓 LESSON 11: Derived/Computed Values
       * 
       * Instead of storing computed values in state, create functions
       * that calculate them on demand. This keeps your state minimal
       * and prevents stale data.
       */
      getFilteredTodos: () => {
        const { todos, filter } = get();
        
        if (filter === 'active') {
          return todos.filter((todo) => !todo.completed);
        }
        if (filter === 'completed') {
          return todos.filter((todo) => todo.completed);
        }
        return todos;
      },

      getTodoCount: () => {
        const todos = get().todos;
        return {
          total: todos.length,
          active: todos.filter((t) => !t.completed).length,
          completed: todos.filter((t) => t.completed).length,
        };
      },
    })),
    { name: 'TodoStore' } // Name in Redux DevTools
  )
);

/**
 * 🎓 LESSON 12: Subscribing to State Changes
 * 
 * You can subscribe to state changes outside of React components.
 * Useful for logging, analytics, or syncing with external systems.
 */

// Example: Log when a todo is added
useTodoStore.subscribe(
  (state) => state.todos.length,
  (length, prevLength) => {
    if (length > prevLength) {
      console.log('🎉 New todo added! Total:', length);
    }
  }
);

/**
 * 🎓 LESSON 13: Using the Store in Components
 * 
 * Example component using the TodoStore:
 * 
 * ```tsx
 * import { useTodoStore } from '@/stores/useTodoStore';
 * 
 * function TodoList() {
 *   // Only re-render when these specific values change
 *   const filteredTodos = useTodoStore(state => state.getFilteredTodos());
 *   const addTodo = useTodoStore(state => state.addTodo);
 *   const toggleTodo = useTodoStore(state => state.toggleTodo);
 *   
 *   return (
 *     <div>
 *       <input 
 *         onKeyPress={(e) => {
 *           if (e.key === 'Enter') {
 *             addTodo(e.currentTarget.value);
 *             e.currentTarget.value = '';
 *           }
 *         }}
 *       />
 *       {filteredTodos.map(todo => (
 *         <div key={todo.id} onClick={() => toggleTodo(todo.id)}>
 *           {todo.completed ? '✓' : '○'} {todo.title}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * 🎓 LESSON 14: Shallow Comparison
 * 
 * By default, Zustand uses strict equality (===) for comparison.
 * For objects, use shallow comparison to prevent unnecessary re-renders:
 * 
 * ```tsx
 * import { shallow } from 'zustand/shallow';
 * 
 * const { addTodo, toggleTodo } = useTodoStore(
 *   state => ({ addTodo: state.addTodo, toggleTodo: state.toggleTodo }),
 *   shallow
 * );
 * ```
 */

/**
 * 🎓 LESSON 15: Resetting State
 * 
 * Create a reset action to restore initial state:
 */

interface ResettableState {
  count: number;
  name: string;
  reset: () => void;
}

const initialState = {
  count: 0,
  name: '',
};

export const useResettableStore = create<ResettableState>((set) => ({
  ...initialState,
  reset: () => set(initialState),
}));

/**
 * 🎓 LESSON 16: Async Actions
 * 
 * Handle async operations like API calls:
 */

interface UserStore {
  users: any[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    // Set loading state
    set({ loading: true, error: null });

    try {
      const response = await fetch('https://api.example.com/users');
      const users = await response.json();
      
      // Update with fetched data
      set({ users, loading: false });
    } catch (error) {
      // Handle errors
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch',
        loading: false 
      });
    }
  },
}));

/**
 * 🎓 KEY TAKEAWAYS
 * 
 * 1. Zustand is simple but powerful
 * 2. No providers or wrappers needed
 * 3. Use selectors to optimize re-renders
 * 4. Middleware adds useful features (persist, devtools, etc.)
 * 5. Keep stores focused on a single concern
 * 6. Computed values should be functions, not stored state
 * 7. Async actions work naturally with async/await
 * 8. TypeScript gives you full type safety
 * 
 * 📚 Further Reading:
 * - https://docs.pmnd.rs/zustand/getting-started/introduction
 * - https://github.com/pmndrs/zustand
 */
