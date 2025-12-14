import { useAppStore } from '@/store/appStore'
import { useShortcutStore } from '@/store/shortcutStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'

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

interface ShortcutItemProps {
  title: string
  description: string
  currentKey: string
  currentModifiers: string[]
  onSave: (key: string, modifiers: string[]) => void
}

function ShortcutItem({
  title,
  description,
  currentKey,
  currentModifiers,
  onSave,
}: ShortcutItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempKey, setTempKey] = useState(currentKey)
  const [tempModifiers, setTempModifiers] = useState(currentModifiers)

  const handleEdit = () => {
    setIsEditing(true)
    setTempKey(currentKey)
    setTempModifiers([...currentModifiers])
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = () => {
    onSave(tempKey, tempModifiers)
    setIsEditing(false)
  }

  const toggleModifier = (modifier: string) => {
    setTempModifiers((prev) =>
      prev.includes(modifier) ? prev.filter((m) => m !== modifier) : [...prev, modifier],
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {['Cmd', 'Ctrl', 'Shift', 'Alt'].map((mod) => (
                <Button
                  key={mod}
                  type="button"
                  size="sm"
                  variant={tempModifiers.includes(mod) ? 'default' : 'outline'}
                  onClick={() => toggleModifier(mod)}
                >
                  {mod}
                </Button>
              ))}
            </div>
            <input
              type="text"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value.toUpperCase())}
              placeholder="Key"
              className="w-[80px] px-3 py-2 border rounded-md text-center font-mono"
              maxLength={1}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="font-mono">
              {currentModifiers.join('+')}+{currentKey}
            </Badge>
            <Button size="sm" onClick={handleEdit}>
              Edit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function Settings() {
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
    <Card className="w-full max-w-[500px] shadow-2xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Settings</CardTitle>
          <Button variant="ghost" size="icon" onClick={toggleSettings} className="h-8 w-8">
            <span className="text-2xl">×</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>

          <div className="space-y-3">
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
        </div>

        <Separator />

        <div className="flex justify-center">
          <Button variant="destructive" onClick={resetShortcuts}>
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
