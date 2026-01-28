// 翻译相关类型定义

export interface TranslationItem {
  id: string
  keyPath: string
  originalText: string
  translatedText?: string
  status: 'pending' | 'translating' | 'completed' | 'error'
  position: {
    line: number
    column: number
  }
  aiReasoning?: string
  confidenceScore?: number
}

export interface TranslationConfig {
  targetLanguage: string
  aiModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-sonnet' | 'gemini-pro'
  customDictionary?: Record<string, string>
  translationStyle?: 'technical' | 'casual' | 'formal'
  preserveFormatting?: boolean
}

export interface TranslationSession {
  id: string
  status: 'idle' | 'translating' | 'paused' | 'completed' | 'error'
  sourceContent: string
  targetContent: string
  translationItems: TranslationItem[]
  config: TranslationConfig
  progress: {
    total: number
    completed: number
    failed: number
    percentage: number
  }
  startTime?: Date
  endTime?: Date
  estimatedTimeRemaining?: number
  totalCost?: number
}

export interface TranslationEvent {
  type: 'started' | 'progress' | 'item_result' | 'completed' | 'error'
  sessionId: string
  data?: any
}

export interface YamlParseResult {
  success: boolean
  data?: any
  error?: string
  translationItems?: TranslationItem[]
  totalItems?: number
}

export interface ValidationResult {
  isValid: boolean
  errors?: Array<{
    line: number
    column: number
    message: string
  }>
  warnings?: Array<{
    line: number
    column: number
    message: string
  }>
}