import { useEffect, useState } from 'react'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logger } from '@/utils/logger'

interface PluginData {
  plugin_id: string
  plugin_name: string
  input: string
  result: {
    type: 'text' | 'html' | 'list' | 'custom'
    content: any
    actions?: Array<{
      name: string
      handler: () => void
    }>
  }
}

export default function PluginWindow() {
  const [pluginData, setPluginData] = useState<PluginData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    logger.log('🪟 [Plugin Window] Initializing...')

    // 监听插件数据
    const setupListener = async () => {
      const unlisten = await listen<PluginData>('plugin-data', (event) => {
        logger.log('📨 [Plugin Window] Received plugin data:', event.payload)
        setPluginData(event.payload)
        setLoading(false)
      })

      return unlisten
    }

    setupListener()

    return () => {
      logger.log('🪟 [Plugin Window] Cleanup')
    }
  }, [])

  const handleClose = async () => {
    logger.log('🔒 [Plugin Window] Closing...')
    try {
      await invoke('close_plugin_window')
    } catch (error) {
      logger.error('❌ [Plugin Window] Close failed:', error)
    }
  }

  const handleCopy = async () => {
    if (!pluginData) return

    try {
      await navigator.clipboard.writeText(String(pluginData.result.content))
      logger.log('📋 [Plugin Window] Copied to clipboard')
      // TODO: 显示提示
    } catch (error) {
      logger.error('❌ [Plugin Window] Copy failed:', error)
    }
  }

  if (loading || !pluginData) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Loading...</div>
          <div className="text-sm text-muted-foreground">等待插件数据...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-6">
      <Card className="w-full max-w-[600px] shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{pluginData.plugin_name}</CardTitle>
              {pluginData.input && (
                <p className="text-sm text-muted-foreground mt-1">输入: {pluginData.input}</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
              <span className="text-2xl">×</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 结果展示 */}
          {pluginData.result.type === 'text' && (
            <div className="text-2xl font-mono p-6 bg-muted rounded-lg text-center">
              {pluginData.result.content}
            </div>
          )}

          {pluginData.result.type === 'html' && (
            <div dangerouslySetInnerHTML={{ __html: pluginData.result.content }} />
          )}

          {pluginData.result.type === 'list' && (
            <ul className="space-y-2">
              {pluginData.result.content.map((item: any, index: number) => (
                <li key={index} className="p-3 hover:bg-muted rounded-md border">
                  {typeof item === 'string' ? item : item.name || JSON.stringify(item)}
                </li>
              ))}
            </ul>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={handleCopy}>
              📋 复制
            </Button>
            <Button onClick={handleClose}>关闭</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
