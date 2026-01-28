import OpenAI from 'openai'
import { 
  BaseTranslator, 
  TranslationOptions, 
  TranslationResult, 
  TranslationProgress,
  StreamingTranslationResult 
} from './base-translator'

export class OpenAITranslator extends BaseTranslator {
  private client: OpenAI

  constructor(apiKey: string, model: string = 'gpt-4', baseUrl?: string) {
    super(apiKey, model, baseUrl)
    this.client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
      dangerouslyAllowBrowser: true // Allow client-side usage
    })
  }

  async translateText(
    text: string,
    options: TranslationOptions
  ): Promise<TranslationResult> {
    try {
      this.validateOptions(options)

      const prompt = this.buildPrompt(
        text,
        BaseTranslator.getLanguageName(options.targetLanguage),
        options.sourceLanguage ? BaseTranslator.getLanguageName(options.sourceLanguage) : undefined,
        options.context,
        options.customDictionary
      )

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Translate accurately while preserving meaning and context.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })

      const translatedValue = completion.choices[0]?.message?.content?.trim()

      if (!translatedValue) {
        throw new Error('No translation received from OpenAI')
      }

      return {
        success: true,
        translatedValue,
        usage: {
          tokens: completion.usage?.total_tokens || 0,
          cost: this.calculateCost(completion.usage?.total_tokens || 0)
        }
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async translateBatch(
    items: Array<{ key: string; value: string }>,
    options: TranslationOptions,
    onProgress?: (progress: TranslationProgress) => void,
    signal?: AbortSignal
  ): Promise<StreamingTranslationResult> {
    const result: StreamingTranslationResult = {
      success: false,
      translatedContent: '',
      totalTranslated: 0,
      errors: [],
      usage: {
        totalTokens: 0,
        totalCost: 0
      }
    }

    try {
      this.validateOptions(options)

      const translatedItems: Record<string, string> = {}
      let totalTokens = 0

      for (let i = 0; i < items.length; i++) {
        // Check if operation was cancelled
        if (signal?.aborted) {
          throw new Error('Translation cancelled')
        }

        const item = items[i]
        
        // Update progress
        onProgress?.({
          currentItem: i + 1,
          totalItems: items.length,
          currentKey: item.key,
          currentValue: item.value,
          progress: ((i + 1) / items.length) * 100,
          status: 'translating'
        })

        try {
          const translationResult = await this.translateText(item.value, options)
          
          if (translationResult.success && translationResult.translatedValue) {
            translatedItems[item.key] = translationResult.translatedValue
            totalTokens += translationResult.usage?.tokens || 0
            result.totalTranslated++
            
            // Update progress with translation result
            onProgress?.({
              currentItem: i + 1,
              totalItems: items.length,
              currentKey: item.key,
              currentValue: item.value,
              translatedValue: translationResult.translatedValue,
              progress: ((i + 1) / items.length) * 100,
              status: 'translating'
            })
          } else {
            throw new Error(translationResult.error || 'Translation failed')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          result.errors.push({
            key: item.key,
            error: errorMessage
          })
          
          console.warn(`Failed to translate "${item.key}": ${errorMessage}`)
          // Keep original value if translation fails
          translatedItems[item.key] = item.value
        }

        // Add small delay to avoid rate limiting
        if (i < items.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      // Generate final translated content
      result.translatedContent = this.buildTranslatedYAML(translatedItems, items)
      result.usage.totalTokens = totalTokens
      result.usage.totalCost = this.calculateCost(totalTokens)
      result.success = true

      // Final progress update
      onProgress?.({
        currentItem: items.length,
        totalItems: items.length,
        currentKey: '',
        currentValue: '',
        progress: 100,
        status: 'completed'
      })

      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Batch translation failed'
      
      onProgress?.({
        currentItem: 0,
        totalItems: items.length,
        currentKey: '',
        currentValue: '',
        progress: 0,
        status: 'error',
        error: errorMessage
      })

      return {
        ...result,
        success: false,
        errors: [{ key: 'batch', error: errorMessage }]
      }
    }
  }

  private buildTranslatedYAML(
    translatedItems: Record<string, string>,
    originalItems: Array<{ key: string; value: string }>
  ): string {
    // Simple implementation - in real scenario, we'd reconstruct the full YAML structure
    const lines: string[] = []
    
    originalItems.forEach(item => {
      const translatedValue = translatedItems[item.key] || item.value
      lines.push(`${item.key}: "${translatedValue}"`)
    })
    
    return lines.join('\n')
  }

  private calculateCost(tokens: number): number {
    // OpenAI pricing (approximate, as of 2024)
    const costPer1KTokens = this.model.includes('gpt-4') ? 0.03 : 0.002
    return (tokens / 1000) * costPer1KTokens
  }

  // Static method to check if API key is valid
  static async validateApiKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const client = new OpenAI({
        apiKey,
        baseURL: baseUrl,
        dangerouslyAllowBrowser: true
      })

      await client.models.list()
      return true
    } catch (error) {
      console.error('OpenAI API key validation failed:', error)
      return false
    }
  }

  // Get available models
  static async getAvailableModels(apiKey: string, baseUrl?: string): Promise<string[]> {
    try {
      const client = new OpenAI({
        apiKey,
        baseURL: baseUrl,
        dangerouslyAllowBrowser: true
      })

      const models = await client.models.list()
      return models.data
        .filter(model => model.id.includes('gpt'))
        .map(model => model.id)
        .sort()
    } catch (error) {
      console.error('Failed to fetch OpenAI models:', error)
      return ['gpt-4', 'gpt-3.5-turbo'] // Fallback
    }
  }
}