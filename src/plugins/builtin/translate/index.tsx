import type { Plugin, PluginContext } from '../../types'

// 简单的翻译图标
const TranslateIcon = () => (
  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
    🌐
  </div>
)

/**
 * 翻译插件 - 示例插件
 * 关键词: 翻译, translate, fy
 */
export const translatePlugin: Plugin = {
  id: 'translate',
  name: '翻译',
  description: '将文本翻译成其他语言',
  version: '1.0.0',
  author: 'Honey Team',
  icon: <TranslateIcon />,

  config: {
    keywords: ['翻译', 'translate', 'fy'],
    priority: 90,
    featured: true,
    enabled: true,
  },

  async execute(context: PluginContext) {
    const { input, showNotification } = context

    // 简单示例：显示通知
    showNotification(`正在翻译: "${input}"`)

    // TODO: 未来集成真实的翻译 API
    // const result = await translateAPI(input, 'en', 'zh')
    // context.showResult({ type: 'text', content: result })
  },

  getPreview(input: string) {
    return (
      <div className="text-sm text-gray-500 italic">将翻译: {input || '(请输入文本)'}</div>
    )
  },
}
