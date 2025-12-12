# 社区审核后台 Demo

一个轻量级的社区内容审核后台系统 MVP 版本，供兼职审核员处理用户发布内容与举报内容，管理员负责分发任务、复核、查看数据。

## 🌟 功能特性

### 审核员功能
- ✅ 设置在线/离线状态
- ✅ 设置队列容量（一次可接受的待审核数量）
- ✅ 自动接收系统分发的审核任务
- ✅ 对内容执行：通过/拒绝（需选择拒绝理由）
- ✅ 查看个人审核历史记录
- ✅ 查看审核标准文档

### 管理员功能
- ✅ 管理审核员账号（新增、删除、强制上下线）
- ✅ 查看系统仪表盘（实时数据概览）
- ✅ 对审核结果进行复核（推翻误审）
- ✅ 管理审核标准文档（可编辑）
- ✅ 查看详细数据统计（支持导出 CSV）
- ✅ 回收审核员任务

### 系统特性
- ✅ 任务自动分发给在线审核员
- ✅ 举报内容优先处理标记
- ✅ 用户信息脱敏展示
- ✅ 响应式设计，美观现代的 UI

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm run start
```

## 📝 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 审核员1 | reviewer1 | 123456 |
| 审核员2 | reviewer2 | 123456 |
| 审核员3 | reviewer3 | 123456 |
| 审核员4 | reviewer4 | 123456 |

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 登录页面
│   ├── layout.tsx         # 根布局
│   ├── globals.css        # 全局样式
│   ├── reviewer/          # 审核员页面
│   │   ├── page.tsx       # 审核工作台
│   │   ├── history/       # 审核历史
│   │   └── standards/     # 审核标准（只读）
│   └── admin/             # 管理员页面
│       ├── page.tsx       # 仪表盘
│       ├── reviewers/     # 审核员管理
│       ├── review/        # 复核管理
│       ├── standards/     # 审核标准（可编辑）
│       └── statistics/    # 数据统计
├── components/            # React 组件
│   ├── Layout/           # 布局组件
│   └── ui/               # UI 组件
├── lib/                   # 工具库
│   ├── store.ts          # Zustand 状态管理
│   ├── mock-data.ts      # 模拟数据
│   └── utils.ts          # 工具函数
└── types/                 # TypeScript 类型定义
    └── index.ts
```

## 🛠 技术栈

- **框架**: [Next.js 14](https://nextjs.org/) (App Router)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
- **图标**: [Lucide React](https://lucide.dev/)
- **日期处理**: [date-fns](https://date-fns.org/)

## 📋 MVP 功能范围

### 已实现
- [x] 登录与角色视图切换
- [x] 审核任务自动分发
- [x] 审核工作台（图文内容展示、操作）
- [x] 举报内容标记与处理
- [x] 管理员复核功能
- [x] 审核标准文档管理
- [x] 基础数据统计（支持导出）

### 明确不做（本版本）
- ❌ AI 预审
- ❌ 视频审核
- ❌ 复杂优先级/分发策略
- ❌ 质检体系
- ❌ 任务抢单模式
- ❌ 多层级角色体系
- ❌ 复杂可视化数据分析

## 🔧 数据持久化

本 Demo 使用 Zustand + localStorage 进行数据持久化，刷新页面后数据会保留。如需清除数据，可以：

1. 打开浏览器开发者工具
2. 进入 Application -> Local Storage
3. 删除 `content-review-storage` 项

## 📸 页面截图

### 登录页面
简洁现代的登录界面，支持测试账号快速登录。

### 审核工作台
- 左侧展示内容详情（图片、文字、发布者信息）
- 右侧展示操作面板
- 举报内容有明显标记

### 管理员仪表盘
- 实时数据概览
- 审核员工作状态
- 快捷操作入口

### 数据统计
- 支持按时间筛选
- 详细的审核员统计
- 一键导出 CSV

## 📄 License

MIT
