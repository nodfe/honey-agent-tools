import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, CheckCircle2, RotateCcw } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { cn } from '@/lib/utils'

interface CalculatorViewProps {
  data: {
    input: string
    result: {
      content: string
    }
  }
}

interface HistoryItem {
  id: string
  expression: string
  result: string
}

export default function CalculatorView({ data }: CalculatorViewProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [initialized, setInitialized] = useState(false)

  // 初始化：加载初始数据
  useEffect(() => {
    if (!initialized && data.result.content) {
      const initialItem: HistoryItem = {
        id: crypto.randomUUID(),
        expression: data.input,
        result: data.result.content,
      }
      setHistory([initialItem])
      setCurrentInput(data.result.content)
      setInitialized(true)
    }
  }, [data, initialized])

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [history])

  // 自动聚焦输入框
  useEffect(() => {
    inputRef.current?.focus()
  }, [history, initialized])

  // 计算逻辑
  const calculate = (expr: string): string => {
    try {
      // 允许包含前一次的结果，例如 "5 + 3"
      // 过滤掉非数学字符，防止恶意代码
      if (!/^[\d+\-*/().\s]+$/.test(expr)) {
        return 'Error'
      }
      
      const result = Function(`"use strict"; return (${expr})`)()
      return String(Number.isInteger(result) ? result : result.toFixed(4))
    } catch {
      return 'Error'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!currentInput.trim()) return

      const result = calculate(currentInput)
      
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        expression: currentInput,
        result,
      }

      setHistory(prev => [...prev, newItem])
      setCurrentInput(result) // 将结果自动填入下一行
    }
  }

  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  const handleClose = async () => {
    try {
      await invoke('close_plugin_window')
    } catch (error) {
      console.error('Close failed:', error)
    }
  }

  const handleCopyResult = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const clearHistory = () => {
    setHistory([])
    setCurrentInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex items-center justify-center h-screen bg-background/30 backdrop-blur-md p-4">
      <Card className="w-full max-w-[600px] h-[80vh] flex flex-col bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" onClick={handleClose} />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            Calculator
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearHistory}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Clear History"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {history.map((item) => (
              <div key={item.id} className="group flex flex-col items-end gap-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Expression */}
                <div className="text-lg text-muted-foreground font-mono">
                  {item.expression}
                </div>
                {/* Result */}
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold font-mono text-primary">
                    = {item.result}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => handleCopyResult(item.result)}
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Current Input */}
            <div ref={scrollRef} className="pt-4 border-t border-border/30 mt-4">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground font-mono text-xl">›</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-2xl font-mono text-foreground placeholder:text-muted-foreground/30"
                  placeholder="Type an expression..."
                  autoFocus
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-3 bg-muted/20 border-t border-border/50 flex justify-between items-center text-[10px] text-muted-foreground/60 font-mono">
          <span>{history.length} calculations</span>
          <div className="flex gap-4">
            <span>ENTER to calculate</span>
            <span>ESC to close</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
