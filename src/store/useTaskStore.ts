// src/store/useTaskStore.ts
import { zustandStorage } from '@/lib/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'health' | 'learning';

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: Priority;
  category: Category;
  createdAt: number; 
  reminderTime: string | null; 
  shouldNotify: boolean;       
}

interface TaskState {
  tasks: Task[];
  userName: string | null;
  globalNotifications: boolean; // NEW: Master switch for all alerts
  setUserName: (name: string) => void;
  setGlobalNotifications: (enabled: boolean) => void; // NEW: Setter
  addTask: (task: Omit<Task, 'id'>) => void; 
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  getTasksByDate: (dateString: string) => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      userName: null,
      globalNotifications: true, // Defaults to true
      
      setUserName: (name) => set({ userName: name }),
      setGlobalNotifications: (enabled) => set({ globalNotifications: enabled }),

      addTask: (taskData) =>
        set((state) => ({
          tasks: [
            {
              ...taskData,
              id: Math.random().toString(36).substring(2, 15),
            },
            ...state.tasks,
          ],
        })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      getTasksByDate: (dateString) => {
        return get().tasks.filter(
          (t) => new Date(t.createdAt).toDateString() === dateString
        );
      },
    }),
    {
      name: 'lifesync-premium-tasks',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);