"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api-service";
import ReactMarkdown from "react-markdown";
import CodeBlock from "@/components/CodeBlock";

const TypingIndicator = ({ stage = "thinking" }) => {
  const stages = {
    thinking: "Analyzing your question...",
    searching: "Searching through your sources...",
    generating: "Generating response...",
  };

  return (
    <div className="flex items-center gap-2 p-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-blue-600 text-white">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <div
            className="w-2 h-2 bg-white/40 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-white/40 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-white/40 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <span className="text-white/60 text-sm">{stages[stage]}</span>
        {stage === "searching" && (
          <Search className="h-4 w-4 text-blue-400 animate-pulse" />
        )}
        {stage === "generating" && (
          <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
        )}
      </div>
    </div>
  );
};

const MessageBubble = ({ message, onCopy, onRegenerate, onFeedback }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex gap-3 p-4", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-blue-600 text-white">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("max-w-[80%] space-y-2", isUser && "order-first")}>
        <Card
          className={cn(
            "p-4",
            isUser
              ? "bg-blue-600 text-white ml-auto"
              : "bg-white/10 border-white/20 text-white"
          )}
        >
          <div className="prose prose-sm max-w-none prose-invert">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <CodeBlock
                      language={match[1]}
                      value={String(children).replace(/\n$/, "")}
                    />
                  ) : (
                    <code
                      className={cn(
                        "bg-zinc-800 px-1 py-0.5 rounded text-sm",
                        className
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => (
                  <p className="whitespace-pre-wrap">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-white/90">{children}</em>
                ),
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold text-white mb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold text-white mb-2">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-medium text-white mb-1">
                    {children}
                  </h3>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-white/90 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-white/90 space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-white/90">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-400 pl-4 italic text-white/80">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* RAG Context Info */}
          {message.ragInfo && !isUser && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-3 w-3 text-white/60" />
                <span className="text-xs text-white/60">
                  Found {message.ragInfo.usedChunks} relevant passages from{" "}
                  {message.ragInfo.sources.length} source
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
  );
};

export function ChatInterface({ sources, onSendMessage }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingStage, setTypingStage] = useState("thinking");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    const processedSources = sources.filter(
      (source) => source.status === "processed"
    );
    if (!inputValue.trim() || processedSources.length === 0) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = inputValue;
    setInputValue("");
    setIsTyping(true);
    setTypingStage("thinking");

    try {
      // Show searching stage
      setTimeout(() => setTypingStage("searching"), 500);

      // Show generating stage and make API call
      setTimeout(async () => {
        setTypingStage("generating");

        try {
          // Call the smart chat routing API
          const response = await apiService.smartChat(
            currentQuery,
            processedSources
          );

          // Handle different response formats from different APIs
          let content = "";
          let sources = [];
          let usedChunks = 0;

          if (response.answer) {
            // Standard chat response format
            content = response.answer;
            sources = response.sources || [];
            usedChunks = response.usedChunks || 0;
          } else if (response.preview && response.totalChunks) {
            // URL docs response format - filter and format meaningful content
            const meaningfulChunks = response.preview.filter((chunk) => {
              const preview = chunk.preview.toLowerCase();
              // Filter out JavaScript code, CSS, and HTML artifacts
              return (
                !preview.includes("function ") &&
                !preview.includes("const ") &&
                !preview.includes("document.querySelector") &&
                !preview.includes("addEventListener") &&
                !preview.includes("typeof localStorage") &&
                !preview.includes("class s extends HTMLElement") &&
                !preview.includes("matchMedia") &&
                !preview.includes("scrollTop") &&
                !preview.includes("getElementById") &&
                preview.length > 50 && // Ensure chunk has meaningful length
                !/^[^a-zA-Z]*$/.test(preview.slice(0, 20))
              ); // Not just symbols/code
            });

            if (meaningfulChunks.length > 0) {
              content = `Here's what I found from your web sources:\n\n`;
              meaningfulChunks.slice(0, 5).forEach((chunk, index) => {
                // Clean up the content
                let cleanContent = chunk.preview
                  .replace(/\s+/g, " ") // Replace multiple spaces with single space
                  .replace(/\t/g, " ") // Replace tabs with spaces
                  .trim();

                // Truncate if too long
                if (cleanContent.length > 200) {
                  cleanContent = cleanContent.substring(0, 200) + "...";
                }

                content += `📄 **${
                  chunk.metadata.title || "Web Content"
                }**\n${cleanContent}\n\n`;
              });

              if (meaningfulChunks.length > 5) {
                content += `_And ${
                  meaningfulChunks.length - 5
                } more relevant sections..._`;
              }
            } else {
              content = `Found ${response.totalChunks} chunks from your web sources, but they appear to contain mostly technical code. Try asking a more specific question about the content.`;
            }

            sources = response.preview.map((chunk) => ({
              name: chunk.metadata.title || "Web Content",
              type: "url",
            }));
            usedChunks = meaningfulChunks.length;
          } else if (response.message) {
            // Generic message response
            content = response.message;
          } else {
            content =
              "I received your message but couldn't generate a proper response.";
          }

          const aiMessage = {
            id: Date.now() + 1,
            role: "assistant",
            content: content,
            timestamp: new Date(),
            sources: sources,
            ragInfo: {
              usedChunks: usedChunks,
              confidence: response.confidence || 0.8,
              sources: sources,
            },
          };

          setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
          console.error("Error generating response:", error);

          const errorMessage = {
            id: Date.now() + 1,
            role: "assistant",
            content: `I apologize, but I encountered an error while processing your question: ${error.message}. Please make sure your backend server is running and try again.`,
            timestamp: new Date(),
            sources: [],
            error: true,
          };

          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Error in handleSend:", error);
      setIsTyping(false);
    }

    // Call parent handler if provided
    if (onSendMessage) {
      onSendMessage(currentQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleRegenerate = async (messageId) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1];
      setIsTyping(true);
      setTypingStage("thinking");

      setTimeout(() => setTypingStage("searching"), 500);

      setTimeout(async () => {
        setTypingStage("generating");

        try {
          const response = await apiService.smartChat(
            userMessage.content,
            processedSources
          );

          // Handle different response formats from different APIs
          let content = "";
          let sources = [];
          let usedChunks = 0;

          if (response.answer) {
            // Standard chat response format
            content = response.answer;
            sources = response.sources || [];
            usedChunks = response.usedChunks || 0;
          } else if (response.preview && response.totalChunks) {
            // URL docs response format - filter and format meaningful content
            const meaningfulChunks = response.preview.filter((chunk) => {
              const preview = chunk.preview.toLowerCase();
              // Filter out JavaScript code, CSS, and HTML artifacts
              return (
                !preview.includes("function ") &&
                !preview.includes("const ") &&
                !preview.includes("document.querySelector") &&
                !preview.includes("addEventListener") &&
                !preview.includes("typeof localStorage") &&
                !preview.includes("class s extends HTMLElement") &&
                !preview.includes("matchMedia") &&
                !preview.includes("scrollTop") &&
                !preview.includes("getElementById") &&
                preview.length > 50 && // Ensure chunk has meaningful length
                !/^[^a-zA-Z]*$/.test(preview.slice(0, 20))
              ); // Not just symbols/code
            });

            if (meaningfulChunks.length > 0) {
              content = `Here's what I found from your web sources:\n\n`;
              meaningfulChunks.slice(0, 5).forEach((chunk, index) => {
                // Clean up the content
                let cleanContent = chunk.preview
                  .replace(/\s+/g, " ") // Replace multiple spaces with single space
                  .replace(/\t/g, " ") // Replace tabs with spaces
                  .trim();

                // Truncate if too long
                if (cleanContent.length > 200) {
                  cleanContent = cleanContent.substring(0, 200) + "...";
                }

                content += `📄 **${
                  chunk.metadata.title || "Web Content"
                }**\n${cleanContent}\n\n`;
              });

              if (meaningfulChunks.length > 5) {
                content += `_And ${
                  meaningfulChunks.length - 5
                } more relevant sections..._`;
              }
            } else {
              content = `Found ${response.totalChunks} chunks from your web sources, but they appear to contain mostly technical code. Try asking a more specific question about the content.`;
            }

            sources = response.preview.map((chunk) => ({
              name: chunk.metadata.title || "Web Content",
              type: "url",
            }));
            usedChunks = meaningfulChunks.length;
          } else if (response.message) {
            // Generic message response
            content = response.message;
          } else {
            content = "I couldn't generate a proper response.";
          }

          const newAiMessage = {
            id: Date.now(),
            role: "assistant",
            content: content,
            timestamp: new Date(),
            sources: sources,
            ragInfo: {
              usedChunks: usedChunks,
              confidence: response.confidence || 0.8,
              sources: sources,
            },
          };

          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[messageIndex] = newAiMessage;
            return newMessages;
          });
        } catch (error) {
          console.error("Error regenerating response:", error);

          const errorMessage = {
            id: Date.now(),
            role: "assistant",
            content: `Error regenerating response: ${error.message}`,
            timestamp: new Date(),
            sources: [],
            error: true,
          };

          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[messageIndex] = errorMessage;
            return newMessages;
          });
        } finally {
          setIsTyping(false);
        }
      }, 1200);
    }
  };

  const handleFeedback = (messageId, type) => {
    // Handle thumbs up/down feedback
    console.log(`Feedback for message ${messageId}: ${type}`);
    // Could send to analytics or improve model
  };

  const hasMessages = messages.length > 0;
  const processedSources = sources.filter((s) => s.status === "processed");
  const canSendMessage =
    processedSources.length > 0 && inputValue.trim() && !isTyping;

  // Calculate simple stats for processed sources
  const ragStats =
    processedSources.length > 0
      ? {
          totalChunks: processedSources.length * 5, // Estimate
          avgChunkSize: 150, // Estimate
        }
      : null;

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
          <p className="text-white/40 text-xs mt-1">
            RAG system ready • {ragStats.avgChunkSize} avg words per chunk
          </p>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages && sources.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-white text-lg mb-2">
                Add sources to get started
              </h3>
              <p className="text-white/60 text-sm mb-4">
                Upload documents, add websites, or paste text to begin chatting
                with your content using RAG.
              </p>
            </div>
          </div>
        ) : !hasMessages && processedSources.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-white text-lg mb-2">
                Sources are processing
              </h3>
              <p className="text-white/60 text-sm mb-4">
                Please wait while your sources are being processed for chat.
                This usually takes a few moments.
              </p>
              <div className="flex justify-center">
                <Progress
                  value={(processedSources.length / sources.length) * 100}
                  className="w-48 h-2"
                />
              </div>
            </div>
          </div>
        ) : !hasMessages ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Bot className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-white text-lg mb-2">
                Ready to chat with your sources!
              </h3>
              <p className="text-white/60 text-sm mb-4">
                Ask questions about your {processedSources.length} processed
                source
                {processedSources.length !== 1 ? "s" : ""}. I'll search through
                your content and provide contextual answers.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setInputValue(
                      "What are the main topics covered in my sources?"
                    )
                  }
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Summarize main topics
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setInputValue(
                      "What are the key insights from my documents?"
                    )
                  }
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Find key insights
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setInputValue("How do my sources relate to each other?")
                  }
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
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 128) + "px";
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
          RAG-powered responses based on your sources • NotebookLM can be
          inaccurate, please double-check responses.
        </p>
      </div>
    </div>
  );
}
