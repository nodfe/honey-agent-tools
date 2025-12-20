import { useEffect, useState, Suspense } from 'react'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logger } from '@/utils/logger'
import { X, Copy, CheckCircle2 } from 'lucide-react'
import { getPluginView } from '@/plugins/viewRegistry'

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
  const [copied, setCopied] = useState(false)

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

    const unlistenPromise = setupListener()

    return () => {
      logger.log('🪟 [Plugin Window] Cleanup')
      unlistenPromise.then(unlisten => unlisten())
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
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      logger.error('❌ [Plugin Window] Copy failed:', error)
    }
  }

  if (loading || !pluginData) {
    return (
      <div className="flex items-center justify-center h-screen bg-background/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-muted-foreground animate-pulse">正在加载结果...</div>
        </div>
      </div>
    )
  }

  // 1. 尝试加载插件自定义视图
  const CustomView = getPluginView(pluginData.plugin_id)
  
  if (CustomView) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-transparent">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <CustomView data={pluginData} />
      </Suspense>
    )
  }

  // 2. 默认通用视图 (Fallback)
  return (
    <div className="flex items-center justify-center min-h-screen bg-background/30 backdrop-blur-md p-4">
      <Card className="w-full max-w-[500px] shadow-2xl border-primary/10 bg-card/95 backdrop-blur-xl overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {pluginData.plugin_name}
                </CardTitle>
                {pluginData.input && (
                  <p className="text-[11px] font-mono text-muted-foreground/60 truncate max-w-[300px]">
                    {pluginData.input}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-6">
          {/* 结果展示区 */}
          <div className="relative group mt-2">
            {pluginData.result.type === 'text' && (
              <div className="relative">
                <div className="text-5xl font-bold font-mono py-12 px-4 bg-primary/[0.03] rounded-3xl text-center text-primary border border-primary/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] break-all">
                  {pluginData.result.content}
                </div>
                <div className="absolute top-3 right-3">
                   <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="h-9 w-9 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/10 opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
                  >
                    {copied ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            )}

            {pluginData.result.type === 'html' && (
              <div
                className="p-6 bg-muted/20 rounded-2xl border border-primary/5 shadow-inner"
                dangerouslySetInnerHTML={{ __html: pluginData.result.content }}
              />
            )}

            {pluginData.result.type === 'list' && (
              <div className="grid gap-2.5">
                {pluginData.result.content.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="group/item flex items-center justify-between p-4 bg-primary/[0.02] hover:bg-primary/[0.05] rounded-2xl border border-primary/5 hover:border-primary/20 transition-all cursor-default"
                  >
                    <span className="text-base font-medium">
                      {typeof item === 'string' ? item : item.name || JSON.stringify(item)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all"
                      onClick={() => {
                        const text = typeof item === 'string' ? item : item.name || JSON.stringify(item)
                        navigator.clipboard.writeText(text)
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 操作栏 */}
          <div className="flex gap-3 justify-between items-center pt-2">
            <p className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-widest">
              Press ESC to dismiss
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="h-10 px-4 text-muted-foreground hover:text-foreground rounded-xl"
              >
                忽略
              </Button>
              <Button
                onClick={handleCopy}
                className="h-10 gap-2 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-95 bg-primary hover:bg-primary/90"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    复制结果
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
