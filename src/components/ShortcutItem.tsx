import type React from 'react'
import { useState } from 'react'

interface ShortcutItemProps {
  title: string
  description: string
  currentKey: string
  currentModifiers: string[]
  onSave: (key: string, modifiers: string[]) => void
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({
  title,
  description,
  currentKey,
  currentModifiers,
  onSave,
}) => {
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
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="space-y-1">
        <span className="font-semibold text-gray-900">{title}</span>
        <span className="text-sm text-gray-500 block">{description}</span>
      </div>
      {isEditing ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {['Cmd', 'Ctrl', 'Shift', 'Alt'].map((mod) => (
              <button
                key={mod}
                type="button"
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
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 mt-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded shadow-sm text-sm font-mono">
            {currentModifiers.join('+')}+{currentKey}
          </span>
          <button
            type="button"
            onClick={handleEdit}
            className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-secondary transition-colors"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  )
}

export default ShortcutItem
