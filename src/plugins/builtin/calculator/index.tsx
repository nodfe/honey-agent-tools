import { Calculator } from 'lucide-react'
import type { Plugin, PluginContext } from '../../types'

// 计算器图标
const CalculatorIcon = () => (
  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
    <Calculator size={24} />
  </div>
)

/**
 * 计算器插件
 * 自动匹配数学表达式
 */
export const calculatorPlugin: Plugin = {
  id: 'calculator',
  name: '计算器',
  description: '快速计算数学表达式',
  version: '1.1.0',
  author: 'Nodfe',
  icon: <CalculatorIcon />,

  config: {
    pattern: /^[\d+\-*/().\s]+$/,
    priority: 80,
    enabled: true,
  },

  async execute(context: PluginContext) {
    const { input, showResult, copyToClipboard } = context

    try {
      const result = Function(`"use strict"; return (${input})`)()
      const formattedResult = String(Number.isInteger(result) ? result : result.toFixed(4))

      showResult({
        type: 'text',
        content: formattedResult,
        actions: [
          {
            name: '复制结果',
            handler: () => {
              copyToClipboard(formattedResult)
            },
          },
        ],
      })
    } catch {
      // 忽略执行错误，因为 getPreview 会处理大部分情况
    }
  },

  getPreview(input: string) {
    if (!input || input.trim() === '') return null

    try {
      // 检查是否包含至少一个运算符，避免匹配纯数字
      if (!/[+\-*/()]/.test(input)) return null

      const result = Function(`"use strict"; return (${input})`)()
      const formattedResult = Number.isInteger(result) ? result : result.toFixed(4)

      return (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            结果
          </span>
          <span className="text-sm font-mono font-bold text-foreground">
            {formattedResult}
          </span>
        </div>
      )
    } catch {
      return null
    }
  },
}
