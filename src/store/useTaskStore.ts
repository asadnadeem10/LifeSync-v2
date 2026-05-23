import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Category = 'work' | 'personal' | 'health' | 'learning';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: Priority;
  category: Category;
  createdAt: number;
  reminderTime: string | null;
  shouldNotify: boolean;
  notificationId?: string; // Tracks the exact notification to cancel it later
}

interface TaskStore {
  tasks: Task[];
  userName: string;
  setUserName: (name: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updatedData: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      userName: '',
      setUserName: (name) => set({ userName: name }),

      addTask: (taskData) => set((state) => ({
        tasks: [{ ...taskData, id: Math.random().toString(36).substring(2, 10) }, ...state.tasks]
      })),

      updateTask: (id, updatedData) => set((state) => ({
        tasks: state.tasks.map(t => (t.id === id ? { ...t, ...updatedData } : t))
      })),

      toggleTask: (id) => set((state) => {
        const tasks = state.tasks.map(t => {
          if (t.id === id) {
            // Cancel notification if the user marks it as completed early
            if (!t.isCompleted && t.notificationId) {
              Notifications.cancelScheduledNotificationAsync(t.notificationId).catch(() => {});
            }
            return { ...t, isCompleted: !t.isCompleted };
          }
          return t;
        });
        return { tasks };
      }),

      deleteTask: (id) => set((state) => {
        const taskToDelete = state.tasks.find(t => t.id === id);
        // Destroy the notification if the task is deleted
        if (taskToDelete?.notificationId) {
          Notifications.cancelScheduledNotificationAsync(taskToDelete.notificationId).catch(() => {});
        }
        return { tasks: state.tasks.filter(t => t.id !== id) };
      }),
    }),
    {
      name: 'lifesync-storage', // The unique key for local storage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);