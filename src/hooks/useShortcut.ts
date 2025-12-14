import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut'
import { useCallback, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { useShortcutStore } from '../store/shortcutStore'

export const useShortcut = () => {
  const shortcuts = useShortcutStore((state) => state.shortcuts)
  const toggleWindow = useAppStore((state) => state.toggleWindow)
  const toggleSettings = useAppStore((state) => state.toggleSettings)

  // 注册所有快捷键
  const registerShortcuts = useCallback(async () => {
    // 先注销所有已注册的快捷键
    await unregisterAll()

    // 注册切换窗口快捷键
    const toggleKey = shortcuts.toggleWindow
    const toggleAccelerator = `${toggleKey.modifiers.join('+')}+${toggleKey.key}`
    await register(toggleAccelerator, toggleWindow)

    // 注册打开设置快捷键
    const settingsKey = shortcuts.openSettings
    const settingsAccelerator = `${settingsKey.modifiers.join('+')}+${settingsKey.key}`
    await register(settingsAccelerator, toggleSettings)

    console.log('Shortcuts registered:', {
      toggleWindow: toggleAccelerator,
      openSettings: settingsAccelerator,
    })
  }, [shortcuts, toggleWindow, toggleSettings])

  // 初始化注册快捷键
  useEffect(() => {
    registerShortcuts()

    // 组件卸载时注销所有快捷键
    return () => {
      unregisterAll()
    }
  }, [registerShortcuts])

  // 快捷键配置变化时重新注册
  useEffect(() => {
    registerShortcuts()
  }, [shortcuts, registerShortcuts])

  return {
    registerShortcuts,
  }
}
