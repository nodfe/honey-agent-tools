import { lazy } from 'react'

// 懒加载插件视图
const CalculatorView = lazy(() => import('./builtin/calculator/View'))

// 视图注册表
export const ViewRegistry: Record<string, React.ComponentType<any>> = {
  'calculator': CalculatorView,
}

// 获取插件视图
export const getPluginView = (pluginId: string) => {
  return ViewRegistry[pluginId] || null
}
