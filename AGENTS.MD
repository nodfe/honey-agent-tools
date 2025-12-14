# Honey Agent Tools

一个基于 Tauri + React + TypeScript 的桌面应用，提供快捷的输入框和灵活的快捷键配置功能。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.1.0 | 前端框架 |
| TypeScript | 5.8.3 | 类型系统 |
| Tauri | 2.0.0 | 桌面应用框架 |
| Zustand | 5.0.9 | 状态管理 |
| Tailwind CSS | 4.1.18 | CSS 框架 |
| Biome | 2.3.8 | 代码规范和格式化 |
| @tauri-apps/plugin-global-shortcut | 2.3.1 | 全局快捷键支持 |

## 项目结构

```
├── src/
│   ├── components/          # 组件目录
│   │   └── Settings.tsx     # 设置页面组件
│   ├── hooks/               # 自定义 Hooks
│   │   └── useShortcut.ts   # 快捷键监听 Hook
│   ├── store/               # 状态管理
│   │   ├── appStore.ts      # 应用状态
│   │   └── shortcutStore.ts # 快捷键配置
│   ├── types/               # 类型定义
│   │   └── shortcut.ts      # 快捷键相关类型
│   ├── App.css              # 应用样式（已迁移到 Tailwind CSS）
│   ├── App.tsx              # 主应用组件
│   ├── index.css            # 全局样式（包含 Tailwind 指令）
│   └── main.tsx             # 应用入口
├── src-tauri/               # Tauri 相关代码
│   ├── src/                 # Rust 源代码
│   └── tauri.conf.json      # Tauri 配置文件
├── biome.json               # Biome 配置
├── postcss.config.js        # PostCSS 配置（包含 Tailwind CSS 4 配置）
└── package.json             # 项目依赖和脚本
```

## 核心功能

### 1. 快捷键系统

#### 设计思路
- 采用 Zustand 管理快捷键配置，支持持久化存储
- 使用 Tauri 的 `@tauri-apps/plugin-global-shortcut` 实现全局快捷键监听
- 支持动态注册和更新快捷键，便于后续扩展

#### 实现细节
- **状态管理**：`shortcutStore.ts` 使用 Zustand 和 persist 中间件，将快捷键配置保存到 localStorage
- **快捷键监听**：`useShortcut.ts` 自定义 Hook 负责注册和管理快捷键
- **默认快捷键**：
  - `Cmd+Shift+Space`：显示/隐藏主窗口
  - `Cmd+Shift+S`：打开设置页面

### 2. 主窗口设计

#### 设计思路
- 以输入框为核心，简洁高效
- 支持通过快捷键呼出/隐藏
- 点击窗口外部自动关闭
- 透明背景，无边框设计

#### 实现细节
- **窗口状态管理**：`appStore.ts` 管理窗口的显示/隐藏状态
- **样式设计**：使用 Tailwind CSS 实现现代化的输入框样式
- **交互逻辑**：
  - 输入完成后按 Enter 键提交
  - 点击窗口外部自动关闭
  - 平滑的显示/隐藏动画

### 3. 设置页面

#### 设计思路
- 可视化的快捷键配置界面
- 支持修饰键（Cmd、Ctrl、Shift、Alt）的组合
- 实时保存配置
- 支持重置为默认值

#### 实现细节
- **组件设计**：`Settings.tsx` 实现设置页面，包含快捷键编辑功能
- **状态更新**：修改快捷键配置后实时更新 store 并重新注册快捷键
- **响应式设计**：适配不同屏幕尺寸

## 样式系统

### Tailwind CSS 4 配置

项目使用最新的 Tailwind CSS 4，配置直接集成在 `postcss.config.js` 文件中：

### PostCSS 配置

使用 `@tailwindcss/postcss` 插件，并将所有 Tailwind CSS 配置直接放在插件选项中：

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {
      // Tailwind CSS 4 配置
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
        extend: {
          colors: {
            primary: '#6366f1',
            secondary: '#4f46e5',
            danger: '#ef4444',
            success: '#10b981',
          },
        },
      },
    },
    autoprefixer: {},
  },
}
```

### index.css 导入

使用 Tailwind CSS 4 的标准导入方式：

```css
@import "tailwindcss";
```

## 代码规范

### Biome 配置

使用 Biome 进行代码检查和格式化，配置文件 `biome.json`：

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.8/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "all",
      "semicolons": "asNeeded"
    }
  }
}
```

