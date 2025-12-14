# Honey Agent Tools

一个基于 Tauri + React + TypeScript 的类 uTools 桌面应用，提供快捷的插件系统、全局快捷键和独立窗口管理。

> ⚠️ **重要技术栈说明**
>
> - 本项目使用 **Tailwind CSS 4**（不是 v3）- 配置在 `index.css` 的 `@theme` 中，**不要创建 `tailwind.config.js`**！
> - 使用 **shadcn/ui** 组件库（需适配 Tailwind 4）
> - 使用 **Tauri 2.x**（需配置 capabilities 权限）

## 技术栈

| 技术                               | 版本       | 用途             | 特别说明                      |
| ---------------------------------- | ---------- | ---------------- | ----------------------------- |
| React                              | 19.1.0     | 前端框架         |                               |
| TypeScript                         | 5.8.3      | 类型系统         |                               |
| Tauri                              | 2.0.0      | 桌面应用框架     | 需配置 capabilities           |
| Zustand                            | 5.0.9      | 状态管理         |                               |
| **Tailwind CSS**                   | **4.1.18** | **CSS 框架**     | **使用 @theme，非 config.js** |
| shadcn/ui                          | latest     | UI 组件库        | 需适配 Tailwind 4             |
| Biome                              | 2.3.8      | 代码规范和格式化 |                               |
| @tauri-apps/plugin-global-shortcut | 2.3.1      | 全局快捷键支持   |                               |

## 项目结构

```
├── src/
│   ├── components/              # UI 组件
│   │   ├── ui/                  # shadcn/ui 组件
│   │   │   ├── command.tsx      # Command 组件（插件搜索）
│   │   │   ├── card.tsx
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   ├── Settings.tsx         # 设置页面
│   │   └── PluginWindow.tsx     # 插件结果窗口（已废弃，用独立窗口）
│   ├── plugins/                 # 插件系统
│   │   ├── types.ts             # 插件类型定义
│   │   ├── registry.ts          # 插件注册表
│   │   ├── matcher.ts           # 插件匹配引擎
│   │   └── builtin/             # 内置插件
│   │       ├── calculator/      # 计算器插件
│   │       └── translate/       # 翻译插件
│   ├── hooks/
│   │   ├── useShortcut.ts       # 快捷键监听
│   │   └── usePluginMatcher.ts  # 插件匹配 Hook
│   ├── store/
│   │   ├── appStore.ts          # 应用状态
│   │   ├── shortcutStore.ts     # 快捷键配置
│   │   ├── pluginStore.ts       # 插件状态
│   │   └── searchStore.ts       # 搜索状态
│   ├── lib/
│   │   └── utils.ts             # shadcn 工具函数 (cn)
│   ├── App.tsx                  # 主窗口应用
│   ├── PluginWindow.tsx         # 插件窗口组件
│   ├── plugin-main.tsx          # 插件窗口入口
│   ├── index.css                # 全局样式（Tailwind 4 + shadcn）
│   └── main.tsx                 # 主窗口入口
├── src-tauri/
│   ├── capabilities/            # Tauri 权限配置
│   │   └── plugin-window.json   # 插件窗口权限
│   ├── src/
│   │   ├── lib.rs               # 窗口管理命令
│   │   └── main.rs
│   └── tauri.conf.json
├── plugin-result.html           # 插件窗口 HTML
├── index.html                   # 主窗口 HTML
├── vite.config.ts               # Vite 多页面配置
└── components.json              # shadcn 配置
```

## 核心功能

### 1. 插件系统 🔌

#### 设计思路

类似 uTools 的插件架构：

- 用户输入 → 智能匹配插件 → 执行插件 → 独立窗口显示结果
- 支持关键词、正则、模糊三种匹配方式
- 插件独立窗口显示结果（不是 React modal）

#### 插件类型定义 (`plugins/types.ts`)

```typescript
interface Plugin {
  id: string;
  name: string;
  description: string;
  icon?: ReactNode;
  config: PluginConfig;
  execute: (context: PluginContext) => void | Promise<void>;
  getPreview?: (input: string) => ReactNode;
}

interface PluginConfig {
  keywords?: string[]; // 关键词匹配
  pattern?: RegExp; // 正则匹配
  fuzzy?: boolean; // 模糊搜索
  priority?: number; // 优先级
  featured?: boolean; // 精选标记
  enabled?: boolean;
}
```

