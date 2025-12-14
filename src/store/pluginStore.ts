import { create } from 'zustand'
import type { Plugin, PluginMetadata, MatchResult } from '../plugins/types'
import { logger } from '../utils/logger'

interface PluginState {
  // 当前激活的插件
  activePlugin: Plugin | null

  // 当前匹配的插件列表
  matchedPlugins: MatchResult[]

  // 插件元数据（配置、使用统计等）
  pluginMetadata: Record<string, PluginMetadata>

  // Actions
  setActivePlugin: (plugin: Plugin | null) => void
  setMatchedPlugins: (matches: MatchResult[]) => void
  updatePluginMetadata: (pluginId: string, metadata: Partial<PluginMetadata>) => void
  incrementUsageCount: (pluginId: string) => void
  clearActive: () => void
}

export const usePluginStore = create<PluginState>()((set, get) => ({
  activePlugin: null,
  matchedPlugins: [],
  pluginMetadata: {},

  setActivePlugin: (plugin) => {
    logger.log('📦 [Plugin Store] Setting active plugin:', plugin?.name ?? 'null')
    set({ activePlugin: plugin })

    // 更新使用统计
    if (plugin) {
      get().incrementUsageCount(plugin.id)
    }
  },

  setMatchedPlugins: (matches) => {
    logger.log(`📦 [Plugin Store] Setting ${matches.length} matched plugins`)
    set({ matchedPlugins: matches })
  },

  updatePluginMetadata: (pluginId, metadata) => {
    set((state) => ({
      pluginMetadata: {
        ...state.pluginMetadata,
        [pluginId]: {
          ...state.pluginMetadata[pluginId],
          ...metadata,
        },
      },
    }))
  },

  incrementUsageCount: (pluginId) => {
    set((state) => {
      const current = state.pluginMetadata[pluginId] || {
        id: pluginId,
        enabled: true,
        priority: 50,
        usageCount: 0,
      }

      return {
        pluginMetadata: {
          ...state.pluginMetadata,
          [pluginId]: {
            ...current,
            usageCount: (current.usageCount || 0) + 1,
            lastUsed: Date.now(),
          },
        },
      }
    })
  },

  clearActive: () => {
    logger.log('📦 [Plugin Store] Clearing active plugin')
    set({ activePlugin: null })
  },
}))
