import type { Plugin } from './types'
import { logger } from '../utils/logger'

/**
 * 插件注册表 - 管理所有插件的注册、注销和访问
 */
class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map()

  /**
   * 注册插件
   */
  register(plugin: Plugin): void {
    logger.log(`📦 [Plugin Registry] Registering plugin: ${plugin.name}`)

    // 验证插件
    this.validatePlugin(plugin)

    // 检查是否已注册
    if (this.plugins.has(plugin.id)) {
      logger.warn(`⚠️ [Plugin Registry] Plugin ${plugin.id} already registered, overwriting`)
    }

    // 调用 onLoad 生命周期
    if (plugin.onLoad) {
      try {
        plugin.onLoad()
      } catch (error) {
        logger.error(`❌ [Plugin Registry] Failed to load plugin ${plugin.id}:`, error)
        return
      }
    }

    this.plugins.set(plugin.id, plugin)
    logger.log(`✅ [Plugin Registry] Plugin ${plugin.name} registered successfully`)
  }

  /**
   * 注销插件
   */
  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)

    if (!plugin) {
      logger.warn(`⚠️ [Plugin Registry] Plugin ${pluginId} not found`)
      return
    }

    // 调用 onUnload 生命周期
    if (plugin.onUnload) {
      try {
        plugin.onUnload()
      } catch (error) {
        logger.error(`❌ [Plugin Registry] Failed to unload plugin ${pluginId}:`, error)
      }
    }

    this.plugins.delete(pluginId)
    logger.log(`✅ [Plugin Registry] Plugin ${plugin.name} unregistered`)
  }

  /**
   * 获取所有插件
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 获取启用的插件
   */
  getEnabled(): Plugin[] {
    return this.getAll().filter((plugin) => plugin.config.enabled !== false)
  }

  /**
   * 根据ID获取插件
   */
  get(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * 检查插件是否已注册
   */
  has(pluginId: string): boolean {
    return this.plugins.has(pluginId)
  }

  /**
   * 清空所有插件
   */
  clear(): void {
    // 先注销所有插件
    for (const pluginId of this.plugins.keys()) {
      this.unregister(pluginId)
    }

    this.plugins.clear()
    logger.log('🗑️ [Plugin Registry] All plugins cleared')
  }

  /**
   * 验证插件是否有效
   */
  private validatePlugin(plugin: Plugin): void {
    if (!plugin.id || typeof plugin.id !== 'string') {
      throw new Error('Plugin must have a valid id')
    }

    if (!plugin.name || typeof plugin.name !== 'string') {
      throw new Error('Plugin must have a valid name')
    }

    if (!plugin.execute || typeof plugin.execute !== 'function') {
      throw new Error('Plugin must have an execute function')
    }

    if (!plugin.config || typeof plugin.config !== 'object') {
      throw new Error('Plugin must have a config object')
    }
  }

  /**
   * 获取插件数量
   */
  get size(): number {
    return this.plugins.size
  }
}

// 导出全局单例
export const pluginRegistry = new PluginRegistry()
