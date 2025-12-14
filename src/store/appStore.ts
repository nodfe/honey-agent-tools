import { invoke } from '@tauri-apps/api/core'
import { create } from 'zustand'

interface AppStore {
  isWindowVisible: boolean
  toggleWindow: () => Promise<void>
  showWindow: () => Promise<void>
  hideWindow: () => Promise<void>
  isSettingsOpen: boolean
  toggleSettings: () => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  isWindowVisible: true,
  isSettingsOpen: false,

  toggleWindow: async () => {
    try {
      console.log('📦 [状态管理] toggleWindow 被调用')
      console.log('📦 [状态管理] 当前状态:', { 
        isWindowVisible: get().isWindowVisible,
        isSettingsOpen: get().isSettingsOpen
      })
      console.log('📦 [状态管理] 调用 Tauri 命令...')
      await invoke('toggle_window_visibility')
      console.log('📦 [状态管理] Tauri 命令调用成功，准备更新状态')
      
      const newState = !get().isWindowVisible
      console.log('📦 [状态管理] 将 isWindowVisible 从', get().isWindowVisible, '更新为', newState)
      set((state) => ({ isWindowVisible: !state.isWindowVisible }))
      console.log('📦 [状态管理] 状态更新完成，新状态:', { 
        isWindowVisible: get().isWindowVisible,
        isSettingsOpen: get().isSettingsOpen
      })
    } catch (error) {
      console.error('❌ [状态管理] toggleWindow 失败:', error)
    }
  },

  showWindow: async () => {
    try {
      console.log('📦 [状态管理] showWindow 被调用')
      console.log('📦 [状态管理] 当前状态:', { 
        isWindowVisible: get().isWindowVisible,
        isSettingsOpen: get().isSettingsOpen
      })
      console.log('📦 [状态管理] 调用 Tauri show_window 命令...')
      await invoke('show_window')
      console.log('📦 [状态管理] Tauri show_window 命令调用成功')
      console.log('📦 [状态管理] 将 isWindowVisible 更新为 true')
      set({ isWindowVisible: true })
      console.log('📦 [状态管理] showWindow 完成，新状态:', { 
        isWindowVisible: get().isWindowVisible,
        isSettingsOpen: get().isSettingsOpen
      })
    } catch (error) {
      console.error('❌ [状态管理] showWindow 失败:', error)
    }
  },

  hideWindow: async () => {
    try {
      console.log('📦 [状态管理] hideWindow 被调用')
      console.log('📦 [状态管理] 当前状态:', { 
        isWindowVisible: get().isWindowVisible,
        isSettingsOpen: get().isSettingsOpen
      })
      console.log('📦 [状态管理] 调用 Tauri hide_window 命令...')
      await invoke('hide_window')
      console.log('📦 [状态管理] Tauri hide_window 命令调用成功')
      console.log('📦 [状态管理] 将 isWindowVisible 更新为 false')
      set({ isWindowVisible: false })
      console.log('📦 [状态管理] hideWindow 完成，新状态:', { 
        isWindowVisible: get().isWindowVisible,
        isSettingsOpen: get().isSettingsOpen
      })
    } catch (error) {
      console.error('❌ [状态管理] hideWindow 失败:', error)
    }
  },

  toggleSettings: () => {
    console.log('📦 [状态管理] toggleSettings 被调用')
    console.log('📦 [状态管理] 当前状态:', { 
      isWindowVisible: get().isWindowVisible,
      isSettingsOpen: get().isSettingsOpen
    })
    set((state) => ({ isSettingsOpen: !state.isSettingsOpen }))
    console.log('📦 [状态管理] toggleSettings 完成，新状态:', { 
      isWindowVisible: get().isWindowVisible,
      isSettingsOpen: get().isSettingsOpen
    })
  },
}))
