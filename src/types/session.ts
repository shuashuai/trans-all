// 会话相关类型定义

export interface SessionState {
  id: string
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface UIState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  editorLayout: 'split' | 'tabs'
  editorTheme: 'vs-light' | 'vs-dark'
  fontSize: number
  wordWrap: boolean
}

export interface AppSettings {
  defaultLanguage: string
  defaultAIModel: string
  autoSave: boolean
  showLineNumbers: boolean
  enableHotkeys: boolean
  maxFileSize: number // MB
}