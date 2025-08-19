"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Share, Grid3X3, X, Brain, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SourcesPanel } from "@/components/sources-panel";
import { AddSourcesModal } from "@/components/add-sources-modal";
import { ChatInterface } from "@/components/chat-interface";
import { StudioPanel } from "@/components/studio-panel";

export default function NotebookLM() {
  const [showAddSources, setShowAddSources] = useState(false);
  const [sources, setSources] = useState([]);
  const { theme, setTheme } = useTheme();

  const handleAddSources = (newSources) => {
    setSources((prev) => [...prev, ...newSources]);
  };

  const handleDeleteSource = (sourceId) => {
    setSources((prev) => prev.filter((source) => source.id !== sourceId));
  };

  const handleSendMessage = (message) => {
    // Handle message sending logic here
    console.log("Sending message:", message);
  };

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url(/gradient-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="fixed inset-0 z-10 bg-black/60 dark:bg-black/80" />

      <div className="relative z-20 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-white" />
              <span className="text-white font-medium">Untitled notebook</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-white hover:bg-white/10"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Three-panel layout */}
        <div className="flex h-[calc(100vh-73px)]">
          {/* Sources Panel */}
          <SourcesPanel
            sources={sources}
            onAddSources={handleAddSources}
            onDeleteSource={handleDeleteSource}
            onShowAddModal={() => setShowAddSources(true)}
          />

          {/* Chat Panel */}
          <ChatInterface sources={sources} onSendMessage={handleSendMessage} />

          {/* Studio Panel */}
          <StudioPanel sources={sources} />
        </div>
      </div>

      {/* Add Sources Modal */}
      <AddSourcesModal
        isOpen={showAddSources}
        onClose={() => setShowAddSources(false)}
        onAddSources={handleAddSources}
      />
    </div>
  );
}
