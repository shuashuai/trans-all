# YAML翻译工具 - AI开发指南（第一期MVP）

## 项目概述

你正在开发一个基于Next.js的YAML文件AI翻译工具。这是第一期MVP版本，专注于核心翻译功能，不涉及数据库和用户系统。

### 核心特性
- 🎯 **实时翻译**: 左右对照，逐条翻译显示
- 🤖 **AI驱动**: 集成OpenAI、Claude、Gemini等AI模型
- 📝 **会话级词典**: 临时自定义翻译规则
- ⚡ **即用即走**: 无需注册，翻译完直接下载

### 技术栈
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand
- **编辑器**: Monaco Editor
- **AI服务**: OpenAI/Anthropic/Google AI SDK

---

## 开发顺序：页面 → 功能

### 阶段1：基础页面搭建（第1周）

#### 1.1 项目初始化
```bash
# 创建Next.js项目
npx create-next-app@latest trans-yaml --typescript --tailwind --eslint --app

# 安装第一期依赖
npm install zustand js-yaml
npm install @monaco-editor/react react-dropzone react-hotkeys-hook
npm install framer-motion lucide-react
npm install openai @anthropic-ai/sdk @google-ai/generativelanguage
```

**开发任务**:
1. 配置TypeScript + ESLint + Prettier
2. 集成Tailwind CSS
3. 安装shadcn/ui组件
4. 创建基础文件夹结构
5. 配置环境变量(.env.local)

#### 1.2 主页面布局
**文件**: `src/app/page.tsx`

**需求描述**:
创建一个响应式的主页面，包含以下区域：
- 顶部标题栏和控制面板
- 左右分屏编辑器区域
- 底部进度条和状态栏

**具体要求**:
```typescript
// 页面布局结构
<main className="h-screen flex flex-col">
  {/* 顶部控制栏 */}
  <header className="h-16 border-b">
    {/* 标题、语言选择、AI模型选择、开始翻译按钮 */}
  </header>
  
  {/* 主要内容区域 */}
  <div className="flex-1 flex">
    {/* 左侧：源文件区域 */}
    <div className="w-1/2 border-r">
      {/* 文件上传区域 */}
      {/* Monaco Editor (只读) */}
    </div>
    
    {/* 右侧：翻译结果区域 */}
    <div className="w-1/2">
      {/* 翻译结果 Monaco Editor (可编辑) */}
    </div>
  </div>
  
  {/* 底部状态栏 */}
  <footer className="h-12 border-t">
    {/* 翻译进度条、状态信息、下载按钮 */}
  </footer>
</main>
```

**交付标准**:
- 响应式布局，在不同屏幕尺寸下正常显示
- 使用Tailwind CSS实现现代化UI设计
- 布局结构清晰，为后续功能模块预留空间

#### 1.3 UI组件库搭建
**文件夹**: `src/components/ui/`

**开发任务**:
使用shadcn/ui创建以下基础组件：
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
```

**自定义组件**:
1. `LoadingSpinner` - 加载动画
2. `StatusBadge` - 状态徽章
3. `FileIcon` - 文件类型图标
4. `LanguageFlag` - 语言国旗图标

---

### 阶段2：文件上传功能（第1周）

#### 2.1 文件上传组件
**文件**: `src/components/upload/file-upload.tsx`

**功能需求**:
1. 支持拖拽上传和点击选择文件
2. 文件格式验证（只允许.yml, .yaml文件）
3. 文件大小限制（10MB）
4. 上传进度显示
5. 错误处理和用户提示

**开发Prompt**:
```
请帮我开发一个React文件上传组件，要求：

1. 使用react-dropzone实现拖拽上传
2. 只接受.yml和.yaml文件
3. 文件大小限制10MB
4. 包含以下状态：idle、uploading、success、error
5. 使用Tailwind CSS样式，符合现代化设计
6. 集成shadcn/ui的Toast组件显示提示
7. 支持TypeScript类型定义

组件接口：
interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileContent: (content: string) => void;
  disabled?: boolean;
}

请提供完整的组件代码和使用示例。
```

#### 2.2 YAML文件处理
**文件**: `src/lib/yaml/parser.ts`

**功能需求**:
1. YAML文件解析和验证
2. 提取可翻译的文本内容
3. 保持YAML结构完整性
4. 错误处理和格式修复

**开发Prompt**:
```
请帮我开发YAML文件处理模块，要求：

1. 使用js-yaml库解析YAML文件
2. 验证YAML格式的正确性
3. 提取所有可翻译的字符串值（排除数字、布尔值、null）
4. 生成翻译任务列表，包含键路径和原始值
5. 保持YAML原始结构和注释
6. 提供错误修复建议

