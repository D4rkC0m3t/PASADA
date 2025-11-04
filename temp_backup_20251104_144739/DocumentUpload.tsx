'use client'

import { useState, useRef } from 'react'
import {
  Upload, File, FileText, Image as ImageIcon, X, CheckCircle, AlertCircle,
  Loader2, Download, Trash2, Eye
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Document {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploaded_at: string
  category: string
}

interface DocumentUploadProps {
  projectId: string
  onUploadComplete?: () => void
}

export default function DocumentUpload({ projectId, onUploadComplete }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('general')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createBrowserClient()

  const categories = [
    { value: 'general', label: 'General', icon: File },
    { value: 'contract', label: 'Contracts', icon: FileText },
    { value: 'invoice', label: 'Invoices', icon: FileText },
    { value: 'design', label: 'Design Files', icon: ImageIcon },
    { value: 'photo', label: 'Photos', icon: ImageIcon },
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    uploadFiles(Array.from(files))
  }

  const uploadFiles = async (files: File[]) => {
    setUploading(true)
    setUploadProgress(0)
    
    try {
      // TODO: Implement Supabase Storage upload
      // For now, simulating upload
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 20) {
          setUploadProgress(progress)
          await new Promise(resolve => setTimeout(resolve, 200))
        }

        // Create mock document entry
        const newDoc: Document = {
          id: `doc-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file), // Temporary URL
          uploaded_at: new Date().toISOString(),
          category: selectedCategory
        }

        setDocuments(prev => [newDoc, ...prev])
      }

      showMessage('success', `${files.length} file(s) uploaded successfully`)
      onUploadComplete?.()
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      showMessage('error', 'Failed to upload files')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) {
      uploadFiles(files)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const deleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      // TODO: Delete from Supabase Storage and database
      setDocuments(prev => prev.filter(doc => doc.id !== id))
      showMessage('success', 'Document deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      showMessage('error', 'Failed to delete document')
    }
  }

  const downloadDocument = (doc: Document) => {
    // Create temporary link and trigger download
    const link = document.createElement('a')
    link.href = doc.url
    link.download = doc.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon
    if (type.includes('pdf')) return FileText
    return File
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  return (
    <div className="space-y-6">
      {/* Message Banner */}
      {message && (
        <div className={`p-4 rounded-lg border flex items-start space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-600/10 border-green-600/20 text-green-600'
            : 'bg-red-600/10 border-red-600/20 text-red-600'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* Category Selector */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-3">
          Document Category
        </label>
        <div className="grid grid-cols-5 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-yellow-600/10 border-yellow-600 text-yellow-600'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-zinc-800 rounded-xl p-12 text-center hover:border-yellow-600 transition-all bg-zinc-900/50"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        
        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-yellow-600 mx-auto animate-spin" />
            <div>
              <p className="text-white font-medium mb-2">Uploading...</p>
              <div className="w-64 h-2 bg-zinc-800 rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-yellow-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-zinc-400 text-sm mt-2">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-zinc-400 text-sm mb-4">
              Support for PDF, Word, Excel, Images (Max 10MB per file)
            </p>
            <label
              htmlFor="file-upload"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              <span>Choose Files</span>
            </label>
          </>
        )}
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Uploaded Documents ({documents.length})
          </h3>
          <div className="space-y-3">
            {documents.map((doc) => {
              const FileIcon = getFileIcon(doc.type)
              return (
                <div
                  key={doc.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileIcon className="w-6 h-6 text-zinc-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate mb-1">
                          {doc.name}
                        </h4>
                        <div className="flex items-center space-x-3 text-sm text-zinc-400">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span className="capitalize">{doc.category}</span>
                          <span>•</span>
                          <span>
                            {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => window.open(doc.url, '_blank')}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                        title="View"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => downloadDocument(doc)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-600/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && !uploading && (
        <div className="text-center py-8 text-zinc-500">
          <File className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
          <p>No documents uploaded yet for this project</p>
        </div>
      )}
    </div>
  )
}
