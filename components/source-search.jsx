"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Filter, X, FileText } from "lucide-react"

export function SourceSearch({ sources, onSourceSelect, onFilterChange }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState({
    type: [],
    status: [],
    dateRange: null,
  })
  const [showFilters, setShowFilters] = useState(false)

  // Get unique file types and statuses for filters
  const fileTypes = [...new Set(sources.map((s) => s.type))]
  const statuses = [...new Set(sources.map((s) => s.status))]

  // Filter sources based on search and filters
  const filteredSources = sources.filter((source) => {
    // Text search
    const matchesSearch =
      !searchQuery ||
      source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (source.content && source.content.toLowerCase().includes(searchQuery.toLowerCase()))

    // Type filter
    const matchesType = selectedFilters.type.length === 0 || selectedFilters.type.includes(source.type)

    // Status filter
    const matchesStatus = selectedFilters.status.length === 0 || selectedFilters.status.includes(source.status)

    return matchesSearch && matchesType && matchesStatus
  })

  const toggleFilter = (filterType, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((v) => v !== value)
        : [...prev[filterType], value],
    }))
  }

  const clearFilters = () => {
    setSelectedFilters({
      type: [],
      status: [],
      dateRange: null,
    })
  }

  const hasActiveFilters =
    selectedFilters.type.length > 0 || selectedFilters.status.length > 0 || selectedFilters.dateRange

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sources and content..."
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/40"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={`bg-white/10 border-white/20 text-white hover:bg-white/20 ${hasActiveFilters ? "border-blue-400" : ""}`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 h-4 w-4 p-0 text-xs">
              {selectedFilters.type.length + selectedFilters.status.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">Filters</h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                Clear all
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* File Type Filter */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">File Type</label>
              <div className="flex flex-wrap gap-2">
                {fileTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedFilters.type.includes(type) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFilter("type", type)}
                    className={`text-xs ${
                      selectedFilters.type.includes(type)
                        ? "bg-blue-600 text-white"
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }`}
                  >
                    {type.split("/")[1] || type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <Button
                    key={status}
                    variant={selectedFilters.status.includes(status) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFilter("status", status)}
                    className={`text-xs ${
                      selectedFilters.status.includes(status)
                        ? "bg-blue-600 text-white"
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }`}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Search Results */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">
            {filteredSources.length} of {sources.length} sources
          </span>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="h-3 w-3 mr-1" />
              Clear search
            </Button>
          )}
        </div>

        <ScrollArea className="h-64">
          <div className="space-y-2">
            {filteredSources.map((source) => (
              <Card
                key={source.id}
                className="bg-white/5 border-white/10 p-3 hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => onSourceSelect(source)}
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-white text-sm font-medium truncate">{source.name}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {source.status}
                      </Badge>
                      <span className="text-white/40 text-xs">{source.uploadedAt?.toLocaleDateString()}</span>
                    </div>
                    {searchQuery && source.content && (
                      <p className="text-white/60 text-xs mt-1 line-clamp-2">{source.content.substring(0, 100)}...</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
