'use client'

import { useState, useEffect } from 'react'
import { X, Key, Globe, Brain, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTranslationStore } from '@/stores/translation-store'
import { TranslationService, AIProvider } from '@/lib/ai/translation-service'
import { cn } from '@/lib/utils'

interface TranslationSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TranslationSettingsModal({ isOpen, onClose }: TranslationSettingsModalProps) {
  const { config, configure, updateConfig, isConfigured } = useTranslationStore()
  
  // Form state
  const [provider, setProvider] = useState<AIProvider>('openai')
  const [model, setModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('zh-CN')
  const [sourceLanguage, setSourceLanguage] = useState('')
  const [context, setContext] = useState('')
  const [customDictionary, setCustomDictionary] = useState('')
  
  // UI state
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [availableModels, setAvailableModels] = useState<string[]>([])

  // Load existing config when modal opens
  useEffect(() => {
    if (isOpen && config) {
      setProvider(config.provider)
      setModel(config.model)
      setApiKey(config.apiKey)
      setBaseUrl(config.baseUrl || '')
      setTargetLanguage(config.targetLanguage)
      setSourceLanguage(config.sourceLanguage || '')
      setContext(config.context || '')
      setCustomDictionary(
        config.customDictionary 
          ? Object.entries(config.customDictionary).map(([k, v]) => `${k}=${v}`).join('\n')
          : ''
      )
    }
  }, [isOpen, config])

  // Load available models when provider changes
  useEffect(() => {
    const loadModels = async () => {
      const models = await TranslationService.getAvailableModels(provider, apiKey, baseUrl)
      setAvailableModels(models)
      if (models.length > 0 && !model) {
        setModel(models[0])
      }
    }
    loadModels()
  }, [provider, apiKey, baseUrl])

  const parseCustomDictionary = (text: string): Record<string, string> => {
    const dictionary: Record<string, string> = {}
    const lines = text.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        dictionary[key.trim()] = valueParts.join('=').trim()
      }
    }
    
    return dictionary
  }

  const handleSave = async () => {
    setIsValidating(true)
    setValidationError('')
    
    try {
      const newConfig = {
        provider,
        model,
        apiKey,
        baseUrl: baseUrl || undefined,
        targetLanguage,
        sourceLanguage: sourceLanguage || undefined,
        context: context || undefined,
        customDictionary: customDictionary ? parseCustomDictionary(customDictionary) : undefined
      }

      await configure(newConfig)
      onClose()
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : '配置失败')
    } finally {
      setIsValidating(false)
    }
  }

  const handleTestConnection = async () => {
    if (!apiKey) {
      setValidationError('请输入API密钥')
      return
    }

    setIsValidating(true)
    setValidationError('')

    try {
      const isValid = await TranslationService.validateApiKey(provider, apiKey, baseUrl)
      if (isValid) {
        setValidationError('')
      } else {
        setValidationError('API密钥验证失败')
      }
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : '连接测试失败')
    } finally {
      setIsValidating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">翻译设置</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* AI Provider */}
          <div className="space-y-2">
            <Label>AI服务提供商</Label>
            <Select value={provider} onValueChange={(value: AIProvider) => setProvider(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI (GPT-4, GPT-3.5)</SelectItem>
                <SelectItem value="claude">Anthropic Claude</SelectItem>
                <SelectItem value="gemini" disabled>Google Gemini (即将支持)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label>模型</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map(modelName => (
                  <SelectItem key={modelName} value={modelName}>
                    {modelName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>API密钥</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                type="password"
                placeholder="请输入API密钥"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={!apiKey || isValidating}
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  '测试'
                )}
              </Button>
            </div>
          </div>

          {/* Base URL (for OpenAI) */}
          {provider === 'openai' && (
            <div className="space-y-2">
              <Label>自定义API地址 (可选)</Label>
              <Input
                placeholder="https://api.openai.com"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                如需使用自定义OpenAI兼容服务，请填入完整API地址
              </p>
            </div>
          )}

          {/* Target Language */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>目标语言</span>
            </Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh-CN">🇨🇳 中文（简体）</SelectItem>
                <SelectItem value="zh-TW">🇹🇼 中文（繁体）</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                <SelectItem value="ko">🇰🇷 한국어</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
                <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
                <SelectItem value="ru">🇷🇺 Русский</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source Language */}
          <div className="space-y-2">
            <Label>源语言 (可选，自动检测)</Label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="自动检测" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">自动检测</SelectItem>
                <SelectItem value="zh-CN">🇨🇳 中文（简体）</SelectItem>
                <SelectItem value="zh-TW">🇹🇼 中文（繁体）</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                <SelectItem value="ko">🇰🇷 한국어</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Context */}
          <div className="space-y-2">
            <Label>翻译上下文 (可选)</Label>
            <Textarea
              placeholder="为翻译提供额外的上下文信息，如项目类型、行业背景等"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
            />
          </div>

          {/* Custom Dictionary */}
          <div className="space-y-2">
            <Label>自定义词典 (可选)</Label>
            <Textarea
              placeholder="一行一个，格式：原文=译文&#10;例如：&#10;login=登录&#10;dashboard=仪表板"
              value={customDictionary}
              onChange={(e) => setCustomDictionary(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              每行一个词条，格式：原文=译文
            </p>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="flex items-center space-x-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{validationError}</span>
            </div>
          )}

          {/* Success Status */}
          {isConfigured && !validationError && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">配置已保存</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!apiKey || !model || isValidating}
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                验证中...
              </>
            ) : (
              '保存配置'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}