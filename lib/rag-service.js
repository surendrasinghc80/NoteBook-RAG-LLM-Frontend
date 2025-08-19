export class RAGService {
  constructor(sources = []) {
    this.sources = sources
    this.chunks = this.createChunks(sources)
  }

  // Create text chunks from sources for vector search
  createChunks(sources) {
    const chunks = []

    sources.forEach((source) => {
      if (source.status !== "processed" || !source.content) return

      // Split content into chunks (simulate proper chunking)
      const sentences = source.content.split(/[.!?]+/).filter((s) => s.trim().length > 0)
      const chunkSize = 3 // sentences per chunk

      for (let i = 0; i < sentences.length; i += chunkSize) {
        const chunkText = sentences
          .slice(i, i + chunkSize)
          .join(". ")
          .trim()
        if (chunkText.length > 50) {
          // minimum chunk size
          chunks.push({
            id: `${source.id}-chunk-${Math.floor(i / chunkSize)}`,
            sourceId: source.id,
            sourceName: source.name,
            text: chunkText,
            startIndex: i,
            endIndex: Math.min(i + chunkSize - 1, sentences.length - 1),
            metadata: {
              wordCount: chunkText.split(" ").length,
              sourceType: source.type,
              uploadedAt: source.uploadedAt,
            },
          })
        }
      }
    })

    return chunks
  }

  // Simulate vector similarity search
  searchSimilarChunks(query, topK = 5) {
    if (!query || this.chunks.length === 0) return []

    const queryWords = query
      .toLowerCase()
      .split(" ")
      .filter((w) => w.length > 2)

    // Simple keyword-based similarity (in real implementation, use vector embeddings)
    const scoredChunks = this.chunks.map((chunk) => {
      const chunkWords = chunk.text.toLowerCase().split(" ")
      let score = 0

      // Calculate similarity score
      queryWords.forEach((queryWord) => {
        chunkWords.forEach((chunkWord) => {
          if (chunkWord.includes(queryWord) || queryWord.includes(chunkWord)) {
            score += queryWord.length > 3 ? 2 : 1
          }
        })
      })

      // Boost score for exact phrase matches
      if (chunk.text.toLowerCase().includes(query.toLowerCase())) {
        score += 10
      }

      return { ...chunk, score }
    })

    // Sort by score and return top K
    return scoredChunks
      .filter((chunk) => chunk.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
  }

  // Get context for RAG response
  getContext(query, maxTokens = 2000) {
    const relevantChunks = this.searchSimilarChunks(query, 8)

    let context = ""
    let tokenCount = 0
    const usedSources = new Set()
    const contextChunks = []

    for (const chunk of relevantChunks) {
      const chunkTokens = chunk.text.split(" ").length
      if (tokenCount + chunkTokens > maxTokens) break

      context += `Source: ${chunk.sourceName}\n${chunk.text}\n\n`
      tokenCount += chunkTokens
      usedSources.add(chunk.sourceId)
      contextChunks.push(chunk)
    }

    return {
      context,
      chunks: contextChunks,
      sources: Array.from(usedSources)
        .map((sourceId) => this.sources.find((s) => s.id === sourceId))
        .filter(Boolean),
      tokenCount,
    }
  }

  // Generate RAG-enhanced response (simulation)
  async generateResponse(query, context) {
    // In a real implementation, this would call an LLM API with the context
    // For now, we'll simulate a contextual response

    const { chunks, sources } = context

    if (chunks.length === 0) {
      return {
        content:
          "I don't have enough information in your sources to answer that question. Could you try rephrasing or adding more relevant sources?",
        sources: [],
        confidence: 0,
      }
    }

    // Simulate different types of responses based on query
    let responseContent = ""

    if (query.toLowerCase().includes("summary") || query.toLowerCase().includes("summarize")) {
      responseContent = `Based on your sources, here's a summary of the key points:

${chunks
  .slice(0, 3)
  .map((chunk, i) => `${i + 1}. ${chunk.text.substring(0, 150)}...`)
  .join("\n\n")}

This information comes from ${sources.length} source${sources.length !== 1 ? "s" : ""} in your collection.`
    } else if (query.toLowerCase().includes("what") || query.toLowerCase().includes("how")) {
      responseContent = `According to your sources, here's what I found:

${chunks[0]?.text}

${chunks.length > 1 ? `Additionally, ${chunks[1]?.sourceName} mentions: ${chunks[1]?.text.substring(0, 200)}...` : ""}

Would you like me to elaborate on any of these points?`
    } else {
      responseContent = `Based on the information in your sources, I can provide the following insights:

${chunks
  .slice(0, 2)
  .map((chunk) => `From "${chunk.sourceName}": ${chunk.text}`)
  .join("\n\n")}

${chunks.length > 2 ? `\nI found ${chunks.length - 2} additional relevant passages that support this information.` : ""}`
    }

    return {
      content: responseContent,
      sources: sources.map((source) => ({
        id: source.id,
        name: source.name,
        type: source.type,
      })),
      confidence: Math.min(0.95, 0.3 + chunks.length * 0.15),
      usedChunks: chunks.length,
    }
  }

  // Update sources and rebuild chunks
  updateSources(newSources) {
    this.sources = newSources
    this.chunks = this.createChunks(newSources)
  }

  // Get statistics
  getStats() {
    return {
      totalSources: this.sources.length,
      processedSources: this.sources.filter((s) => s.status === "processed").length,
      totalChunks: this.chunks.length,
      avgChunkSize:
        this.chunks.length > 0
          ? Math.round(this.chunks.reduce((sum, chunk) => sum + chunk.metadata.wordCount, 0) / this.chunks.length)
          : 0,
    }
  }
}
