import { create } from 'zustand'
import { YAMLStructureItem } from '@/lib/yaml-processor'

export interface UploadedFile {
  file: File
  content: string
  parsedData?: any
  structure?: YAMLStructureItem[]
  uploadedAt: Date
}

interface FileState {
  // File upload state
  uploadedFile: UploadedFile | null
  isUploading: boolean
  uploadError: string | null
  
  // Actions
  setUploadedFile: (file: UploadedFile) => void
  removeFile: () => void
  setUploading: (uploading: boolean) => void
  setUploadError: (error: string | null) => void
}

export const useFileStore = create<FileState>((set) => ({
  // Initial state
  uploadedFile: null,
  isUploading: false,
  uploadError: null,

  // Actions
  setUploadedFile: (file: UploadedFile) =>
    set({
      uploadedFile: file,
      isUploading: false,
      uploadError: null,
    }),

  removeFile: () =>
    set({
      uploadedFile: null,
      isUploading: false,
      uploadError: null,
    }),

  setUploading: (uploading: boolean) =>
    set({ isUploading: uploading }),

  setUploadError: (error: string | null) =>
    set({
      uploadError: error,
      isUploading: false,
    }),
}))