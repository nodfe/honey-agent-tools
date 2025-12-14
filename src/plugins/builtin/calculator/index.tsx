import type { Plugin, PluginContext } from '../../types'

// 计算器图标
const CalculatorIcon = () => (
  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
    🔢
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
  version: '1.0.0',
  author: 'Honey Team',
  icon: <CalculatorIcon />,

  config: {
    pattern: /^[\d+\-*/().\s]+$/,
    priority: 80,
    enabled: true,
  },

  execute(context: PluginContext) {
    const { input, showNotification } = context

    try {
      // 安全的数学表达式计算（简化版）
      // 注意：实际应用中需要使用更安全的方法
      const result = Function(`"use strict"; return (${input})`)()

      showNotification(`${input} = ${result}`)
    } catch {
      showNotification('计算错误：请输入有效的数学表达式')
    }
  },

  getPreview(input: string) {
    try {
      const result = Function(`"use strict"; return (${input})`)()
      return <div className="text-sm text-gray-600">= {result}</div>
    } catch {
      return null
    }
  },
}
