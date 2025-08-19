"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  X,
  FileText,
  Search,
  Download,
  Share,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react"

export function SourcePreviewModal({ source, isOpen, onClose, onDelete, onUpdate }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("content")

  if (!isOpen || !source) return null

  // Simulate extracted content based on file type
  const getExtractedContent = (source) => {
    if (source.content) return source.content

    // Simulate different content types
    switch (source.type) {
      case "application/pdf":
        return `# ${source.name.replace(".pdf", "")}

This is a simulated PDF content extraction. In a real implementation, this would contain the actual text extracted from the PDF file using libraries like PDF.js or similar.

## Key Points:
- Document processing and text extraction
- Metadata parsing and indexing
- Content chunking for RAG processing
- Search and retrieval optimization

The content would be properly formatted and structured for optimal AI processing and retrieval.`

      case "text/plain":
      case "text/markdown":
        return (
          source.content ||
          `# ${source.name}

This is simulated text content. In a real implementation, this would show the actual file contents that have been processed and indexed for search and retrieval.

The text would be chunked into appropriate segments for vector embedding and semantic search capabilities.`
        )

      case "url":
        return `# Web Content: ${source.name}

This is simulated web content extracted from the URL. In a real implementation, this would contain:

- Cleaned HTML content
- Main article text
- Metadata and structured data
- Images and media references

The content would be processed to remove navigation, ads, and other non-essential elements.`

      default:
        return `# ${source.name}

Content extraction in progress or not available for this file type.

Supported processing:
- Text extraction from documents
- Web content scraping
- Audio transcription
- Video subtitle extraction`
    }
  }

  const extractedContent = getExtractedContent(source)
  const contentChunks = extractedContent.split("\n\n").filter((chunk) => chunk.trim())

  // Filter content based on search
  const filteredChunks = searchQuery
    ? contentChunks.filter((chunk) => chunk.toLowerCase().includes(searchQuery.toLowerCase()))
    : contentChunks

  const getStatusInfo = (status) => {
    switch (status) {
      case "processed":
        return { icon: CheckCircle, color: "text-green-400", text: "Ready for chat" }
      case "processing":
        return { icon: Loader2, color: "text-blue-400", text: "Processing content..." }
      case "error":
        return { icon: AlertCircle, color: "text-red-400", text: "Processing failed" }
      default:
        return { icon: Clock, color: "text-yellow-400", text: "Queued for processing" }
    }
  }

  const statusInfo = getStatusInfo(source.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <Card className="relative w-full max-w-4xl h-[90vh] bg-gray-900 border-gray-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-white" />
            <div>
              <h2 className="text-white font-medium">{source.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusIcon
                  className={`h-4 w-4 ${statusInfo.color} ${source.status === "processing" ? "animate-spin" : ""}`}
                />
                <span className={`text-sm ${statusInfo.color}`}>{statusInfo.text}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDelete(source.id)
                onClose()
              }}
              className="text-red-400 hover:bg-red-400/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-transparent border-b border-gray-700 rounded-none">
              <TabsTrigger value="content" className="text-white data-[state=active]:bg-white/10">
                Content
              </TabsTrigger>
              <TabsTrigger value="metadata" className="text-white data-[state=active]:bg-white/10">
                Metadata
              </TabsTrigger>
              <TabsTrigger value="chunks" className="text-white data-[state=active]:bg-white/10">
                Chunks ({contentChunks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="flex-1 overflow-hidden p-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search within this source..."
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-white/90 font-sans">
                    {searchQuery ? (
                      filteredChunks.length > 0 ? (
                        filteredChunks.map((chunk, index) => (
                          <div key={index} className="mb-4 p-3 bg-white/5 rounded border-l-2 border-blue-400">
                            {chunk.split(new RegExp(`(${searchQuery})`, "gi")).map((part, i) =>
                              part.toLowerCase() === searchQuery.toLowerCase() ? (
                                <mark key={i} className="bg-yellow-400 text-black">
                                  {part}
                                </mark>
                              ) : (
                                part
                              ),
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-white/60">No matches found for "{searchQuery}"</div>
                      )
                    ) : (
                      extractedContent
                    )}
                  </pre>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="metadata" className="flex-1 overflow-hidden p-6">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm">File Name</label>
                      <p className="text-white">{source.name}</p>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm">File Type</label>
                      <p className="text-white">{source.type}</p>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm">File Size</label>
                      <p className="text-white">{(source.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm">Upload Date</label>
                      <p className="text-white">{source.uploadedAt?.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm">Status</label>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                        <span className="text-white">{source.status}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm">Word Count</label>
                      <p className="text-white">{extractedContent.split(" ").length} words</p>
                    </div>
                  </div>

                  {source.metadata && (
                    <div className="mt-6">
                      <h4 className="text-white font-medium mb-3">Additional Metadata</h4>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <pre className="text-sm text-white/90">{JSON.stringify(source.metadata, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="chunks" className="flex-1 overflow-hidden p-6">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {contentChunks.map((chunk, index) => (
                    <Card key={index} className="bg-white/5 border-white/10 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          Chunk {index + 1}
                        </Badge>
                        <span className="text-white/40 text-xs">{chunk.split(" ").length} words</span>
                      </div>
                      <p className="text-white/90 text-sm line-clamp-3">{chunk.substring(0, 200)}...</p>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}
