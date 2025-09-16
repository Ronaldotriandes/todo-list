/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateTodo, DeleteTodo, getTodos, UpdateTodo } from '@/components/todos/api';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Todo {
  id: string;
  title: string;
  status: string;
  description: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateTodoRequest {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
}

interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  addTodo: (todo: CreateTodoRequest) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchTodos: (page?: number, search?: string) => Promise<void>;
  setCurrentPage: (page: number) => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, _) => ({
      todos: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,

      addTodo: async (todoData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await CreateTodo({ body: todoData });
          const newTodo = {
            id: response.data.id,
            title: response.data.title,
            description: response.data.description,
            dueDate: response.data.dueDate,
          };
          set((state: any) => ({
            todos: [newTodo, ...state.todos],
            isLoading: false
          }));
        } catch (error: any) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create todo',
            isLoading: false
          });
          throw error;
        }
      },

      updateTodo: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updateData: any = {};
          if (updates.title !== undefined) updateData.title = updates.title;
          if (updates.description !== undefined) updateData.description = updates.description;
          if (updates.dueDate !== undefined) updateData.dueDate = updates.dueDate;
          if (updates.status !== undefined) updateData.status = updates.status;
          if (updates.completed !== undefined) {
            updateData.status = updates.completed ? 'done' : 'pending';
          }

          const response = await UpdateTodo({ id, body: updateData });
          const updatedTodo = {
            ...response.data,
            completed: response.data.status === 'done'
          };

          set((state) => ({
            todos: state.todos.map((todo) =>
              todo.id === id ? updatedTodo : todo
            ),
            isLoading: false
          }));
        } catch (error: any) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update todo',
            isLoading: false
          });
          throw error;
        }
      },

      deleteTodo: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await DeleteTodo({ id });

          set((state) => ({
            todos: state.todos.filter((todo) => todo.id !== id),
            isLoading: false
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete todo',
            isLoading: false
          });
          throw error;
        }
      },


      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      fetchTodos: async (page = 1, search = '') => {
        set({ isLoading: true, error: null });
        try {
          const response = await getTodos({ page, search });
          const { data, meta } = response;

          set({
            todos: data.map((x: any) => ({ ...x, completed: x.status === 'done' })),
            currentPage: meta.page,
            totalPages: meta.totalPages,
            totalItems: meta.total || 0,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch todos',
            isLoading: false
          });
        }
      },

      setCurrentPage: (page) => {
        set({ currentPage: page });
      },
    }),
    {
      name: 'todo-storage',
      partialize: (state) => ({ todos: state.todos }),
    }
  )
);