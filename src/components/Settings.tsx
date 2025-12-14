import type React from 'react'
import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useShortcutStore } from '../store/shortcutStore'

const Settings: React.FC = () => {
  const shortcuts = useShortcutStore((state) => state.shortcuts)
  const updateShortcut = useShortcutStore((state) => state.updateShortcut)
  const resetShortcuts = useShortcutStore((state) => state.resetShortcuts)
  const toggleSettings = useAppStore((state) => state.toggleSettings)

  const [editing, setEditing] = useState<string | null>(null)
  const [tempKey, setTempKey] = useState('')
  const [tempModifiers, setTempModifiers] = useState<string[]>([])

  // 处理快捷键编辑
  const handleEditShortcut = (action: string) => {
    const shortcut = shortcuts[action]
    setEditing(action)
    setTempKey(shortcut.key)
    setTempModifiers([...shortcut.modifiers])
  }

  // 保存快捷键
  const handleSaveShortcut = (action: string) => {
    updateShortcut(action, tempKey, tempModifiers)
    setEditing(null)
  }

  // 处理修饰键切换
  const toggleModifier = (modifier: string) => {
    setTempModifiers((prev) =>
      prev.includes(modifier) ? prev.filter((m) => m !== modifier) : [...prev, modifier],
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 w-full max-w-[500px] shadow-2xl animate-slideIn">
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
        <button
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors"
          onClick={toggleSettings}
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h3>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div className="space-y-1">
              <span className="font-semibold text-gray-900">Toggle Window</span>
              <span className="text-sm text-gray-500 block">Show/hide the main window</span>
            </div>
            {editing === 'toggleWindow' ? (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {['Cmd', 'Ctrl', 'Shift', 'Alt'].map((mod) => (
                    <button
                      key={mod}
                      className={`px-3 py-1 text-sm rounded ${tempModifiers.includes(mod) ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      onClick={() => toggleModifier(mod)}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value.toUpperCase())}
                  placeholder="Key"
                  className="w-[80px] px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-mono text-center"
                  maxLength={1}
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveShortcut('toggleWindow')}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded shadow-sm text-sm font-mono">
                  {shortcuts.toggleWindow.modifiers.join('+')}+{shortcuts.toggleWindow.key}
                </span>
                <button
                  onClick={() => handleEditShortcut('toggleWindow')}
                  className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-secondary transition-colors"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div className="space-y-1">
              <span className="font-semibold text-gray-900">Open Settings</span>
              <span className="text-sm text-gray-500 block">Open this settings panel</span>
            </div>
            {editing === 'openSettings' ? (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {['Cmd', 'Ctrl', 'Shift', 'Alt'].map((mod) => (
                    <button
                      key={mod}
                      className={`px-3 py-1 text-sm rounded ${tempModifiers.includes(mod) ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      onClick={() => toggleModifier(mod)}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value.toUpperCase())}
                  placeholder="Key"
                  className="w-[80px] px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-mono text-center"
                  maxLength={1}
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveShortcut('openSettings')}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded shadow-sm text-sm font-mono">
                  {shortcuts.openSettings.modifiers.join('+')}+{shortcuts.openSettings.key}
                </span>
                <button
                  onClick={() => handleEditShortcut('openSettings')}
                  className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-secondary transition-colors"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center pt-4 border-t border-gray-200">
          <button
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
