"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart3,
  FileText,
  Brain,
  Video,
  Music,
  Download,
  Play,
  Share,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  BookOpen,
  Map,
  TrendingUp,
} from "lucide-react"

const StudioItem = ({
  icon: Icon,
  title,
  description,
  status,
  progress,
  onGenerate,
  onPlay,
  onDownload,
  onDelete,
  generatedAt,
  duration,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-400"
      case "generating":
        return "text-blue-400"
      case "error":
        return "text-red-400"
      default:
        return "text-white/60"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return CheckCircle
      case "generating":
        return Loader2
      case "error":
        return AlertCircle
      default:
        return Icon
    }
  }

  const StatusIcon = getStatusIcon(status)

  return (
    <Card className="bg-white/10 border-white/20 p-4 hover:bg-white/15 transition-colors">
      <div className="flex items-start gap-3">
        <StatusIcon
          className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getStatusColor(status)} ${status === "generating" ? "animate-spin" : ""}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-medium">{title}</h4>
            {status === "completed" && (
              <div className="flex items-center gap-1">
                {onPlay && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPlay}
                    className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                )}
                {onDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDownload}
                    className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Share className="h-3 w-3" />
                </Button>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="h-6 w-6 p-0 text-white/60 hover:text-red-400 hover:bg-white/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <p className="text-white/60 text-sm mb-3">{description}</p>

          {status === "generating" && progress !== undefined && (
            <div className="mb-3">
              <Progress value={progress} className="h-2" />
              <p className="text-white/40 text-xs mt-1">{progress}% complete</p>
            </div>
          )}

          {status === "completed" && generatedAt && (
            <div className="flex items-center gap-4 text-xs text-white/40">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Generated {generatedAt.toLocaleDateString()}</span>
              </div>
              {duration && (
                <div className="flex items-center gap-1">
                  <Music className="h-3 w-3" />
                  <span>{duration}</span>
                </div>
              )}
            </div>
          )}

          {status === "idle" && (
            <Button onClick={onGenerate} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              Generate {title}
            </Button>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-xs">Generation failed</span>
              <Button
                onClick={onGenerate}
                size="sm"
                variant="outline"
                className="h-6 text-xs border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export function StudioPanel({ sources }) {
  const [studioItems, setStudioItems] = useState({
    audioOverview: {
      status: "idle",
      progress: 0,
      generatedAt: null,
      duration: null,
    },
    videoOverview: {
      status: "idle",
      progress: 0,
      generatedAt: null,
      duration: null,
    },
    mindMap: {
      status: "idle",
      progress: 0,
      generatedAt: null,
    },
    studyGuide: {
      status: "idle",
      progress: 0,
      generatedAt: null,
    },
    reports: {
      status: "idle",
      progress: 0,
      generatedAt: null,
    },
    timeline: {
      status: "idle",
      progress: 0,
      generatedAt: null,
    },
  })

  const [generatedContent, setGeneratedContent] = useState([])

  const handleGenerate = (itemType) => {
    if (sources.length === 0) return

    setStudioItems((prev) => ({
      ...prev,
      [itemType]: { ...prev[itemType], status: "generating", progress: 0 },
    }))

    // Simulate generation progress
    const interval = setInterval(() => {
      setStudioItems((prev) => {
        const currentProgress = prev[itemType].progress
        if (currentProgress >= 100) {
          clearInterval(interval)

          // Add to generated content
          const newContent = {
            id: Date.now(),
            type: itemType,
            title: getItemTitle(itemType),
            generatedAt: new Date(),
            duration: itemType.includes("audio") || itemType.includes("video") ? "5:23" : null,
          }

          setGeneratedContent((prev) => [newContent, ...prev])

          return {
            ...prev,
            [itemType]: {
              ...prev[itemType],
              status: "completed",
              progress: 100,
              generatedAt: new Date(),
              duration: newContent.duration,
            },
          }
        }

        return {
          ...prev,
          [itemType]: { ...prev[itemType], progress: currentProgress + 10 },
        }
      })
    }, 300)
  }

  const getItemTitle = (itemType) => {
    const titles = {
      audioOverview: "Audio Overview",
      videoOverview: "Video Overview",
      mindMap: "Mind Map",
      studyGuide: "Study Guide",
      reports: "Analysis Report",
      timeline: "Timeline",
    }
    return titles[itemType] || itemType
  }

  const handlePlay = (itemType) => {
    console.log(`Playing ${itemType}`)
  }

  const handleDownload = (itemType) => {
    console.log(`Downloading ${itemType}`)
  }

  const handleDelete = (itemType) => {
    setStudioItems((prev) => ({
      ...prev,
      [itemType]: { status: "idle", progress: 0, generatedAt: null, duration: null },
    }))
    setGeneratedContent((prev) => prev.filter((item) => item.type !== itemType))
  }

  const hasGeneratedContent = generatedContent.length > 0
  const canGenerate = sources.length > 0

  return (
    <div className="w-80 border-l border-white/10 bg-black/20 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-medium">Studio</h2>
          {canGenerate && (
            <Badge variant="secondary" className="text-xs">
              {sources.length} source{sources.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <p className="text-white/60 text-xs">Generate insights and summaries from your sources</p>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="generate" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-white/10 rounded-none">
            <TabsTrigger value="generate" className="text-white data-[state=active]:bg-white/10">
              Generate
            </TabsTrigger>
            <TabsTrigger value="library" className="text-white data-[state=active]:bg-white/10">
              Library ({generatedContent.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="flex-1 overflow-y-auto p-4 space-y-4">
            <StudioItem
              icon={Music}
              title="Audio Overview"
              description="Generate a podcast-style discussion about your sources"
              status={studioItems.audioOverview.status}
              progress={studioItems.audioOverview.progress}
              onGenerate={() => handleGenerate("audioOverview")}
              onPlay={() => handlePlay("audioOverview")}
              onDownload={() => handleDownload("audioOverview")}
              onDelete={() => handleDelete("audioOverview")}
              generatedAt={studioItems.audioOverview.generatedAt}
              duration={studioItems.audioOverview.duration}
            />

            <StudioItem
              icon={Video}
              title="Video Overview"
              description="Create a video summary with visual elements"
              status={studioItems.videoOverview.status}
              progress={studioItems.videoOverview.progress}
              onGenerate={() => handleGenerate("videoOverview")}
              onPlay={() => handlePlay("videoOverview")}
              onDownload={() => handleDownload("videoOverview")}
              onDelete={() => handleDelete("videoOverview")}
              generatedAt={studioItems.videoOverview.generatedAt}
              duration={studioItems.videoOverview.duration}
            />

            <StudioItem
              icon={Brain}
              title="Mind Map"
              description="Visualize connections and relationships in your content"
              status={studioItems.mindMap.status}
              progress={studioItems.mindMap.progress}
              onGenerate={() => handleGenerate("mindMap")}
              onDownload={() => handleDownload("mindMap")}
              onDelete={() => handleDelete("mindMap")}
              generatedAt={studioItems.mindMap.generatedAt}
            />

            <StudioItem
              icon={BookOpen}
              title="Study Guide"
              description="Create structured notes and key takeaways"
              status={studioItems.studyGuide.status}
              progress={studioItems.studyGuide.progress}
              onGenerate={() => handleGenerate("studyGuide")}
              onDownload={() => handleDownload("studyGuide")}
              onDelete={() => handleDelete("studyGuide")}
              generatedAt={studioItems.studyGuide.generatedAt}
            />

            <StudioItem
              icon={BarChart3}
              title="Analysis Report"
              description="Generate detailed insights and analytics"
              status={studioItems.reports.status}
              progress={studioItems.reports.progress}
              onGenerate={() => handleGenerate("reports")}
              onDownload={() => handleDownload("reports")}
              onDelete={() => handleDelete("reports")}
              generatedAt={studioItems.reports.generatedAt}
            />

            <StudioItem
              icon={TrendingUp}
              title="Timeline"
              description="Create a chronological view of events and topics"
              status={studioItems.timeline.status}
              progress={studioItems.timeline.progress}
              onGenerate={() => handleGenerate("timeline")}
              onDownload={() => handleDownload("timeline")}
              onDelete={() => handleDelete("timeline")}
              generatedAt={studioItems.timeline.generatedAt}
            />

            {!canGenerate && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60 text-sm mb-2">Add sources to get started</p>
                <p className="text-white/40 text-xs">
                  Upload documents to generate audio overviews, study guides, mind maps and more!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="library" className="flex-1 overflow-y-auto">
            {hasGeneratedContent ? (
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {generatedContent.map((item) => (
                    <Card key={item.id} className="bg-white/10 border-white/20 p-3">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.type === "audioOverview" && <Music className="h-4 w-4 text-white" />}
                          {item.type === "videoOverview" && <Video className="h-4 w-4 text-white" />}
                          {item.type === "mindMap" && <Brain className="h-4 w-4 text-white" />}
                          {item.type === "studyGuide" && <BookOpen className="h-4 w-4 text-white" />}
                          {item.type === "reports" && <BarChart3 className="h-4 w-4 text-white" />}
                          {item.type === "timeline" && <TrendingUp className="h-4 w-4 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-white/40 text-xs">{item.generatedAt.toLocaleDateString()}</span>
                            {item.duration && (
                              <Badge variant="secondary" className="text-xs">
                                {item.duration}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {(item.type === "audioOverview" || item.type === "videoOverview") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                          >
                            <Share className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <Map className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 text-sm mb-2">No generated content yet</p>
                  <p className="text-white/40 text-xs">
                    Generated content will appear here for easy access and management.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