#### 插件注册表 (`plugins/registry.ts`)

单例模式管理所有插件：

```typescript
class PluginRegistry {
  register(plugin: Plugin): void;
  unregister(pluginId: string): void;
  getAllPlugins(): Plugin[];
  getPlugin(id: string): Plugin | undefined;
}

export const pluginRegistry = new PluginRegistry();
```

#### 插件匹配引擎 (`plugins/matcher.ts`)

智能匹配算法：

1. **关键词匹配**：精确匹配，分数 100
2. **正则匹配**：模式匹配，分数 90
3. **模糊搜索**：Fuzzy 算法，分数 0-80

```typescript
class PluginMatcher {
  match(query: string, plugins: Plugin[]): MatchResult[];
}
```

#### 内置插件示例

**计算器插件** (`plugins/builtin/calculator`):

- 匹配：数学表达式（`/^[\d+\-*/().\s]+$/`）
- 执行：计算结果并显示

**翻译插件** (`plugins/builtin/translate`):

- 关键词：`['翻译', 'translate', 'fy']`
- 执行：调用翻译 API

### 2. 独立窗口系统 🪟

#### 设计架构

```
主窗口 (main)              插件窗口 (plugin-window)
┌─────────────┐            ┌──────────────────┐
│ 搜索框      │            │ 插件结果展示     │
│ 插件列表    │ ────────> │ + 操作按钮       │
└─────────────┘            └──────────────────┘
      ↑                            │
      └────────关闭后重新聚焦──────┘
```

#### Rust 窗口命令 (`lib.rs`)

```rust
#[tauri::command]
async fn create_plugin_window(
    app: tauri::AppHandle,
    data: PluginData,  // 插件ID、名称、输入、结果
) -> Result<(), String>

#[tauri::command]
async fn close_plugin_window(app: tauri::AppHandle) -> Result<(), String>
```

**关键实现**：

- ✅ 延迟 300ms 发送数据（等待窗口加载）
- ✅ 主窗口不隐藏，只失去焦点（避免空白问题）
- ✅ 使用 Tauri Events 通信

#### Tauri Capabilities 配置

**为什么需要**：Tauri 2 默认只允许 `main` 窗口监听事件

**解决方案**：创建 `src-tauri/capabilities/plugin-window.json`

```json
{
  "identifier": "plugin-window",
  "windows": ["plugin-window"],
  "permissions": ["core:event:allow-listen", "core:event:allow-emit"]
}
```

#### Vite 多页面配置

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    input: {
      main: path.resolve(__dirname, 'index.html'),
      plugin: path.resolve(__dirname, 'plugin-result.html'),
    },
  },
}
```

### 3. shadcn/ui 集成 🎨

#### 为什么用 shadcn？

- ✅ 组件化、可维护
- ✅ 完美的键盘导航支持
- ✅ 内置无障碍功能
- ✅ Command 组件非常适合插件搜索

#### 已安装组件

- `Command` - 插件搜索界面（核心）
- `Card`, `Button`, `Badge`, `Separator` - 设置和结果展示
- `Dialog` - 对话框

#### Tailwind 4 + shadcn 适配

**关键点**：shadcn 默认用 Tailwind 3，需要适配 Tailwind 4

**index.css 配置**：

```css
@import "tailwindcss";

/* shadcn CSS 变量 */
@theme {
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
  --color-primary: 221.2 83.2% 53.3%;
  /* ... 更多 shadcn 颜色 ... */

  --radius-lg: 0.5rem;
  --animate-accordion-down: accordion-down 0.2s ease-out;
}
```

> ⚠️ **重要**：不要创建 `tailwind.config.js`！Tailwind 4 所有配置都在 CSS 的 `@theme` 中。

**PostCSS 配置**：

```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
```

### 4. 快捷键系统 ⌨️

（保留原有内容，略）

### 5. 状态管理 📦

#### pluginStore (Zustand)

```typescript
{
  activePlugin: Plugin | null        // 当前激活的插件
  matchedPlugins: MatchResult[]      // 匹配的插件列表
  pluginMetadata: Record<string, {   // 插件元数据
    usageCount: number
    lastUsed: number
  }>
}
```

#### searchStore (Zustand)

```typescript
{
  query: string; // 搜索关键词
  selectedIndex: number; // 选中的插件索引
  extractedInput: string; // 提取的输入
  showPluginList: boolean; // 是否显示列表
}
```

## 工作流程示例

### 用户使用计算器插件

```
1. 按 Cmd+Shift+Space 呼出主窗口
2. 输入 "2+3"
   ↓
