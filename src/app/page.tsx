'use client'

import { useState } from 'react'
import { Upload, Play, Pause, Square, Download, Settings, Languages, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { FileUploader } from '@/components/upload/file-uploader'
import { SplitView } from '@/components/editor/split-view'
import { TranslationSettingsModal } from '@/components/settings/translation-settings-modal'
import { useFileStore } from '@/stores/file-store'
import { useTranslationStore, useTranslationStatus, useTranslationProgress, useTranslationResult } from '@/stores/translation-store'
import { YAMLProcessor } from '@/lib/yaml-processor'

export default function HomePage() {
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState('zh-CN')
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  
  // File store
  const { 
    uploadedFile, 
    isUploading,
    uploadError,
    setUploadedFile, 
    removeFile, 
    setUploading,
    setUploadError
  } = useFileStore()

  // Translation store
  const {
    config: translationConfig,
    showSettings,
    toggleSettings,
    startTranslation,
    stopTranslation,
    reset: resetTranslation
  } = useTranslationStore()
  
  const { isTranslating, isPaused, isConfigured } = useTranslationStatus()
  const progress = useTranslationProgress()
  const result = useTranslationResult()

  const handleFileSelect = async (file: File, content: string) => {
    try {
      setUploading(true)
      
      // Parse YAML
      const parseResult = YAMLProcessor.parse(content)
      
      if (!parseResult.isValid) {
        setUploadError(parseResult.error || 'YAML解析失败')
        return
      }

      // Create uploaded file object
      const uploadedFileData = {
        file,
        content,
        parsedData: parseResult.data,
        structure: parseResult.structure,
        uploadedAt: new Date()
      }

      setUploadedFile(uploadedFileData)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '文件处理失败')
    } finally {
      setUploading(false)
    }
  }

  const handleFileRemove = () => {
    removeFile()
    resetTranslation()
  }

  const handleStartTranslation = async () => {
    if (!uploadedFile || !uploadedFile.structure || !isConfigured) {
      if (!isConfigured) {
        toggleSettings()
      }
      return
    }

    try {
      await startTranslation(uploadedFile.parsedData, uploadedFile.structure)
    } catch (error) {
      console.error('Failed to start translation:', error)
    }
  }

  const handleStopTranslation = () => {
    stopTranslation()
  }

  // Get translated content from result or empty string
  const translatedContent = result?.translatedContent || ''
  
  // Calculate progress percentage
  const progressPercentage = progress?.progress || 0

  // Language display mapping
  const languageDisplayMap: Record<string, string> = {
    'zh-CN': '🇨🇳 中文（简体）',
    'zh-TW': '🇹🇼 中文（繁体）',
    'en': '🇺🇸 English',
    'ja': '🇯🇵 日本語',
    'ko': '🇰🇷 한국어',
    'fr': '🇫🇷 Français',
    'de': '🇩🇪 Deutsch',
    'es': '🇪🇸 Español',
    'ru': '🇷🇺 Русский'
  }

  return (
    <main className="h-screen flex flex-col bg-background">
      {/* 顶部控制栏 */}
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
        {/* 左侧标题区域 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Languages className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">YAML翻译工具</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            基于AI的智能翻译
          </div>
        </div>

        {/* 中间控制区域 */}
        <div className="flex items-center space-x-3">
          {/* 语言选择器 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">目标语言:</span>
            <Select value={selectedTargetLanguage} onValueChange={setSelectedTargetLanguage}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="选择目标语言" />
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

          {/* AI模型显示 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">AI模型:</span>
            <div className="text-sm font-medium">
              {translationConfig ? 
                `${translationConfig.provider.toUpperCase()} ${translationConfig.model}` : 
                '未配置'
              }
            </div>
          </div>
        </div>

        {/* 右侧操作区域 */}
        <div className="flex items-center space-x-2">
          {!isTranslating ? (
            <Button 
              onClick={handleStartTranslation}
              className="flex items-center space-x-2"
              disabled={!uploadedFile || !isConfigured}
            >
              <Play className="h-4 w-4" />
              <span>开始翻译</span>
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => {/* TODO: Pause functionality */}}
                disabled={isPaused}
              >
                <Pause className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={handleStopTranslation}
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          )}
          {uploadedFile && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleFileRemove}
            >
              重新上传
            </Button>
          )}
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleSettings}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="flex-1 flex">
        {uploadedFile ? (
          /* 分割视图：源文件和翻译结果 */
          <SplitView
            sourceContent={uploadedFile.content}
            translatedContent={translatedContent}
            onTranslatedChange={(content) => {/* Read-only for now */}}
            isTranslating={isTranslating}
            className="w-full"
          />
        ) : (
          /* 文件上传区域 */
          <div className="w-full flex flex-col">
            {/* 头部 */}
            <div className="h-12 border-b border-border bg-muted/50 px-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">上传YAML文件开始翻译</span>
              </div>
              <div className="text-xs text-muted-foreground">
                支持 .yml, .yaml 格式，最大10MB
              </div>
            </div>

            {/* 文件上传区域 */}
            <div className="flex-1 p-8">
              <FileUploader
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                maxSize={10}
                className="h-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      <footer className="h-12 border-t border-border bg-card px-6 flex items-center justify-between">
        {/* 左侧状态信息 */}
        <div className="flex items-center space-x-4 text-sm">
          <StatusBadge status={
            isUploading ? "uploading" : 
            isTranslating ? "translating" : 
            uploadedFile ? "ready" : "idle"
          } />
          <span className="text-muted-foreground">•</span>
          {uploadedFile ? (
            <>
              <span className="text-muted-foreground">
                文件: {uploadedFile.file.name}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {uploadedFile.structure ? 
                  `${YAMLProcessor.getTranslatableCount(uploadedFile.structure)} 项待翻译` :
                  '解析中...'
                }
              </span>
              <span className="text-muted-foreground">•</span>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">等待文件上传</span>
              <span className="text-muted-foreground">•</span>
            </>
          )}
          <span className="text-muted-foreground">
            语言: {languageDisplayMap[selectedTargetLanguage] || selectedTargetLanguage}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">模型: {translationConfig ? translationConfig.model : '未配置'}</span>
        </div>

        {/* 中间进度条 */}
        {isTranslating && progress && (
          <div className="flex-1 max-w-md mx-8">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground min-w-0">
                {progress.status === 'translating' ? 
                  `翻译中... (${progress.currentItem}/${progress.totalItems})` :
                  progress.status
                }
              </span>
              <Progress value={progressPercentage} className="flex-1" />
              <span className="text-sm text-muted-foreground min-w-0">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            {progress.currentKey && (
              <div className="text-xs text-muted-foreground mt-1">
                正在翻译: {progress.currentKey}
              </div>
            )}
          </div>
        )}

        {/* 右侧额外信息 */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>就绪</span>
        </div>
      </footer>

      {/* 设置模态框 */}
      <TranslationSettingsModal
        isOpen={showSettings}
        onClose={toggleSettings}
      />
    </main>
  )
}