import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ShortcutConfig } from '../types/shortcut'

interface ShortcutStore {
  shortcuts: ShortcutConfig
  updateShortcut: (action: string, key: string, modifiers: string[]) => void
  resetShortcuts: () => void
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
    (set) => ({
      shortcuts: defaultShortcuts,

      updateShortcut: (action, key, modifiers) =>
        set((state) => ({
          shortcuts: {
            ...state.shortcuts,
            [action]: { key, modifiers },
          },
        })),

      resetShortcuts: () =>
        set(() => ({
          shortcuts: defaultShortcuts,
        })),
    }),
    {
      name: 'shortcut-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
