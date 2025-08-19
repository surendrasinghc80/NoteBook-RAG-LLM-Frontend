"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  MessageSquare,
  Send,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  User,
  Bot,
  FileText,
  ExternalLink,
  Search,
  Zap,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RAGService } from "@/lib/rag-service"

const TypingIndicator = ({ stage = "thinking" }) => {
  const stages = {
    thinking: "Analyzing your question...",
    searching: "Searching through your sources...",
    generating: "Generating response...",
  }

  return (
    <div className="flex items-center gap-2 p-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-blue-600 text-white">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-white/60 text-sm">{stages[stage]}</span>
        {stage === "searching" && <Search className="h-4 w-4 text-blue-400 animate-pulse" />}
        {stage === "generating" && <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />}
      </div>
    </div>
  )
}

const MessageBubble = ({ message, onCopy, onRegenerate, onFeedback }) => {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3 p-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-blue-600 text-white">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("max-w-[80%] space-y-2", isUser && "order-first")}>
        <Card
          className={cn("p-4", isUser ? "bg-blue-600 text-white ml-auto" : "bg-white/10 border-white/20 text-white")}
        >
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* RAG Context Info */}
          {message.ragInfo && !isUser && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-3 w-3 text-white/60" />
                <span className="text-xs text-white/60">
                  Found {message.ragInfo.usedChunks} relevant passages from {message.ragInfo.sources.length} source
                  {message.ragInfo.sources.length !== 1 ? "s" : ""}
                </span>
                {message.ragInfo.confidence && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(message.ragInfo.confidence * 100)}% confidence
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Source Citations */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs text-white/60 mb-2">Sources:</p>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((source, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-white/20 text-white hover:bg-white/30 cursor-pointer"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    {source.name}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Message Actions */}
        {!isUser && (
          <div className="flex items-center gap-2 px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(message.content)}
              className="h-6 px-2 text-white/60 hover:text-white hover:bg-white/10"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRegenerate(message.id)}
              className="h-6 px-2 text-white/60 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback(message.id, "up")}
              className="h-6 px-2 text-white/60 hover:text-white hover:bg-white/10"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback(message.id, "down")}
              className="h-6 px-2 text-white/60 hover:text-white hover:bg-white/10"
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-gray-600 text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

export function ChatInterface({ sources, onSendMessage }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingStage, setTypingStage] = useState("thinking")
  const [ragService, setRagService] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Initialize RAG service when sources change
  useEffect(() => {
    const processedSources = sources.filter((source) => source.status === "processed")
    const newRagService = new RAGService(processedSources)
    setRagService(newRagService)
  }, [sources])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!inputValue.trim() || sources.length === 0 || !ragService) return

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentQuery = inputValue
    setInputValue("")
    setIsTyping(true)
    setTypingStage("thinking")

    try {
      // Simulate RAG pipeline stages
      setTimeout(() => setTypingStage("searching"), 800)

      setTimeout(async () => {
        setTypingStage("generating")

        // Get context from RAG service
        const context = ragService.getContext(currentQuery)

        // Generate response
        const response = await ragService.generateResponse(currentQuery, context)

        const aiMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
          sources: response.sources,
          ragInfo: {
            usedChunks: response.usedChunks,
            confidence: response.confidence,
            sources: response.sources,
          },
        }

        setMessages((prev) => [...prev, aiMessage])
        setIsTyping(false)
      }, 1600)
    } catch (error) {
      console.error("Error generating response:", error)

      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "I apologize, but I encountered an error while processing your question. Please try again or rephrase your question.",
        timestamp: new Date(),
        sources: [],
        error: true,
      }

      setMessages((prev) => [...prev, errorMessage])
      setIsTyping(false)
    }

    // Call parent handler if provided
    if (onSendMessage) {
      onSendMessage(currentQuery)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content)
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  const handleRegenerate = async (messageId) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId)
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1]
      setIsTyping(true)
      setTypingStage("thinking")

      setTimeout(() => setTypingStage("searching"), 500)

      setTimeout(async () => {
        setTypingStage("generating")

        if (ragService) {
          const context = ragService.getContext(userMessage.content)
          const response = await ragService.generateResponse(userMessage.content, context)

          const newAiMessage = {
            id: Date.now(),
            role: "assistant",
            content: response.content,
            timestamp: new Date(),
            sources: response.sources,
            ragInfo: {
              usedChunks: response.usedChunks,
              confidence: response.confidence,
              sources: response.sources,
            },
          }

          setMessages((prev) => {
            const newMessages = [...prev]
            newMessages[messageIndex] = newAiMessage
            return newMessages
          })
        }

        setIsTyping(false)
      }, 1200)
    }
  }

  const handleFeedback = (messageId, type) => {
    // Handle thumbs up/down feedback
    console.log(`Feedback for message ${messageId}: ${type}`)
    // Could send to analytics or improve model
  }

  const hasMessages = messages.length > 0
  const canSendMessage = sources.length > 0 && inputValue.trim() && !isTyping
  const processedSources = sources.filter((s) => s.status === "processed")
  const ragStats = ragService?.getStats()

  return (
    <div className="flex-1 bg-black/10 backdrop-blur-sm flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-medium">Chat</h2>
          <div className="flex items-center gap-2">
            {processedSources.length > 0 && ragStats && (
              <Badge variant="secondary" className="text-xs">
                {ragStats.totalChunks} chunks ready
              </Badge>
            )}
            {sources.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {processedSources.length}/{sources.length} sources processed
              </Badge>
            )}
          </div>
        </div>
        {processedSources.length > 0 && ragStats && (
          <p className="text-white/40 text-xs mt-1">RAG system ready • {ragStats.avgChunkSize} avg words per chunk</p>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages && sources.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-white text-lg mb-2">Add sources to get started</h3>
              <p className="text-white/60 text-sm mb-4">
                Upload documents, add websites, or paste text to begin chatting with your content using RAG.
              </p>
            </div>
          </div>
        ) : !hasMessages && processedSources.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-white text-lg mb-2">Sources are processing</h3>
              <p className="text-white/60 text-sm mb-4">
                Please wait while your sources are being processed for chat. This usually takes a few moments.
              </p>
              <div className="flex justify-center">
                <Progress value={(processedSources.length / sources.length) * 100} className="w-48 h-2" />
              </div>
            </div>
          </div>
        ) : !hasMessages ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Bot className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-white text-lg mb-2">Ready to chat with your sources!</h3>
              <p className="text-white/60 text-sm mb-4">
                Ask questions about your {processedSources.length} processed source
                {processedSources.length !== 1 ? "s" : ""}. I'll search through your content and provide contextual
                answers.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue("What are the main topics covered in my sources?")}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Summarize main topics
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue("What are the key insights from my documents?")}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Find key insights
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue("How do my sources relate to each other?")}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Find connections
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={handleCopy}
                onRegenerate={handleRegenerate}
                onFeedback={handleFeedback}
              />
            ))}
            {isTyping && <TypingIndicator stage={typingStage} />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                processedSources.length === 0
                  ? "Upload and process sources to get started"
                  : "Ask questions about your sources..."
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 resize-none min-h-[44px] max-h-32"
              disabled={processedSources.length === 0}
              rows={1}
              style={{
                height: "auto",
                minHeight: "44px",
              }}
              onInput={(e) => {
                e.target.style.height = "auto"
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px"
              }}
            />
          </div>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!canSendMessage}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 h-11 px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-white/40 text-xs mt-2 text-center">
          RAG-powered responses based on your sources • NotebookLM can be inaccurate, please double-check responses.
        </p>
      </div>
    </div>
  )
}
