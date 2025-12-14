import { create } from 'zustand'
import { logger } from '../utils/logger'

interface SearchState {
  // 当前搜索查询
  query: string

  // 选中的插件索引
  selectedIndex: number

  // 提取出的输入（去除关键词后的内容）
  extractedInput: string

  // 是否显示插件列表
  showPluginList: boolean

  // Actions
  setQuery: (query: string) => void
  setSelectedIndex: (index: number) => void
  setExtractedInput: (input: string) => void
  setShowPluginList: (show: boolean) => void
  reset: () => void
  incrementSelectedIndex: (maxIndex: number) => void
  decrementSelectedIndex: (maxIndex: number) => void
}

export const useSearchStore = create<SearchState>()((set, get) => ({
  query: '',
  selectedIndex: 0,
  extractedInput: '',
  showPluginList: false,

  setQuery: (query) => {
    logger.log(`🔍 [Search Store] Query updated: "${query}"`)
    set({ query })
  },

  setSelectedIndex: (selectedIndex) => {
    set({ selectedIndex })
  },

  setExtractedInput: (extractedInput) => {
    set({ extractedInput })
  },

  setShowPluginList: (show) => {
    set({ showPluginList: show })
  },

  reset: () => {
    logger.log('🔍 [Search Store] Resetting search state')
    set({
      query: '',
      selectedIndex: 0,
      extractedInput: '',
      showPluginList: false,
    })
  },

  incrementSelectedIndex: (maxIndex) => {
    const current = get().selectedIndex
    set({ selectedIndex: current < maxIndex ? current + 1 : 0 })
  },

  decrementSelectedIndex: (maxIndex) => {
    const current = get().selectedIndex
    set({ selectedIndex: current > 0 ? current - 1 : maxIndex })
  },
}))
