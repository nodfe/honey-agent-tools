import type React from 'react'
import { useAppStore } from '../store/appStore'
import { useShortcutStore } from '../store/shortcutStore'
import ShortcutItem from './ShortcutItem'

// 有效的快捷键列表
const VALID_KEYS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'Space',
  'Enter',
  'Tab',
  'Escape',
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12',
]

const Settings: React.FC = () => {
  const shortcuts = useShortcutStore((state) => state.shortcuts)
  const updateShortcut = useShortcutStore((state) => state.updateShortcut)
  const resetShortcuts = useShortcutStore((state) => state.resetShortcuts)
  const toggleSettings = useAppStore((state) => state.toggleSettings)

  // 检查快捷键冲突
  const checkConflict = (action: string, key: string, modifiers: string[]): boolean => {
    const newAccelerator = `${modifiers.join('+')}+${key}`

    for (const [existingAction, shortcut] of Object.entries(shortcuts)) {
      if (existingAction === action) continue

      const existingAccelerator = `${shortcut.modifiers.join('+')}+${shortcut.key}`
      if (existingAccelerator === newAccelerator) {
        return true
      }
    }

    return false
  }

  // 验证快捷键输入
  const validateKey = (key: string): boolean => {
    return VALID_KEYS.includes(key.toUpperCase())
  }

  // 保存快捷键
  const handleSaveShortcut = (action: string, key: string, modifiers: string[]) => {
    // 验证键名
    if (!validateKey(key)) {
      alert(`Invalid key: "${key}". Please use a valid key like A-Z, 0-9, Space, etc.`)
      return
    }

    // 验证修饰键
    if (modifiers.length === 0) {
      alert('Please select at least one modifier key (Cmd, Ctrl, Shift, or Alt)')
      return
    }

    // 检查冲突
    if (checkConflict(action, key, modifiers)) {
      alert('This shortcut is already in use! Please choose a different combination.')
      return
    }

    // 保存快捷键
    updateShortcut(action, key, modifiers)
  }

  return (
    <div className="bg-white rounded-xl p-6 w-full max-w-[500px] shadow-2xl animate-slideIn">
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors text-3xl w-8 h-8 flex items-center justify-center leading-none"
          onClick={toggleSettings}
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h3>

        <div className="space-y-4">
          <ShortcutItem
            title="Toggle Window"
            description="Show/hide the main window"
            currentKey={shortcuts.toggleWindow.key}
            currentModifiers={shortcuts.toggleWindow.modifiers}
            onSave={(key, modifiers) => handleSaveShortcut('toggleWindow', key, modifiers)}
          />

          <ShortcutItem
            title="Open Settings"
            description="Open this settings panel"
            currentKey={shortcuts.openSettings.key}
            currentModifiers={shortcuts.openSettings.modifiers}
            onSave={(key, modifiers) => handleSaveShortcut('openSettings', key, modifiers)}
          />
        </div>

        <div className="flex justify-center pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={resetShortcuts}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
