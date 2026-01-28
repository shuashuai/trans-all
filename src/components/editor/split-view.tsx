'use client'

import { useState, useEffect } from 'react'
import { YAMLEditor } from './yaml-editor'
import { Button } from '@/components/ui/button'
import { Copy, Download, Eye, EyeOff } from 'lucide-react'
import { YAMLProcessor } from '@/lib/yaml-processor'
import { cn } from '@/lib/utils'

interface SplitViewProps {
  sourceContent: string
  translatedContent: string
  onTranslatedChange?: (content: string | undefined) => void
  isTranslating?: boolean
  className?: string
}

export function SplitView({
  sourceContent,
  translatedContent,
  onTranslatedChange,
  isTranslating = false,
  className
}: SplitViewProps) {
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [isValidYAML, setIsValidYAML] = useState(true)

  useEffect(() => {
    if (translatedContent) {
      const validation = YAMLProcessor.validateYAMLContent(translatedContent)
      setIsValidYAML(validation.isValid)
    }
  }, [translatedContent])

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(translatedContent)
      // TODO: Show toast notification
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([translatedContent], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'translated.yaml'
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleLineNumbers = () => {
    setShowLineNumbers(!showLineNumbers)
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* 工具栏 */}
      <div className="h-10 border-b border-border bg-muted/50 px-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLineNumbers}
            className="h-7 px-2"
          >
            {showLineNumbers ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <span className="text-xs text-muted-foreground">
            {showLineNumbers ? '隐藏行号' : '显示行号'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {!isValidYAML && (
            <span className="text-xs text-destructive">
              YAML格式错误
            </span>
          )}
          {translatedContent && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyToClipboard}
                className="h-7 px-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-7 px-2"
                disabled={!isValidYAML}
              >
                <Download className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 flex">
        {/* 源文件编辑器 */}
        <div className="w-1/2 border-r border-border">
          <div className="h-8 bg-muted/30 border-b border-border px-3 flex items-center">
            <span className="text-xs font-medium text-muted-foreground">
              源文件 (只读)
            </span>
          </div>
          <YAMLEditor
            value={sourceContent}
            readOnly={true}
            height="calc(100% - 32px)"
            showLineNumbers={showLineNumbers}
            className="border-none rounded-none"
          />
        </div>

        {/* 翻译结果编辑器 */}
        <div className="w-1/2">
          <div className="h-8 bg-muted/30 border-b border-border px-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              翻译结果 {isTranslating && '(翻译中...)'}
            </span>
            {translatedContent && (
              <div className="text-xs text-muted-foreground">
                {translatedContent.split('\n').length} 行
              </div>
            )}
          </div>
          
          {translatedContent || isTranslating ? (
            <YAMLEditor
              value={translatedContent}
              onChange={(value) => onTranslatedChange?.(value || '')}
              height="calc(100% - 32px)"
              showLineNumbers={showLineNumbers}
              className="border-none rounded-none"
              placeholder={isTranslating ? '正在翻译，请稍候...' : '翻译结果将显示在这里'}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-muted/10">
              <div className="text-center text-muted-foreground">
                <div className="text-sm mb-2">翻译结果将在这里显示</div>
                <div className="text-xs">点击"开始翻译"按钮开始翻译</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}