import type { Plugin, MatchResult } from './types'
import { logger } from '../utils/logger'

/**
 * 插件匹配引擎 - 根据用户输入匹配合适的插件
 */
export class PluginMatcher {
  /**
   * 匹配插件
   * @param input 用户输入
   * @param plugins 可用插件列表
   * @returns 匹配结果列表，按分数排序
   */
  match(input: string, plugins: Plugin[]): MatchResult[] {
    if (!input || input.trim().length === 0) {
      return []
    }

    const results: MatchResult[] = []
    const trimmedInput = input.trim()

    for (const plugin of plugins) {
      // 跳过禁用的插件
      if (plugin.config.enabled === false) {
        continue
      }

      // 1. 关键词匹配（优先级最高）
      const keywordMatch = this.matchKeyword(trimmedInput, plugin)
      if (keywordMatch) {
        results.push(keywordMatch)
        continue
      }

      // 2. 正则匹配
      const regexMatch = this.matchRegex(trimmedInput, plugin)
      if (regexMatch) {
        results.push(regexMatch)
        continue
      }

      // 3. 模糊搜索
      if (plugin.config.fuzzyMatch) {
        const fuzzyMatch = this.matchFuzzy(trimmedInput, plugin)
        if (fuzzyMatch) {
          results.push(fuzzyMatch)
        }
      }
    }

    // 按分数排序（高到低）
    results.sort((a, b) => {
      // 先按分数排序
      if (b.score !== a.score) {
        return b.score - a.score
      }
      // 分数相同时，按优先级排序
      const aPriority = a.plugin.config.priority ?? 50
      const bPriority = b.plugin.config.priority ?? 50
      return bPriority - aPriority
    })

    logger.log(`🔍 [Matcher] Found ${results.length} matches for "${input}"`)
    return results
  }

  /**
   * 关键词匹配
   */
  private matchKeyword(input: string, plugin: Plugin): MatchResult | null {
    const { keywords } = plugin.config

    if (!keywords || keywords.length === 0) {
      return null
    }

    for (const keyword of keywords) {
      // 构建正则：关键词 + 空格 + 剩余内容
      const pattern = new RegExp(`^${this.escapeRegex(keyword)}\\s+(.+)$`, 'i')
      const match = input.match(pattern)

      if (match) {
        logger.log(`✅ [Matcher] Keyword match: "${keyword}" for plugin ${plugin.name}`)
        return {
          plugin,
          score: 100,
          extractedInput: match[1].trim(),
          matchType: 'keyword',
        }
      }

      // 也支持只输入关键词（没有空格和内容）
      if (input.toLowerCase() === keyword.toLowerCase()) {
        return {
          plugin,
          score: 90,
          extractedInput: '',
          matchType: 'keyword',
        }
      }
    }

    return null
  }

  /**
   * 正则匹配
   */
  private matchRegex(input: string, plugin: Plugin): MatchResult | null {
    const { pattern } = plugin.config

    if (!pattern) {
      return null
    }

    const match = input.match(pattern)

    if (match) {
      logger.log(`✅ [Matcher] Regex match for plugin ${plugin.name}`)
      return {
        plugin,
        score: plugin.config.priority ?? 80,
        extractedInput: input,
        matchType: 'regex',
      }
    }

    return null
  }

  /**
   * 模糊搜索匹配
   */
  private matchFuzzy(input: string, plugin: Plugin): MatchResult | null {
    const score = this.fuzzyScore(input.toLowerCase(), plugin.name.toLowerCase())

    // 分数阈值：至少50分才算匹配
    if (score >= 50) {
      logger.log(`✅ [Matcher] Fuzzy match: score=${score} for plugin ${plugin.name}`)
      return {
        plugin,
        score: Math.min(score, 70), // 模糊搜索最高70分
        extractedInput: input,
        matchType: 'fuzzy',
      }
    }

    return null
  }

  /**
   * 计算模糊匹配分数
   * 简化版本的 fuzzy string matching 算法
   */
  private fuzzyScore(input: string, target: string): number {
    if (input === target) return 100

    let score = 0
    let inputIndex = 0
    let consecutiveMatches = 0

    for (let i = 0; i < target.length && inputIndex < input.length; i++) {
      if (target[i] === input[inputIndex]) {
        score += 10
        consecutiveMatches++

        // 连续匹配奖励
        if (consecutiveMatches > 1) {
          score += consecutiveMatches * 2
        }

        inputIndex++
      } else {
        consecutiveMatches = 0
      }
    }

    // 如果输入完全匹配了，额外加分
    if (inputIndex === input.length) {
      score += 20
    }

    // 长度差异惩罚
    const lengthDiff = Math.abs(target.length - input.length)
    score -= lengthDiff * 2

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}

// 导出全局单例
export const pluginMatcher = new PluginMatcher()