3. usePluginMatcher 监听query变化
   ↓
4. PluginMatcher 匹配到计算器插件（正则匹配）
   ↓
5. Command 组件显示匹配结果
   ↓
6. 用户按 Enter 或点击
   ↓
7. executePlugin() 调用 Tauri 命令 create_plugin_window
   ↓
8. Rust 创建插件窗口，延迟300ms发送数据
   ↓
9. PluginWindow.tsx 监听 "plugin-data" 事件
   ↓
10. 显示结果 "2+3 = 5"
   ↓
11. 用户点击关闭，调用 close_plugin_window
   ↓
12. 主窗口重新聚焦
```

## 常见问题和解决方案 ❓

### 插件相关

**Q: 插件窗口一直显示 Loading？**

A: 权限问题。需要创建 `capabilities/plugin-window.json` 授予事件监听权限。

**Q: 插件数据没有传到窗口？**

A: 时序问题。Rust 需要延迟发送数据：

```rust
std::thread::spawn(move || {
    std::thread::sleep(Duration::from_millis(300));
    window_clone.emit("plugin-data", &data_clone)
});
```

**Q: 主窗口再次呼出时变空白？**

A: 不要隐藏主窗口，只让它失去焦点。

### shadcn/ui 相关

**Q: 为什么不能创建 tailwind.config.js？**

A: 项目使用 Tailwind 4，配置在 `index.css` 的 `@theme` 中。如果创建了 config 文件会导致配置冲突。

**Q: Command 组件不显示匹配结果？**

A: 需要添加 `shouldFilter={false}`，否则 cmdk 会自己过滤：

```tsx
<Command shouldFilter={false}>
```

### Tauri 相关

**Q: event.listen not allowed on window "plugin-window"？**

A: 需要在 `capabilities/` 目录创建权限配置文件。

## 开发最佳实践 💡

### 1. 添加新插件

```typescript
// 1. 创建插件文件
// src/plugins/builtin/my-plugin/index.tsx

export const myPlugin: Plugin = {
  id: "my-plugin",
  name: "我的插件",
  description: "插件描述",
  config: {
    keywords: ["关键词"],
    priority: 90,
  },
  execute: (context) => {
    // 插件逻辑
    context.showNotification("结果");
  },
};

// 2. 注册插件
// src/App.tsx
pluginRegistry.register(myPlugin);
```

### 2. 使用 logger 而不是 console

```typescript
// ❌ 不推荐
console.log("debug info");

// ✅ 推荐
logger.log("debug info"); // 只在开发环境显示
```

### 3. 确保 Tailwind 4 配置正确

**不要创建**：

- ❌ `tailwind.config.js`
- ❌ `tailwind.config.ts`

**只配置**：

- ✅ `index.css` 中的 `@theme`
- ✅ `postcss.config.js`

## 技术债务和改进

### 已完成 ✅

- ✅ 插件系统基础架构
- ✅ 插件独立窗口
- ✅ shadcn/ui 集成
- ✅ 智能插件匹配
- ✅ 快捷键系统
- ✅ 动态窗口高度

### 待改进 🎯

- [ ] 插件配置界面
- [ ] 插件市场
- [ ] 更多内置插件
- [ ] 插件开发文档
- [ ] 单元测试

## 许可证

MIT

---

> 💡 **给 AI Agent 的提示**：
>
> - 本项目使用 **Tailwind 4**，不要创建 config 文件！
> - shadcn 组件需要适配 Tailwind 4 的 `@theme` 语法
> - Tauri 2 需要配置 capabilities 权限
> - 插件窗口需要延迟发送数据（300ms）
