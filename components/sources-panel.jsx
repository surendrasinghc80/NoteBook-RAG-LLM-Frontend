"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, FileText, File, ImageIcon, Music, Video, Trash2, Eye, Upload } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { SourceSearch } from "./source-search"
import { SourcePreviewModal } from "./source-preview-modal"

const getFileIcon = (fileType) => {
  if (fileType.startsWith("image/")) return ImageIcon
  if (fileType.startsWith("audio/")) return Music
  if (fileType.startsWith("video/")) return Video
  if (fileType.includes("pdf")) return FileText
  return File
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function SourcesPanel({ sources, onAddSources, onDeleteSource, onShowAddModal }) {
  const [uploadProgress, setUploadProgress] = useState({})
  const [selectedSource, setSelectedSource] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        // Simulate upload and processing
        const fileId = Date.now() + Math.random()
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }))

        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            const currentProgress = prev[fileId] || 0
            if (currentProgress >= 100) {
              clearInterval(interval)

              // Simulate content extraction based on file type
              let extractedContent = ""
              if (file.type === "text/plain") {
                // For text files, we'd read the actual content
                extractedContent = "Sample text content extracted from file..."
              } else if (file.type.includes("pdf")) {
                extractedContent = "Sample PDF content extracted using PDF processing..."
              }

              // Add to sources after processing complete
              onAddSources([
                {
                  id: fileId,
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  uploadedAt: new Date(),
                  status: "processed",
                  content: extractedContent,
                  metadata: {
                    wordCount: extractedContent.split(" ").length,
                    processingTime: "2.3s",
                    chunks: Math.ceil(extractedContent.length / 500),
                  },
                },
              ])

              // Remove from progress tracking
              const newProgress = { ...prev }
              delete newProgress[fileId]
              return newProgress
            }
            return { ...prev, [fileId]: currentProgress + 10 }
          })
        }, 200)
      })
    },
    [onAddSources],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
      "audio/*": [".mp3", ".wav", ".m4a"],
      "video/*": [".mp4", ".mov", ".avi"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    multiple: true,
  })

  const handleSourceSelect = (source) => {
    setSelectedSource(source)
    setShowPreview(true)
  }

  const handleSourceUpdate = (updatedSource) => {
    // Handle source updates
    console.log("Updating source:", updatedSource)
  }

  const processingCount = sources.filter((s) => s.status === "processing").length
  const processedCount = sources.filter((s) => s.status === "processed").length
  const errorCount = sources.filter((s) => s.status === "error").length

  return (
    <>
      <div className="w-80 border-r border-white/10 bg-black/20 backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium">Sources</h2>
            <Button variant="ghost" size="sm" onClick={onShowAddModal} className="text-white hover:bg-white/10">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-transparent border border-white/20">
              <TabsTrigger value="all" className="text-white text-xs data-[state=active]:bg-white/10">
                All ({sources.length})
              </TabsTrigger>
              <TabsTrigger value="search" className="text-white text-xs data-[state=active]:bg-white/10">
                <Search className="h-3 w-3 mr-1" />
                Search
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="all" className="mt-0">
                <div className="flex-1 overflow-y-auto">
                  {/* Upload Progress */}
                  {Object.entries(uploadProgress).map(([fileId, progress]) => (
                    <div key={fileId} className="mb-3">
                      <Card className="bg-white/10 border-white/20 p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <Upload className="h-4 w-4 text-blue-400" />
                          <span className="text-white text-sm">Processing...</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-white/40 text-xs mt-1">{progress}% complete</p>
                      </Card>
                    </div>
                  ))}

                  {/* Status Summary */}
                  {sources.length > 0 && (
                    <div className="mb-4 flex gap-2">
                      {processedCount > 0 && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          {processedCount} ready
                        </Badge>
                      )}
                      {processingCount > 0 && (
                        <Badge variant="secondary" className="text-xs bg-blue-600">
                          {processingCount} processing
                        </Badge>
                      )}
                      {errorCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {errorCount} failed
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Sources List */}
                  {sources.length > 0 ? (
                    <div className="space-y-3">
                      {sources.map((source) => {
                        const IconComponent = getFileIcon(source.type)
                        return (
                          <Card
                            key={source.id}
                            className="bg-white/10 border-white/20 p-3 hover:bg-white/15 transition-colors cursor-pointer"
                            onClick={() => handleSourceSelect(source)}
                          >
                            <div className="flex items-start gap-3">
                              <IconComponent className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white text-sm font-medium truncate">{source.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant={source.status === "processed" ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {source.status}
                                  </Badge>
                                  <span className="text-white/40 text-xs">{formatFileSize(source.size)}</span>
                                </div>
                                <p className="text-white/40 text-xs mt-1">
                                  Added {source.uploadedAt.toLocaleDateString()}
                                </p>
                                {source.metadata && (
                                  <p className="text-white/40 text-xs">
                                    {source.metadata.wordCount} words • {source.metadata.chunks} chunks
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSourceSelect(source)
                                  }}
                                  className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteSource(source.id)
                                  }}
                                  className="h-6 w-6 p-0 text-white/60 hover:text-red-400 hover:bg-white/10"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col">
                      {/* Drop Zone */}
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          isDragActive ? "border-blue-400 bg-blue-400/10" : "border-white/20 hover:border-white/30"
                        }`}
                      >
                        <input {...getInputProps()} />
                        <Upload className="h-8 w-8 text-white/40 mx-auto mb-3" />
                        <p className="text-white/60 text-sm mb-2">
                          {isDragActive ? "Drop files here..." : "Drag & drop files here"}
                        </p>
                        <p className="text-white/40 text-xs">PDF, TXT, MD, Audio, Video, Images</p>
                      </div>

                      <div className="mt-6 text-center">
                        <FileText className="h-12 w-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60 text-sm mb-2">No sources yet</p>
                        <p className="text-white/40 text-xs">Add documents to start chatting with your content</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="search" className="mt-0">
                <SourceSearch
                  sources={sources}
                  onSourceSelect={handleSourceSelect}
                  onFilterChange={(filters) => console.log("Filters:", filters)}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Source Count */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Sources</span>
            <Badge variant="secondary">{sources.length}/50</Badge>
          </div>
        </div>
      </div>

      {/* Source Preview Modal */}
      <SourcePreviewModal
        source={selectedSource}
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false)
          setSelectedSource(null)
        }}
        onDelete={onDeleteSource}
        onUpdate={handleSourceUpdate}
      />
    </>
  )
}