### 脚本命令

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "format": "biome format src/ --write",
    "lint": "biome check src/",
    "lint:fix": "biome check src/ --write"
  }
}
```

### 为什么只检查src目录？

1. **提高速度**：只检查源代码目录可以大大提高Biome的运行速度，避免检查大量的依赖文件和构建产物
2. **减少噪音**：避免检查与项目开发无关的文件，减少不必要的错误和警告
3. **针对性强**：只关注项目的核心代码，确保源代码符合规范
4. **开发友好**：快速的检查反馈有助于在开发过程中保持代码质量

建议在开发过程中定期运行以下命令：

```bash
# 检查源代码规范
pnpm run lint

# 自动修复规范问题
pnpm run lint:fix

# 格式化源代码
pnpm run format
```

## 开发和构建

### 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm tauri dev
```

### 构建

```bash
# 构建应用
pnpm run build

# 打包 Tauri 应用
pnpm tauri build
```

## 使用说明

### 1. 快捷键

| 功能 | 默认快捷键 | 说明 |
|------|------------|------|
| 显示/隐藏主窗口 | Cmd+Shift+Space | 呼出或隐藏应用的主输入窗口 |
| 打开设置 | Cmd+Shift+S | 打开快捷键配置页面 |

### 2. 主窗口

- 输入内容后按 Enter 键提交
- 提交后窗口自动关闭
- 点击窗口外部也可以关闭窗口

### 3. 设置页面

- 点击快捷键右侧的 "Edit" 按钮进行编辑
- 选择修饰键（Cmd、Ctrl、Shift、Alt）
- 输入单个字母或数字作为快捷键
- 点击 "Save" 保存，"Cancel" 取消编辑
- 点击 "Reset to Defaults" 恢复默认快捷键

## 常见问题

### 1. 应用启动后显示灰色窗口

**原因**：窗口配置或样式问题

**解决方案**：
- 检查 `tauri.conf.json` 中的窗口配置
- 确保 `transparent: true` 和 `decorations: false` 已正确设置
- 检查 CSS 样式，确保背景色为透明

### 2. 快捷键不生效

**原因**：
- 快捷键冲突
- 插件未正确安装或配置
- 代码错误

**解决方案**：
- 尝试修改快捷键
- 检查 `src-tauri/Cargo.toml` 中是否添加了 `tauri-plugin-global-shortcut` 依赖
- 检查 `useShortcut.ts` 中的代码是否正确

### 3. 构建失败

**原因**：
- TypeScript 错误
- Tailwind CSS 配置错误
- 依赖问题

**解决方案**：
- 运行 `pnpm run build` 查看详细错误信息
- 检查 TypeScript 错误
- 确认 Tailwind CSS 和 PostCSS 配置正确

## 扩展指南

### 添加新的快捷键

1. 在 `src/types/shortcut.ts` 中添加新的快捷键类型
2. 在 `src/store/shortcutStore.ts` 中添加默认配置
3. 在 `src/hooks/useShortcut.ts` 中注册新的快捷键
4. 在组件中实现对应的功能

### 自定义主题

在 `postcss.config.js` 文件中的 `@tailwindcss/postcss` 插件配置中修改 `theme.extend` 部分，自定义颜色、字体等：

```javascript
@tailwindcss/postcss: {
  theme: {
    extend: {
      colors: {
        // 自定义颜色
        primary: '#6366f1',
        // 添加更多自定义配置...
      },
      // 自定义字体、间距等
      fontFamily: {
        custom: ['Custom Font', 'sans-serif'],
      },
    },
  },
}
```

### 添加新功能

1. 创建新的组件或页面
2. 在 `appStore.ts` 中添加相关状态
3. 在 `useShortcut.ts` 中添加对应的快捷键
4. 实现功能逻辑

## 许可证

MIT
