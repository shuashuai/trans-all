import { create } from 'zustand'
import { TranslationService, TranslationSessionConfig, AIProvider } from '@/lib/ai/translation-service'
import { TranslationProgress, StreamingTranslationResult } from '@/lib/ai/base-translator'
import { YAMLStructureItem } from '@/lib/yaml-processor'

export interface TranslationState {
  // Service instance
  service: TranslationService
  
  // Configuration
  config: TranslationSessionConfig | null
  isConfigured: boolean
  
  // Translation state
  isTranslating: boolean
  isPaused: boolean
  progress: TranslationProgress | null
  result: StreamingTranslationResult | null
  abortController: AbortController | null
  
  // UI state
  showSettings: boolean
  
  // Actions
  configure: (config: TranslationSessionConfig) => Promise<void>
  startTranslation: (originalData: any, structure: YAMLStructureItem[]) => Promise<void>
  pauseTranslation: () => void
  resumeTranslation: () => void
  stopTranslation: () => void
  reset: () => void
  
  // Settings actions
  toggleSettings: () => void
  updateConfig: (updates: Partial<TranslationSessionConfig>) => void
  
  // Progress callback
  handleProgress: (progress: TranslationProgress) => void
}

export const useTranslationStore = create<TranslationState>((set, get) => ({
  // Initial state
  service: new TranslationService(),
  config: null,
  isConfigured: false,
  isTranslating: false,
  isPaused: false,
  progress: null,
  result: null,
  abortController: null,
  showSettings: false,

  // Configure the translation service
  configure: async (config: TranslationSessionConfig) => {
    const { service } = get()
    
    try {
      // Validate API key first
      const isValid = await TranslationService.validateApiKey(
        config.provider,
        config.apiKey,
        config.baseUrl
      )
      
      if (!isValid) {
        throw new Error('Invalid API key')
      }

      service.initialize(config)
      
      set({
        config,
        isConfigured: true,
        showSettings: false
      })
    } catch (error) {
      console.error('Failed to configure translation service:', error)
      throw error
    }
  },

  // Start translation
  startTranslation: async (originalData: any, structure: YAMLStructureItem[]) => {
    const { service, config } = get()
    
    if (!config || !service.isInitialized()) {
      throw new Error('Translation service not configured')
    }

    const abortController = new AbortController()
    
    set({
      isTranslating: true,
      isPaused: false,
      progress: null,
      result: null,
      abortController
    })

    try {
      const result = await service.translateYAMLStructure(
        originalData,
        structure,
        get().handleProgress,
        abortController.signal
      )

      set({
        result,
        isTranslating: false,
        abortController: null
      })
    } catch (error) {
      console.error('Translation failed:', error)
      
      set({
        isTranslating: false,
        abortController: null,
        progress: {
          currentItem: 0,
          totalItems: structure.length,
          currentKey: '',
          currentValue: '',
          progress: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Translation failed'
        }
      })
    }
  },

  // Pause translation (not yet implemented in service)
  pauseTranslation: () => {
    set({ isPaused: true })
  },

  // Resume translation (not yet implemented in service)
  resumeTranslation: () => {
    set({ isPaused: false })
  },

  // Stop translation
  stopTranslation: () => {
    const { abortController } = get()
    
    if (abortController) {
      abortController.abort()
    }
    
    set({
      isTranslating: false,
      isPaused: false,
      abortController: null,
      progress: {
        currentItem: 0,
        totalItems: 0,
        currentKey: '',
        currentValue: '',
        progress: 0,
        status: 'error',
        error: 'Translation cancelled by user'
      }
    })
  },

  // Reset everything
  reset: () => {
    const { service, abortController } = get()
    
    if (abortController) {
      abortController.abort()
    }
    
    service.reset()
    
    set({
      config: null,
      isConfigured: false,
      isTranslating: false,
      isPaused: false,
      progress: null,
      result: null,
      abortController: null,
      showSettings: false
    })
  },

  // Toggle settings modal
  toggleSettings: () => {
    set(state => ({ showSettings: !state.showSettings }))
  },

  // Update configuration
  updateConfig: (updates: Partial<TranslationSessionConfig>) => {
    const { config } = get()
    
    if (config) {
      const newConfig = { ...config, ...updates }
      set({ config: newConfig })
    }
  },

  // Handle progress updates
  handleProgress: (progress: TranslationProgress) => {
    set({ progress })
  }
}))

// Stable selectors for easier component usage
const selectConfig = (state: TranslationState) => state.config
const selectProgress = (state: TranslationState) => state.progress
const selectResult = (state: TranslationState) => state.result
const selectStatus = (state: TranslationState) => ({
  isTranslating: state.isTranslating,
  isPaused: state.isPaused,
  isConfigured: state.isConfigured
})

export const useTranslationConfig = () => useTranslationStore(selectConfig)
export const useTranslationProgress = () => useTranslationStore(selectProgress)
export const useTranslationResult = () => useTranslationStore(selectResult)
export const useTranslationStatus = () => useTranslationStore(selectStatus)