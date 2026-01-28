import Anthropic from '@anthropic-ai/sdk'
import { 
  BaseTranslator, 
  TranslationOptions, 
  TranslationResult, 
  TranslationProgress,
  StreamingTranslationResult 
} from './base-translator'

export class ClaudeTranslator extends BaseTranslator {
  private client: Anthropic

  constructor(apiKey: string, model: string = 'claude-3-sonnet-20240229') {
    super(apiKey, model)
    this.client = new Anthropic({
      apiKey,
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

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const translatedValue = message.content[0]?.type === 'text' 
        ? message.content[0].text.trim() 
        : undefined

      if (!translatedValue) {
        throw new Error('No translation received from Claude')
      }

      return {
        success: true,
        translatedValue,
        usage: {
          tokens: message.usage.input_tokens + message.usage.output_tokens,
          cost: this.calculateCost(message.usage.input_tokens + message.usage.output_tokens)
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
    // Claude pricing (approximate, as of 2024)
    // Claude 3 Sonnet: $3 per million input tokens, $15 per million output tokens
    // Simplified calculation assuming 50/50 split
    const avgCostPer1MTokens = 9 // Average of input and output costs
    return (tokens / 1000000) * avgCostPer1MTokens
  }

  // Static method to check if API key is valid
  static async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const client = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true
      })

      // Test with a simple message
      await client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hi'
          }
        ]
      })
      
      return true
    } catch (error) {
      console.error('Claude API key validation failed:', error)
      return false
    }
  }

  // Get available models
  static getAvailableModels(): string[] {
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ]
  }
}