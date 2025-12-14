import { create } from 'zustand'

interface AppStore {
  isWindowVisible: boolean
  toggleWindow: () => void
  showWindow: () => void
  hideWindow: () => void
  isSettingsOpen: boolean
  toggleSettings: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  isWindowVisible: false,
  isSettingsOpen: false,

  toggleWindow: () => set((state) => ({ isWindowVisible: !state.isWindowVisible })),
  showWindow: () => set({ isWindowVisible: true }),
  hideWindow: () => set({ isWindowVisible: false }),

  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
}))
