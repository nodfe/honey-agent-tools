export interface Shortcut {
  id: string
  key: string
  modifiers: string[]
  description: string
  action: () => void
}

export interface ShortcutConfig {
  [key: string]: {
    key: string
    modifiers: string[]
  }
}

export type ShortcutAction = 'toggleWindow' | 'openSettings' | string
