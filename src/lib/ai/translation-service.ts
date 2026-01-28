import { OpenAITranslator } from './openai-translator'
import { ClaudeTranslator } from './claude-translator'
import { 
  BaseTranslator, 
  TranslationOptions, 
  TranslationResult, 
  TranslationProgress,
  StreamingTranslationResult 
} from './base-translator'
import { YAMLProcessor, YAMLStructureItem } from '../yaml-processor'

export type AIProvider = 'openai' | 'claude' | 'gemini'

export interface TranslationConfig {
  provider: AIProvider
  model: string
  apiKey: string
  baseUrl?: string
}

export interface TranslationSessionConfig extends TranslationConfig {
  targetLanguage: string
  sourceLanguage?: string
  context?: string
  customDictionary?: Record<string, string>
}

export class TranslationService {
  private translator: BaseTranslator | null = null
  private config: TranslationSessionConfig | null = null

  constructor() {}

  // Initialize translator with configuration
  initialize(config: TranslationSessionConfig): void {
    this.config = config
    
    switch (config.provider) {
      case 'openai':
        this.translator = new OpenAITranslator(config.apiKey, config.model, config.baseUrl)
        break
      case 'claude':
        this.translator = new ClaudeTranslator(config.apiKey, config.model)
        break
      case 'gemini':
        // TODO: Implement Gemini translator
        throw new Error('Gemini translator not implemented yet')
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`)
    }
  }

  // Translate a single text
  async translateText(text: string): Promise<TranslationResult> {
    if (!this.translator || !this.config) {
      throw new Error('Translation service not initialized')
    }

    return this.translator.translateText(text, {
      targetLanguage: this.config.targetLanguage,
      sourceLanguage: this.config.sourceLanguage,
      context: this.config.context,
      customDictionary: this.config.customDictionary
    })
  }

  // Translate YAML structure with progress tracking
  async translateYAMLStructure(
    originalData: any,
    structure: YAMLStructureItem[],
    onProgress?: (progress: TranslationProgress) => void,
    signal?: AbortSignal
  ): Promise<StreamingTranslationResult> {
    if (!this.translator || !this.config) {
      throw new Error('Translation service not initialized')
    }

    // Filter translatable items
    const translatableItems = structure
      .filter(item => item.isTranslatable)
      .map(item => ({
        key: item.path,
        value: item.value
      }))

    if (translatableItems.length === 0) {
      return {
        success: true,
        translatedContent: YAMLProcessor.stringify(originalData),
        totalTranslated: 0,
        errors: [],
        usage: {
          totalTokens: 0,
          totalCost: 0
        }
      }
    }

    const result = await this.translator.translateBatch(
      translatableItems,
      {
        targetLanguage: this.config.targetLanguage,
        sourceLanguage: this.config.sourceLanguage,
        context: this.config.context,
        customDictionary: this.config.customDictionary
      },
      onProgress,
      signal
    )

    // If successful, reconstruct the YAML with translations
    if (result.success) {
      try {
        let translatedData = JSON.parse(JSON.stringify(originalData))
        
        // Apply translations to the data structure
        const originalTranslatableItems = structure.filter(item => item.isTranslatable)
        originalTranslatableItems.forEach((item, index) => {
          const translatedValue = this.extractTranslationFromResult(result.translatedContent, item.path, item.value)
          if (translatedValue !== item.value) {
            translatedData = YAMLProcessor.updateValue(translatedData, item.path, translatedValue)
          }
        })

        result.translatedContent = YAMLProcessor.stringify(translatedData)
      } catch (error) {
        console.error('Failed to reconstruct YAML:', error)
        // Fallback to simple format
      }
    }

    return result
  }

  // Extract translated value from result (helper method)
  private extractTranslationFromResult(content: string, key: string, originalValue: string): string {
    // Simple extraction - in a real implementation, this would be more sophisticated
    const lines = content.split('\n')
    for (const line of lines) {
      if (line.includes(key)) {
        const match = line.match(/:\s*"([^"]*)"/)
        if (match) {
          return match[1]
        }
      }
    }
    return originalValue
  }

  // Get translation estimate
  getTranslationEstimate(structure: YAMLStructureItem[]): {
    itemCount: number
    estimatedTime: number
    estimatedCost: number
  } {
    const translatableCount = YAMLProcessor.getTranslatableCount(structure)
    const estimatedTime = YAMLProcessor.estimateTranslationTime(structure)
    
    // Rough cost estimate based on average tokens per item
    const avgTokensPerItem = 50
    const totalTokens = translatableCount * avgTokensPerItem
    let costPer1KTokens = 0.002 // Default for GPT-3.5

    if (this.config?.provider === 'openai' && this.config.model.includes('gpt-4')) {
      costPer1KTokens = 0.03
    } else if (this.config?.provider === 'claude') {
      costPer1KTokens = 0.009 // Average Claude pricing
    }

    const estimatedCost = (totalTokens / 1000) * costPer1KTokens

    return {
      itemCount: translatableCount,
      estimatedTime,
      estimatedCost
    }
  }

  // Validate API key for a specific provider
  static async validateApiKey(provider: AIProvider, apiKey: string, baseUrl?: string): Promise<boolean> {
    switch (provider) {
      case 'openai':
        return OpenAITranslator.validateApiKey(apiKey, baseUrl)
      case 'claude':
        return ClaudeTranslator.validateApiKey(apiKey)
      case 'gemini':
        // TODO: Implement Gemini validation
        return false
      default:
        return false
    }
  }

  // Get available models for a provider
  static async getAvailableModels(provider: AIProvider, apiKey?: string, baseUrl?: string): Promise<string[]> {
    switch (provider) {
      case 'openai':
        return apiKey ? OpenAITranslator.getAvailableModels(apiKey, baseUrl) : ['gpt-4', 'gpt-3.5-turbo']
      case 'claude':
        return ClaudeTranslator.getAvailableModels()
      case 'gemini':
        // TODO: Implement Gemini models
        return ['gemini-pro']
      default:
        return []
    }
  }

  // Get current configuration
  getConfig(): TranslationSessionConfig | null {
    return this.config
  }

  // Check if service is initialized
  isInitialized(): boolean {
    return this.translator !== null && this.config !== null
  }

  // Reset service
  reset(): void {
    this.translator = null
    this.config = null
  }
}