需要实现的函数：
- parseYaml(content: string): YamlParseResult
- extractTranslatableContent(yamlObj: any): TranslationItem[]
- validateYamlStructure(content: string): ValidationResult
- reconstructYaml(items: TranslationItem[]): string

请提供完整的TypeScript代码和类型定义。
```

#### 2.3 文件预览组件
**文件**: `src/components/upload/file-preview.tsx`

**功能需求**:
1. 显示上传的文件基本信息
2. YAML内容语法高亮预览
3. 文件统计信息（行数、字符数、可翻译项数）
4. 重新选择文件功能

---

### 阶段3：Monaco Editor集成（第2周）

#### 3.1 源文件编辑器
**文件**: `src/components/editor/source-editor.tsx`

**功能需求**:
1. 只读模式的Monaco Editor
2. YAML语法高亮
3. 当前翻译行高亮显示
4. 行号和滚动同步

**开发Prompt**:
```
请帮我开发一个基于Monaco Editor的源文件显示组件：

1. 使用@monaco-editor/react
2. 配置YAML语法高亮
3. 只读模式，不允许编辑
4. 支持当前翻译行高亮（通过props传入行号）
5. 深色/浅色主题切换
6. 响应式设计，适配不同屏幕尺寸
7. 包含以下功能：
   - 行号显示
   - 代码折叠
   - 查找功能
   - 滚动条美化

组件接口：
interface SourceEditorProps {
  content: string;
  currentLine?: number;
  theme?: 'light' | 'dark';
  onLineClick?: (lineNumber: number) => void;
}

请提供完整的组件代码。
```

#### 3.2 目标文件编辑器
**文件**: `src/components/editor/target-editor.tsx`

**功能需求**:
1. 可编辑的Monaco Editor
2. 实时翻译内容更新
3. 撤销/重做功能
4. 自动保存到状态

**开发Prompt**:
```
请开发一个可编辑的目标文件编辑器组件：

1. 基于Monaco Editor，支持编辑
2. YAML语法高亮和格式化
3. 实时接收翻译结果并更新内容
4. 支持用户手动编辑
5. 集成撤销/重做功能
6. 自动保存编辑内容到状态管理
7. 错误语法提示
8. 键盘快捷键支持（Ctrl+S保存，Ctrl+Z撤销等）

组件接口：
interface TargetEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  readOnly?: boolean;
  theme?: 'light' | 'dark';
}

请提供完整的组件代码和快捷键配置。
```

#### 3.3 编辑器布局容器
**文件**: `src/components/editor/editor-layout.tsx`

**功能需求**:
1. 左右分屏布局管理
2. 可调整分屏比例
3. 同步滚动功能
4. 全屏模式切换

---

### 阶段4：状态管理（第2周）

#### 4.1 翻译状态管理
**文件**: `src/stores/translation-store.ts`

**开发Prompt**:
```
请使用Zustand创建翻译状态管理store：

需要管理的状态：
1. 翻译会话状态（idle、translating、paused、completed、error）
2. 源文件内容和解析结果
3. 翻译任务列表和进度
4. 目标文件内容
5. 当前翻译的项目
6. AI模型配置
7. 翻译统计信息

需要的操作：
- setSourceFile(content: string)
- startTranslation(config: TranslationConfig)
- pauseTranslation() / resumeTranslation()
- updateTranslationProgress(item: TranslationItem)
- updateTargetContent(content: string)
- resetSession()

请提供完整的store实现和TypeScript类型定义。
```

#### 4.2 词典状态管理
**文件**: `src/stores/dictionary-store.ts`

**功能需求**:
1. 会话级词典数据管理
2. 词典条目增删改查
3. 词典导入导出
4. 本地存储同步

#### 4.3 UI状态管理
**文件**: `src/stores/ui-store.ts`

**功能需求**:
1. 主题切换（亮色/暗色）
2. 编辑器配置
3. 界面布局状态
4. toast消息管理

---

### 阶段5：AI服务集成（第2-3周）

#### 5.1 AI服务适配器
**文件**: `src/lib/ai/translator.ts`

**开发Prompt**:
```
请开发一个统一的AI翻译服务适配器：

支持的AI服务：
1. OpenAI (GPT-4, GPT-3.5-turbo)
2. Anthropic Claude
3. Google Gemini

功能要求：
1. 统一的接口，可切换不同AI服务
2. 支持流式翻译响应
3. 翻译上下文优化（包含YAML结构信息）
4. 自定义词典集成
5. 翻译成本估算
6. 错误重试机制
7. 并发控制

接口设计：
interface AITranslator {
  translate(item: TranslationItem, context: TranslationContext): Promise<string>;
  estimateCost(items: TranslationItem[]): Promise<number>;
  validateConnection(): Promise<boolean>;
}

