'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  onFileSelect: (file: File, content: string) => void
  onFileRemove: () => void
  maxSize?: number // in MB
  className?: string
}

interface UploadedFile {
  file: File
  content: string
  size: string
  uploadProgress: number
}

export function FileUploader({
  onFileSelect,
  onFileRemove,
  maxSize = 10,
  className
}: FileUploaderProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [error, setError] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  const validateFile = useCallback((file: File): string | null => {
    // Check file extension
    const validExtensions = ['.yml', '.yaml']
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!validExtensions.includes(fileExtension)) {
      return '只支持 .yml 和 .yaml 格式的文件'
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `文件大小不能超过 ${maxSize}MB`
    }

    return null
  }, [maxSize])

  const readFileContent = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        resolve(content)
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file, 'utf-8')
    })
  }, [])

  const simulateUploadProgress = useCallback((file: File): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setTimeout(() => {
            resolve()
          }, 200)
        }
        
        setUploadedFile(prev => prev ? { ...prev, uploadProgress: Math.min(progress, 100) } : null)
      }, 100)
    })
  }, [])

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  const handleFileDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validate file
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setIsUploading(true)
    
    try {
      // Create initial file state
      const newFile: UploadedFile = {
        file,
        content: '',
        size: formatFileSize(file.size),
        uploadProgress: 0
      }
      setUploadedFile(newFile)

      // Read file content
      const content = await readFileContent(file)
      
      // Simulate upload progress
      await simulateUploadProgress(file)
      
      // Update file with content
      const completeFile = {
        ...newFile,
        content,
        uploadProgress: 100
      }
      setUploadedFile(completeFile)
      
      // Notify parent
      onFileSelect(file, content)
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件处理失败')
      setUploadedFile(null)
    } finally {
      setIsUploading(false)
    }
  }, [validateFile, readFileContent, simulateUploadProgress, formatFileSize, onFileSelect])

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null)
    setError('')
    onFileRemove()
  }, [onFileRemove])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      'application/x-yaml': ['.yml', '.yaml'],
      'text/yaml': ['.yml', '.yaml'],
      'text/x-yaml': ['.yml', '.yaml'],
    },
    multiple: false,
    maxSize: maxSize * 1024 * 1024,
  })

  // Show uploaded file
  if (uploadedFile && !isUploading) {
    return (
      <div className={cn('border border-border rounded-lg p-4', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{uploadedFile.file.name}</p>
              <p className="text-xs text-muted-foreground">
                {uploadedFile.size} • YAML文件
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Show upload progress
  if (uploadedFile && isUploading) {
    return (
      <div className={cn('border border-border rounded-lg p-4', className)}>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{uploadedFile.file.name}</p>
              <p className="text-xs text-muted-foreground">
                {uploadedFile.size} • 上传中...
              </p>
            </div>
          </div>
          <Progress value={uploadedFile.uploadProgress} className="h-2" />
        </div>
      </div>
    )
  }

  // Show dropzone
  return (
    <div className={cn('h-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/20 hover:bg-muted/30'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-foreground mb-2">
          {isDragActive ? '释放文件到此处' : '拖拽YAML文件到此处'}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          或点击选择文件上传（支持.yml, .yaml格式，最大{maxSize}MB）
        </p>
        <Button variant="outline" size="sm">
          选择文件
        </Button>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}