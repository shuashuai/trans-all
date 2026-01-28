// 词典相关类型定义

export interface DictionaryItem {
  id: string
  original: string
  translation: string
  description?: string
  category?: string
  priority?: number
  isRegex?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DictionaryImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: Array<{
    line: number
    message: string
    data?: any
  }>
}

export interface DictionaryExportFormat {
  format: 'csv' | 'json' | 'yaml'
  includeMetadata?: boolean
  includeDescription?: boolean
}