import { useEffect } from 'react'
import { pluginRegistry } from '../plugins/registry'
import { pluginMatcher } from '../plugins/matcher'
import { usePluginStore } from '../store/pluginStore'
import { useSearchStore } from '../store/searchStore'
import { logger } from '../utils/logger'

/**
 * 插件匹配 Hook
 * 监听搜索查询变化，自动匹配插件
 */
export const usePluginMatcher = () => {
  const query = useSearchStore((state) => state.query)
  const setMatchedPlugins = usePluginStore((state) => state.setMatchedPlugins)
  const setShowPluginList = useSearchStore((state) => state.setShowPluginList)
  const setSelectedIndex = useSearchStore((state) => state.setSelectedIndex)

  useEffect(() => {
    // 如果查询为空，清空匹配结果
    if (!query || query.trim().length === 0) {
      setMatchedPlugins([])
      setShowPluginList(false)
      setSelectedIndex(0)
      return
    }

    // 获取所有启用的插件
    const plugins = pluginRegistry.getEnabled()

    // 执行匹配
    const matches = pluginMatcher.match(query, plugins)

    // 更新状态
    setMatchedPlugins(matches)
    setShowPluginList(matches.length > 0)
    setSelectedIndex(0) // 重置选中索引

    logger.log(`🔍 [usePluginMatcher] Matched ${matches.length} plugins for query: "${query}"`)
  }, [query, setMatchedPlugins, setShowPluginList, setSelectedIndex])
}
