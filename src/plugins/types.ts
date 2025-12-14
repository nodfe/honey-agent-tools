import type React from 'react'

/**
 * 插件配置接口
 */
export interface PluginConfig {
  // 匹配规则
  keywords?: string[] // 关键词触发，如 ['翻译', 'translate']
  pattern?: RegExp // 正则表达式匹配
  fuzzyMatch?: boolean // 是否启用模糊搜索
  fileTypes?: string[] // 支持的文件类型，如 ['.jpg', '.png']

  // 行为配置
  priority?: number // 优先级 (0-100)，默认 50
  enabled?: boolean // 是否启用，默认 true
  featured?: boolean // 是否为精选插件

  // 权限（未来扩展）
  permissions?: string[] // 如 ['clipboard', 'filesystem', 'network']
}

/**
 * 插件上下文 - 传递给插件的执行环境
 */
export interface PluginContext {
  // 用户输入
  input: string // 提取后的实际输入（去除关键词）
  rawInput: string // 原始输入

  // 环境信息
  platform: 'mac' | 'windows' | 'linux'
  clipboard?: string
  selection?: string

  // 工具方法
  showNotification: (message: string) => void
  copyToClipboard: (text: string) => Promise<void>
  openURL: (url: string) => Promise<void>
  hideWindow: () => Promise<void>

  // 结果展示
  showResult: (result: PluginResult) => void
}

/**
 * 插件结果
 */
export interface PluginResult {
  type: 'text' | 'html' | 'list' | 'custom'
  content: any
  actions?: PluginAction[]
}

/**
 * 插件操作
 */
export interface PluginAction {
  name: string
  icon?: React.ReactNode
  handler: () => void
  shortcut?: string
}

/**
 * 插件接口
 */
export interface Plugin {
  // 基本信息
  id: string
  name: string
  description: string
  version: string
  author: string
  icon?: React.ReactNode

  // 配置
  config: PluginConfig

  // 生命周期（可选）
  onLoad?: () => void | Promise<void>
  onUnload?: () => void | Promise<void>

  // 核心方法
  execute: (context: PluginContext) => void | Promise<void>

  // 可选方法
  onInputChange?: (input: string) => void // 实时预览
  getPreview?: (input: string) => React.ReactNode // 获取预览内容
}

/**
 * 匹配结果
 */
export interface MatchResult {
  plugin: Plugin
  score: number // 匹配分数 (0-100)
  extractedInput: string // 提取出的实际输入
  matchType: 'keyword' | 'fuzzy' | 'regex' | 'fileType' | 'always'
}

/**
 * 插件元数据（用于存储配置）
 */
export interface PluginMetadata {
  id: string
  enabled: boolean
  priority: number
  lastUsed?: number
  usageCount?: number
}
