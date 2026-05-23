// src/lib/storage.ts
import { Platform } from 'react-native';
import { StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

let zustandStorage: StateStorage;

if (Platform.OS === 'web') {
  // Web Fallback: Safe, reliable, prevents browser crashes
  zustandStorage = {
    getItem: (name) => AsyncStorage.getItem(name),
    setItem: (name, value) => AsyncStorage.setItem(name, value),
    removeItem: (name) => AsyncStorage.removeItem(name),
  };
} else {
  // Mobile Engine: Blazing fast native C++ storage
  const { MMKV } = require('react-native-mmkv');
  const storage = new MMKV({ id: 'lifesync-premium-storage' });
  
  zustandStorage = {
    setItem: (name, value) => storage.set(name, value),
    getItem: (name) => {
      const value = storage.getString(name);
      return value ?? null;
    },
    removeItem: (name) => storage.delete(name),
  };
}

export { zustandStorage };