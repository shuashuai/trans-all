# YAML翻译工具

基于AI的智能YAML文件翻译工具，支持实时翻译和自定义词典功能。

## 🎯 项目特性

- **🤖 AI驱动翻译**: 集成 OpenAI GPT-4、Claude 3、Gemini Pro 等AI模型
- **⚡ 实时翻译**: 左右对照，逐条翻译实时显示结果
- **📝 智能识别**: 自动识别YAML中的可翻译内容，保持结构完整
- **🎨 现代化UI**: 基于 Next.js + Tailwind CSS + shadcn/ui 构建
- **💾 会话级词典**: 支持自定义翻译规则，临时存储不持久化
- **🌍 多语言支持**: 支持中文、英语、日语、韩语、法语、德语等多种语言

## 🚀 开发状态

### 第一期 MVP（进行中）
- [x] 项目初始化和基础配置
- [x] 主页面布局和响应式设计  
- [x] UI组件库集成（shadcn/ui）
- [ ] 文件上传和YAML解析功能
- [ ] Monaco Editor集成
- [ ] AI服务集成
- [ ] 实时翻译功能
- [ ] 会话级词典管理

### 第二期（计划中）
- [ ] 用户系统和认证
- [ ] 翻译历史记录
- [ ] 持久化词典管理
- [ ] 数据统计和分析

## 🛠 技术栈

### 核心技术
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand

### AI服务
- OpenAI (GPT-4, GPT-3.5-turbo)
- Anthropic (Claude 3)
- Google AI (Gemini Pro)

### 开发工具
- Monaco Editor (代码编辑器)
- React Dropzone (文件上传)
- React Hotkeys Hook (快捷键)
- Framer Motion (动画)
- js-yaml (YAML处理)

## 📦 安装和运行

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd trans-yaml
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
复制 `.env.local.example` 为 `.env.local` 并填入你的API密钥：
```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件：
```env
# AI服务API密钥
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key  
GOOGLE_AI_API_KEY=your_google_ai_api_key

# 应用配置
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **启动开发服务器**
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📝 开发脚本

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本  
npm run start        # 启动生产服务器
npm run lint         # 代码检查
npm run type-check   # TypeScript类型检查
```

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API路由
│   ├── globals.css         # 全局样式
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 主页面
├── components/             # React组件
│   ├── ui/                 # 基础UI组件
│   ├── editor/             # 编辑器组件
│   ├── translation/        # 翻译相关组件
│   ├── upload/             # 文件上传组件
│   └── dictionary/         # 词典管理组件
├── lib/                    # 工具库
│   ├── ai/                 # AI服务集成
│   ├── yaml/               # YAML处理
│   ├── storage/            # 本地存储
│   └── utils/              # 通用工具
├── types/                  # TypeScript类型
├── hooks/                  # 自定义Hooks
└── stores/                 # Zustand状态管理
```

## 🎮 使用说明

### 基本工作流程
1. **上传YAML文件**: 拖拽或点击上传 .yml/.yaml 文件
2. **选择目标语言**: 选择要翻译的目标语言
3. **选择AI模型**: 根据需要选择翻译模型
4. **开始翻译**: 点击开始按钮，实时查看翻译进度
5. **编辑结果**: 在右侧编辑器中修改翻译结果
6. **下载文件**: 完成后下载翻译好的YAML文件

### 自定义词典
- 添加专业术语的翻译规则
- 支持导入/导出词典配置
- 实时匹配和应用翻译规则

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 组件使用函数式写法
- 提交信息遵循 Conventional Commits

## 📄 开发文档

详细的开发指南请参考：
- [产品设计文档.md](./产品设计文档.md)
- [AI开发指南.md](./AI开发指南.md)

## 📜 许可证

[MIT License](LICENSE)

## 🔗 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [OpenAI API](https://platform.openai.com/)
- [Anthropic API](https://docs.anthropic.com/)

---

**开发状态**: 🚧 第一期MVP开发中

如果你有任何问题或建议，欢迎提交Issue或联系开发团队！