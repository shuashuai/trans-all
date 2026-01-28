import * as yaml from 'js-yaml'

export interface YAMLParseResult {
  isValid: boolean
  data?: any
  error?: string
  structure?: YAMLStructureItem[]
}

export interface YAMLStructureItem {
  key: string
  value: string
  path: string
  lineNumber?: number
  isTranslatable: boolean
}

export class YAMLProcessor {
  static parse(content: string): YAMLParseResult {
    try {
      const data = yaml.load(content)
      const structure = this.extractTranslatableItems(data)
      
      return {
        isValid: true,
        data,
        structure
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : '解析失败'
      }
    }
  }

  static stringify(data: any): string {
    try {
      return yaml.dump(data, {
        flowLevel: -1,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
      })
    } catch (error) {
      throw new Error('YAML序列化失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  static extractTranslatableItems(data: any, parentPath: string = ''): YAMLStructureItem[] {
    const items: YAMLStructureItem[] = []

    const traverse = (obj: any, path: string) => {
      if (typeof obj === 'string' && obj.trim().length > 0) {
        // Check if string contains translatable content (not just URLs, numbers, etc.)
        if (this.isTranslatableString(obj)) {
          items.push({
            key: path.split('.').pop() || '',
            value: obj,
            path,
            isTranslatable: true
          })
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          traverse(item, path ? `${path}.${index}` : `${index}`)
        })
      } else if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          const newPath = path ? `${path}.${key}` : key
          traverse(obj[key], newPath)
        })
      }
    }

    traverse(data, parentPath)
    return items
  }

  static isTranslatableString(str: string): boolean {
    // Skip if it's likely a URL
    if (str.match(/^https?:\/\//) || str.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      return false
    }

    // Skip if it's likely a file path
    if (str.match(/^[/.][a-zA-Z0-9_-]+(\.[a-zA-Z0-9]+)*$/)) {
      return false
    }

    // Skip if it's just numbers or special characters
    if (str.match(/^[0-9\s\-_+.()]*$/)) {
      return false
    }

    // Skip if it's likely a code identifier
    if (str.match(/^[A-Z_][A-Z0-9_]*$/) && str.length < 30) {
      return false
    }

    // Skip if it's a version number
    if (str.match(/^\d+\.\d+(\.\d+)?(-[a-zA-Z0-9]+)?$/)) {
      return false
    }

    // Consider it translatable if it contains letters and reasonable length
    return str.match(/[a-zA-Z\u4e00-\u9fff]/) !== null && str.length >= 2
  }

  static updateValue(data: any, path: string, newValue: string): any {
    const pathParts = path.split('.')
    const clonedData = JSON.parse(JSON.stringify(data))
    
    let current = clonedData
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i]
      if (Array.isArray(current)) {
        current = current[parseInt(part)]
      } else {
        current = current[part]
      }
    }

    const lastPart = pathParts[pathParts.length - 1]
    if (Array.isArray(current)) {
      current[parseInt(lastPart)] = newValue
    } else {
      current[lastPart] = newValue
    }

    return clonedData
  }

  static validateYAMLContent(content: string): { isValid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
      return { isValid: false, error: 'YAML内容为空' }
    }

    try {
      yaml.load(content)
      return { isValid: true }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : '格式错误'
      }
    }
  }

  static getTranslatableCount(structure: YAMLStructureItem[]): number {
    return structure.filter(item => item.isTranslatable).length
  }

  static estimateTranslationTime(structure: YAMLStructureItem[]): number {
    const translatableItems = this.getTranslatableCount(structure)
    // Estimate 2-5 seconds per item based on content length
    const baseTime = translatableItems * 3
    return Math.max(baseTime, 10) // Minimum 10 seconds
  }
}