import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useEffect, useRef } from 'react'
import Settings from './components/Settings'
import { useShortcut } from './hooks/useShortcut'
import { usePluginMatcher } from './hooks/usePluginMatcher'
import { useAppStore } from './store/appStore'
import { usePluginStore } from './store/pluginStore'
import { useSearchStore } from './store/searchStore'
import { pluginRegistry } from './plugins/registry'
import { translatePlugin } from './plugins/builtin/translate'
import { calculatorPlugin } from './plugins/builtin/calculator'
import { logger } from './utils/logger'
import type { MatchResult, PluginResult } from './plugins/types'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'

function App() {
  const isWindowVisible = useAppStore((state) => state.isWindowVisible)
  const isSettingsOpen = useAppStore((state) => state.isSettingsOpen)
  const hideWindow = useAppStore((state) => state.hideWindow)
  const contentRef = useRef<HTMLDivElement>(null)

  // 搜索和插件状态
  const query = useSearchStore((state) => state.query)
  const setQuery = useSearchStore((state) => state.setQuery)
  const selectedIndex = useSearchStore((state) => state.selectedIndex)
  const reset = useSearchStore((state) => state.reset)

  const matchedPlugins = usePluginStore((state) => state.matchedPlugins)
  const activePlugin = usePluginStore((state) => state.activePlugin)
  const setActivePlugin = usePluginStore((state) => state.setActivePlugin)

  // 初始化快捷键
  useShortcut()

  // 初始化插件匹配
  usePluginMatcher()

  // 注册内置插件
  useEffect(() => {
    logger.log('📦 Registering built-in plugins...')
    pluginRegistry.register(translatePlugin)
    pluginRegistry.register(calculatorPlugin)
    logger.log('✅ Built-in plugins registered')
  }, [])

  // 执行插件
  const executePlugin = async (match: MatchResult) => {
    logger.log(`🚀 Executing plugin: ${match.plugin.name}`)

    setActivePlugin(match.plugin)

    // 执行插件并获取结果
    let pluginResult: PluginResult | null = null
    
    // 创建插件上下文
    const context = {
      input: match.extractedInput,
      rawInput: query,
      platform: 'mac' as const,

      showNotification: (message: string) => {
        logger.log(`📢 [showNotification] ${message}`)
      },

      copyToClipboard: async (text: string) => {
        await navigator.clipboard.writeText(text)
        logger.log(`📋 Copied to clipboard: ${text}`)
      },

      openURL: async (url: string) => {
        window.open(url, '_blank')
      },

      hideWindow: async () => {
        await hideWindow()
      },

      showResult: (result: PluginResult) => {
        logger.log('📊 Plugin result via showResult:', result)
        pluginResult = result
      },
    }

    try {
      // 执行插件
      await match.plugin.execute(context)
      
      // 优先使用 showResult 设置的结果
      const finalResult = pluginResult || {
        type: 'text',
        content: null, // 默认不显示任何文本，由插件 View 自行决定
      }

      // 调用 Tauri 命令创建插件窗口
      await invoke('create_plugin_window', {
        data: {
          plugin_id: match.plugin.id,
          plugin_name: match.plugin.name,
          input: match.extractedInput,
          result: finalResult,
        },
      })
    } catch (error) {
      logger.error('❌ Plugin execution failed:', error)
      await invoke('create_plugin_window', {
        data: {
          plugin_id: match.plugin.id,
          plugin_name: match.plugin.name,
          input: match.extractedInput,
          result: {
            type: 'text',
            content: `插件执行失败: ${error}`,
          },
        },
      })
    }
  }

  // ESC 键关闭窗口
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWindowVisible) {
        if (query) {
          reset()
        } else {
          logger.log('🔑 [ESC] ESC 键按下，关闭窗口')
          hideWindow()
        }
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isWindowVisible, hideWindow, query, reset])

  // 动态调整窗口高度
  useEffect(() => {
    if (!contentRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height
        const width = 600

        logger.log(`📏 [窗口尺寸] 内容高度变化: ${height}px`)

        invoke('set_window_size', { width, height })
          .then(() => {
            logger.log(`✅ [窗口尺寸] 窗口大小已调整: ${width}x${height}`)
          })
          .catch((error) => {
            logger.error('❌ [窗口尺寸] 调整窗口大小失败:', error)
          })
      }
    })

    resizeObserver.observe(contentRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // 监听窗口失去焦点事件
  useEffect(() => {
    const unlisten = getCurrentWindow().listen('tauri://blur', () => {
      logger.log('🔌 [窗口] 失去焦点，隐藏窗口')
      hideWindow()
    })

    return () => {
      unlisten.then((fn) => fn())
    }
  }, [hideWindow])

  // 点击窗口外部关闭窗口
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.id === 'app-root' && isWindowVisible) {
        hideWindow()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isWindowVisible, hideWindow])

  return (
    <div
      id="app-root"
      className="w-full h-full flex justify-center items-center bg-transparent overflow-hidden"
    >
      <div
        ref={contentRef}
        className={`w-full h-full flex justify-center items-center transition-opacity duration-200 ${isWindowVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {isSettingsOpen ? (
          <Settings />
        ) : (
          <div className="w-full max-w-[600px] px-5">
            <Command className="rounded-lg border shadow-md" shouldFilter={false}>
              <CommandInput
                placeholder="输入关键词搜索插件..."
                value={query}
                onValueChange={setQuery}
              />
              <CommandList>
                {matchedPlugins.length === 0 && query ? (
                  <CommandEmpty>没有找到匹配的插件</CommandEmpty>
                ) : matchedPlugins.length > 0 ? (
                  <CommandGroup heading="匹配的插件">
                    {matchedPlugins.map((match, index) => (
                      <CommandItem
                        key={match.plugin.id}
                        value={match.plugin.id}
                        onSelect={() => {
                          executePlugin(match)
                          setQuery('')
                        }}
                        className={index === selectedIndex ? 'bg-accent' : ''}
                      >
                        <div className="flex items-center gap-3 w-full">
                          {/* 插件图标 */}
                          <div className="w-10 h-10 flex-shrink-0">
                            {match.plugin.icon || (
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold">
                                {match.plugin.name[0].toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* 插件信息 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold truncate">{match.plugin.name}</span>
                              {match.plugin.config.featured && (
                                <span className="text-yellow-500">★</span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <p className="text-sm text-muted-foreground truncate">
                                {match.plugin.description}
                              </p>
                              {/* 插件预览内容 */}
                              {match.plugin.getPreview && (
                                <div className="mt-1">
                                  {match.plugin.getPreview(match.extractedInput)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 快捷键提示 */}
                          {index < 9 && (
                            <Badge variant="outline" className="flex-shrink-0">
                              Cmd+{index + 1}
                            </Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
              </CommandList>
            </Command>

            {/* 提示文字 */}
            {matchedPlugins.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground text-center">
                使用 ↑↓ 导航 • Enter 选择 • Cmd+1~9 快速选择 • Esc 关闭
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
