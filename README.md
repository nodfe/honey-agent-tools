# 🍯 Honey Agent Tools

![Tauri](https://img.shields.io/badge/Tauri-v2-FEC00F?style=for-the-badge&logo=tauri&logoColor=black)
![React](https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-Stable-000000?style=for-the-badge&logo=rust&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Honey Agent Tools** 是一款基于 [Tauri v2](https://tauri.app/) 构建的现代化、高性能桌面效率工具。旨在通过插件化的架构，为用户提供极速的命令执行、信息检索和工作流自动化体验。

它不仅仅是一个启动器，更是你桌面端的智能助手。

---

## ✨ 特性 (Features)

- 🚀 **极速启动**: 基于 Rust 后端，占用资源极低，响应速度极快。
- 🧩 **插件化架构**: 灵活的插件系统，支持关键词、正则、模糊匹配等多种触发方式。
- 🎨 **现代化 UI**: 精心设计的界面，基于 React 19 和 Tailwind CSS v4，支持暗色模式。
- ⌨️ **键盘优先**: 强大的快捷键支持，双手无需离开键盘即可完成操作。
- 🧮 **内置工具**: 开箱即用的计算器、翻译等实用工具。
- 🛡️ **安全可靠**: 严格的权限控制，保护你的隐私与数据安全。

## 🛠️ 技术栈 (Tech Stack)

### Core
- **Tauri v2**: 跨平台应用构建框架。
- **Rust**: 高性能后端逻辑。

### Frontend
- **React 19**: 构建用户界面的 JavaScript 库。
- **TypeScript**: 强类型的 JavaScript 超集。
- **Vite 7**: 下一代前端构建工具。
- **Zustand**: 轻量级状态管理。

### Styling & UI
- **Tailwind CSS v4**: 原子化 CSS 框架。
- **Radix UI**: 无样式的可访问 UI 组件基元。
- **Lucide React**: 漂亮的图标库。
- **Biome**: 极速的代码格式化与 Lint 工具。

## 🚀 快速开始 (Getting Started)

### 环境要求 (Prerequisites)

确保你的开发环境已安装：

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (推荐)
- [Rust](https://www.rust-lang.org/tools/install) (最新稳定版)

### 安装 (Installation)

1. 克隆仓库：

```bash
git clone https://github.com/nodfe/honey-agent-tools.git
cd honey-agent-tools
```

2. 安装前端依赖：

```bash
pnpm install
```

3. 启动开发服务器：

```bash
pnpm tauri dev
```

首次运行需要编译 Rust 依赖，可能需要几分钟时间。

## 📂 项目结构 (Project Structure)

```
honey-agent-tools/
├── src/                # 前端源代码
│   ├── components/     # React 组件
│   ├── hooks/          # 自定义 Hooks
│   ├── lib/            # 工具函数
│   ├── plugins/        # 插件系统核心与内置插件
│   ├── store/          # Zustand 状态管理
│   ├── types/          # TypeScript 类型定义
│   └── utils/          # 通用工具
├── src-tauri/          # Rust 后端代码
│   ├── src/            # Rust 源代码
│   ├── capabilities/   # Tauri 权限配置
│   └── tauri.conf.json # Tauri 配置文件
└── ...
```

## 🔌 插件开发 (Plugin Development)

Honey Agent Tools 拥有强大的插件系统。一个简单的插件结构如下：

```typescript
import { Plugin } from '@/plugins/types';

export const myPlugin: Plugin = {
  id: 'my-plugin',
  name: 'My Plugin',
  description: 'A sample plugin',
  config: {
    keywords: ['hello'], // 触发关键词
  },
  execute: (context) => {
    context.showResult({
      type: 'text',
      content: 'Hello, World!',
    });
  },
};
```

更多详情请参考 `src/plugins/types.ts`。

## 🤝 贡献 (Contributing)

欢迎提交 Pull Request 或 Issue！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证 (License)

Distributed under the MIT License. See `LICENSE` for more information.

---

Made with ❤️ by [Nodfe](https://github.com/nodfe)
