/**
 * 环境感知的日志工具
 * 开发环境：显示所有日志
 * 生产环境：只显示错误日志
 */

const isDev = import.meta.env.DEV

export const logger = {
  /**
   * 调试日志 - 仅在开发环境显示
   */
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args)
    }
  },

  /**
   * 警告日志 - 仅在开发环境显示
   */
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args)
    }
  },

  /**
   * 错误日志 - 始终显示
   */
  error: (...args: unknown[]) => {
    console.error(...args)
  },

  /**
   * 信息日志 - 仅在开发环境显示
   */
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...args)
    }
  },
}
