import { useEffect, useState } from 'react'
import Settings from './components/Settings'
import { useShortcut } from './hooks/useShortcut'
import { useAppStore } from './store/appStore'

function App() {
  const [inputValue, setInputValue] = useState('')
  const isWindowVisible = useAppStore((state) => state.isWindowVisible)
  const isSettingsOpen = useAppStore((state) => state.isSettingsOpen)
  const hideWindow = useAppStore((state) => state.hideWindow)



  // 初始化快捷键
  useShortcut()

  // 应用启动时的初始化逻辑已移除
  // 窗口默认状态由 Tauri 应用配置控制，不再在 React 中重复设置

  // 处理输入框提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Input submitted:', inputValue)
    setInputValue('')
    hideWindow()
  }

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
        className={`w-full h-full flex justify-center items-center transition-opacity duration-200 ${isWindowVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {isSettingsOpen ? (
          <Settings />
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-[600px] px-5">
            <div className="w-full relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter your query..."
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl outline-none transition-all duration-200 bg-white shadow-lg focus:border-primary focus:ring-2 focus:ring-primary/10"
                autoFocus
              />
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default App