请提供完整的实现。
```

#### 5.2 OpenAI集成
**文件**: `src/lib/ai/openai.ts`

**功能需求**:
1. OpenAI API客户端封装
2. 针对YAML翻译优化的Prompt
3. 流式响应处理
4. Token计算和成本控制

#### 5.3 Claude集成
**文件**: `src/lib/ai/claude.ts`

**功能需求**:
1. Anthropic API客户端
2. Claude特有的上下文处理
3. 翻译质量优化

#### 5.4 Gemini集成
**文件**: `src/lib/ai/gemini.ts`

**功能需求**:
1. Google AI API集成
2. 成本效益优化配置
3. 多语言支持优化

---

### 阶段6：实时翻译功能（第3周）

#### 6.1 翻译API端点
**文件**: `src/app/api/translate/start/route.ts`

**开发Prompt**:
```
请开发Next.js API Route实现翻译启动端点：

功能要求：
1. 接收翻译配置和YAML内容
2. 验证输入参数
3. 创建翻译会话
4. 启动异步翻译任务
5. 返回会话ID和SSE端点信息

API接口：
POST /api/translate/start
Body: {
  content: string;
  targetLanguage: string;
  aiModel: 'gpt-4' | 'claude-3' | 'gemini-pro';
  dictionary?: Record<string, string>;
  settings?: TranslationSettings;
}

Response: {
  sessionId: string;
  totalItems: number;
  estimatedCost: number;
  streamUrl: string;
}

请提供完整的API实现。
```

#### 6.2 SSE流式推送
**文件**: `src/app/api/translate/stream/route.ts`

**功能需求**:
1. Server-Sent Events实现
2. 实时推送翻译进度
3. 逐条推送翻译结果
4. 错误处理和重连机制

#### 6.3 翻译控制API
**文件**: `src/app/api/translate/control/route.ts`

**功能需求**:
1. 暂停/继续翻译
2. 停止翻译
3. 重试失败项目
4. 会话状态查询

#### 6.4 前端SSE客户端
**文件**: `src/hooks/use-sse.ts`

**开发Prompt**:
```
请开发一个React Hook来处理Server-Sent Events连接：

功能要求：
1. 建立SSE连接
2. 处理不同类型的事件消息
3. 自动重连机制
4. 连接状态管理
5. 错误处理

Hook接口：
interface UseSSEProps {
  url: string;
  enabled: boolean;
  onMessage: (event: TranslationEvent) => void;
  onError?: (error: Error) => void;
}

事件类型：
- translation_started
- translation_progress
- item_translated
- translation_completed
- translation_error

请提供完整的Hook实现。
```

---

### 阶段7：控制面板（第3周）

#### 7.1 语言选择器
**文件**: `src/components/translation/language-selector.tsx`

**功能需求**:
1. 支持的语言列表
2. 语言国旗图标
3. 搜索过滤功能
4. 最近使用语言

#### 7.2 AI模型选择器
**文件**: `src/components/translation/ai-model-selector.tsx`

**功能需求**:
1. 支持的AI模型列表
2. 模型性能和成本对比
3. 实时可用性检查
4. 推荐模型建议

#### 7.3 翻译控制按钮
**文件**: `src/components/translation/control-panel.tsx`

**功能需求**:
1. 开始/暂停/停止翻译按钮
2. 翻译进度显示
3. 实时状态更新
4. 快捷键支持

#### 7.4 进度条组件
**文件**: `src/components/translation/progress-bar.tsx`

**开发Prompt**:
```
请开发一个翻译进度条组件：

功能要求：
1. 显示翻译进度百分比
2. 当前翻译项目信息
3. 预估剩余时间
4. 翻译速度统计
5. 暂停/继续状态显示
6. 平滑的动画效果

组件接口：
interface ProgressBarProps {
  total: number;
  completed: number;
  current?: TranslationItem;
  status: 'idle' | 'translating' | 'paused' | 'completed' | 'error';
  startTime?: Date;
  estimatedTimeRemaining?: number;
}

使用Framer Motion实现动画效果。
```

---

### 阶段8：词典管理（第3-4周）

#### 8.1 词典面板
**文件**: `src/components/dictionary/dictionary-panel.tsx`

**功能需求**:
1. 侧边栏或弹窗形式
2. 词典条目列表
3. 添加/编辑/删除功能
4. 搜索和过滤
5. 批量操作

#### 8.2 词典条目组件
**文件**: `src/components/dictionary/dictionary-item.tsx`

**功能需求**:
1. 原文-译文对显示
2. 内联编辑功能
3. 匹配状态显示
4. 删除确认

#### 8.3 词典导入导出
**文件**: `src/components/dictionary/dictionary-import.tsx`

**开发Prompt**:
```
请开发词典导入导出功能：

