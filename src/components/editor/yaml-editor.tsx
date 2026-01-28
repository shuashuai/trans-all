'use client'

import { useRef, useEffect } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import { cn } from '@/lib/utils'

// Monaco editor types
type IStandaloneCodeEditor = Parameters<OnMount>[0]
type IStandaloneEditorConstructionOptions = Parameters<OnMount>[1]

interface YAMLEditorProps {
  value: string
  onChange?: (value: string | undefined) => void
  readOnly?: boolean
  height?: string
  className?: string
  language?: 'yaml' | 'json'
  theme?: 'light' | 'dark'
  showLineNumbers?: boolean
  placeholder?: string
}

export function YAMLEditor({
  value,
  onChange,
  readOnly = false,
  height = '400px',
  className,
  language = 'yaml',
  theme = 'light',
  showLineNumbers = true,
  placeholder = '请输入YAML内容...'
}: YAMLEditorProps) {
  const editorRef = useRef<IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    // Configure YAML language features when editor is ready
    if (editorRef.current) {
      const model = editorRef.current.getModel()
      if (model) {
        // Set YAML language configuration
        model.updateOptions({
          tabSize: 2,
          insertSpaces: true,
        })
      }
    }
  }, [])

  const handleEditorDidMount = (editor: IStandaloneCodeEditor) => {
    editorRef.current = editor
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 22,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      folding: true,
      lineNumbersMinChars: 3,
      glyphMargin: false,
      contextmenu: true,
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly,
      cursorStyle: 'line',
      renderLineHighlight: 'all',
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      }
    })

    // Set placeholder if value is empty
    if (!value && placeholder) {
      editor.setValue(placeholder)
      const model = editor.getModel()
      if (model) {
        editor.setSelection(model.getFullModelRange())
      }
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    if (onChange && !readOnly) {
      onChange(value)
    }
  }

  // Convert theme
  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs'

  return (
    <div className={cn('border border-border rounded-md overflow-hidden', className)}>
      <Editor
        height={height}
        language={language}
        theme={monacoTheme}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          lineNumbers: showLineNumbers ? 'on' : 'off',
          wordWrap: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
          lineHeight: 22,
          folding: true,
          renderLineHighlight: 'all',
          contextmenu: true,
          selectOnLineNumbers: true,
          glyphMargin: false,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          }
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">加载编辑器...</div>
          </div>
        }
      />
    </div>
  )
}