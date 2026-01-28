export interface TranslationOptions {
  targetLanguage: string
  sourceLanguage?: string
  context?: string
  customDictionary?: Record<string, string>
  model?: string
}

export interface TranslationProgress {
  currentItem: number
  totalItems: number
  currentKey: string
  currentValue: string
  translatedValue?: string
  progress: number
  status: 'translating' | 'completed' | 'error' | 'paused'
  error?: string
}

export interface TranslationResult {
  success: boolean
  translatedValue?: string
  error?: string
  usage?: {
    tokens: number
    cost?: number
  }
}

export interface StreamingTranslationResult {
  success: boolean
  translatedContent: string
  totalTranslated: number
  errors: Array<{
    key: string
    error: string
  }>
  usage: {
    totalTokens: number
    totalCost?: number
  }
}

export abstract class BaseTranslator {
  protected apiKey: string
  protected model: string
  protected baseUrl?: string

  constructor(apiKey: string, model: string, baseUrl?: string) {
    this.apiKey = apiKey
    this.model = model
    this.baseUrl = baseUrl
  }

  abstract translateText(
    text: string,
    options: TranslationOptions
  ): Promise<TranslationResult>

  abstract translateBatch(
    items: Array<{ key: string; value: string }>,
    options: TranslationOptions,
    onProgress?: (progress: TranslationProgress) => void,
    signal?: AbortSignal
  ): Promise<StreamingTranslationResult>

  protected buildPrompt(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string,
    context?: string,
    customDictionary?: Record<string, string>
  ): string {
    let prompt = `Translate the following text to ${targetLanguage}`

    if (sourceLanguage) {
      prompt += ` from ${sourceLanguage}`
    }

    if (context) {
      prompt += `\n\nContext: ${context}`
    }

    if (customDictionary && Object.keys(customDictionary).length > 0) {
      prompt += '\n\nCustom dictionary (use these translations for specific terms):'
      Object.entries(customDictionary).forEach(([key, value]) => {
        prompt += `\n- ${key} → ${value}`
      })
    }

    prompt += `\n\nRules:
1. Only return the translated text, no explanations
2. Preserve the original meaning and tone
3. Keep technical terms accurate
4. Maintain proper grammar and natural flow
5. If custom dictionary terms appear, use the provided translations

Text to translate:
${text}`

    return prompt
  }

  protected validateOptions(options: TranslationOptions): void {
    if (!options.targetLanguage) {
      throw new Error('Target language is required')
    }
  }

  protected handleError(error: any): TranslationResult {
    console.error('Translation error:', error)
    
    let errorMessage = 'Translation failed'
    
    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage
    }
  }

  // Language code mapping
  static getLanguageName(code: string): string {
    const languageMap: Record<string, string> = {
      'zh-CN': 'Simplified Chinese',
      'zh-TW': 'Traditional Chinese',
      'en': 'English',
      'ja': 'Japanese',
      'ko': 'Korean',
      'fr': 'French',
      'de': 'German',
      'es': 'Spanish',
      'ru': 'Russian',
      'pt': 'Portuguese',
      'it': 'Italian',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'th': 'Thai',
      'vi': 'Vietnamese'
    }
    
    return languageMap[code] || code
  }
}