import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ShortcutConfig } from '../types/shortcut'

interface ShortcutStore {
  shortcuts: ShortcutConfig
  version: number // 用于触发重新注册
  updateShortcut: (action: string, key: string, modifiers: string[]) => void
  resetShortcuts: () => void
  getVersion: () => number
}

const defaultShortcuts: ShortcutConfig = {
  toggleWindow: {
    key: 'Space',
    modifiers: ['Cmd', 'Shift'],
  },
  openSettings: {
    key: 'S',
    modifiers: ['Cmd', 'Shift'],
  },
}

export const useShortcutStore = create<ShortcutStore>()(
  persist(
    (set, get) => ({
      shortcuts: defaultShortcuts,
      version: 0,

      updateShortcut: (action, key, modifiers) =>
        set((state) => ({
          shortcuts: {
            ...state.shortcuts,
            [action]: { key, modifiers },
          },
          version: state.version + 1, // 递增版本号触发重新注册
        })),

      resetShortcuts: () =>
        set((state) => ({
          shortcuts: defaultShortcuts,
          version: state.version + 1, // 递增版本号触发重新注册
        })),

      getVersion: () => get().version,
    }),
    {
      name: 'shortcut-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