支持格式：
1. CSV格式 (original,translation)
2. JSON格式 {key: value}
3. YAML格式 (key: value)

功能要求：
1. 文件拖拽导入
2. 格式自动检测
3. 数据验证和清洗
4. 重复项处理选项
5. 导入预览功能
6. 导出当前词典
7. 错误处理和提示

组件接口：
interface DictionaryImportProps {
  onImport: (items: DictionaryItem[]) => void;
  onExport: () => void;
  currentDictionary: DictionaryItem[];
}

请提供完整实现。
```

#### 8.4 本地存储同步
**文件**: `src/lib/storage/dictionary.ts`

**功能需求**:
1. localStorage持久化
2. 会话数据管理
3. 自动备份机制
4. 数据清理功能

---

### 阶段9：编辑和导出（第4周）

#### 9.1 快捷键系统
**文件**: `src/hooks/use-hotkeys.ts`

**功能需求**:
1. 全局快捷键管理
2. 上下文相关快捷键
3. 快捷键冲突检测
4. 自定义快捷键

#### 9.2 撤销重做系统
**文件**: `src/hooks/use-undo-redo.ts`

**开发Prompt**:
```
请开发一个撤销重做Hook：

功能要求：
1. 支持任意状态的撤销重做
2. 历史记录栈管理
3. 最大历史记录限制
4. 状态快照对比优化
5. 键盘快捷键集成

Hook接口：
interface UseUndoRedoProps<T> {
  initialState: T;
  maxHistorySize?: number;
}

返回值：
{
  state: T;
  setState: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
}

请提供完整实现。
```

#### 9.3 文件下载功能
**文件**: `src/components/export/file-download.tsx`

**功能需求**:
1. YAML格式导出
2. JSON格式导出
3. 批量下载功能
4. 文件名自动生成
5. 下载进度显示

#### 9.4 翻译会话保存
**文件**: `src/lib/storage/session.ts`

**功能需求**:
1. 会话状态序列化
2. localStorage持久化
3. 会话恢复功能
4. 自动清理过期会话

---

### 阶段10：优化和测试（第4周）

#### 10.1 性能优化
1. Monaco Editor懒加载
2. 翻译结果虚拟滚动
3. 状态更新防抖
4. 内存泄漏检查

#### 10.2 错误处理
1. 全局错误边界
2. API错误重试
3. 网络断线处理
4. 用户友好的错误信息

#### 10.3 用户体验优化
1. 加载状态指示
2. 操作反馈动画
3. 响应式设计测试
4. 键盘导航支持

#### 10.4 测试覆盖
1. 组件单元测试
2. API集成测试
3. E2E功能测试
4. 性能基准测试

---

## 开发规范

### 代码规范
1. 使用TypeScript严格模式
2. 遵循ESLint和Prettier配置
3. 组件使用函数式写法
4. 自定义Hook以use开头
5. 文件命名使用kebab-case

### 提交规范
```
feat: 添加新功能
fix: 修复问题
refactor: 重构代码
style: 样式调整
docs: 文档更新
test: 测试相关
```

### 文档要求
1. 每个组件包含JSDoc注释
2. API接口文档完整
3. README使用说明
4. 部署指南

---

## 调试和测试

### 本地开发
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run type-check   # 类型检查
npm run lint         # 代码检查
```

### 测试环境变量
```
NEXT_PUBLIC_APP_ENV=development
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GOOGLE_AI_API_KEY=your_key
```

### 调试技巧
1. 使用React DevTools调试组件状态
2. 使用Network面板监控API调用
3. 使用Console.log跟踪翻译进度
4. 使用Zustand DevTools查看状态变化

---

## 完成标准

### 功能完成标准
- [ ] 文件上传并正确解析YAML
- [ ] AI翻译服务正常工作
- [ ] 实时翻译进度显示
- [ ] 左右对照编辑器功能正常
- [ ] 词典添加和匹配工作
- [ ] 翻译结果可编辑和下载
- [ ] 错误处理完善
- [ ] 响应式设计适配

### 性能标准
- [ ] 首屏加载时间 < 3秒
- [ ] 翻译响应时间合理
- [ ] 大文件处理不卡顿
- [ ] 内存使用稳定

### 用户体验标准
- [ ] 界面直观易用
- [ ] 操作反馈及时
- [ ] 错误提示友好
- [ ] 支持键盘操作

完成第一期MVP后，用户应该能够：
1. 上传YAML文件
2. 选择目标语言和AI模型  
3. 实时观看翻译进度
4. 编辑翻译结果
5. 下载翻译后的文件

这就是一个完整可用的YAML翻译工具！