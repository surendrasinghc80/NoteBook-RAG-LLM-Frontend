import axios from "axios";

// Base URL for the backend API - adjust this to match your backend server
const API_BASE_URL = "https://notebook-rag-llm.onrender.com/api/rag";

class ApiService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Upload and index a PDF file
   * @param {File} pdfFile - The PDF file to upload
   * @returns {Promise} Response from the backend
   */
  async uploadPDF(pdfFile) {
    const formData = new FormData();
    formData.append("pdfFile", pdfFile);

    try {
      const response = await this.axiosInstance.post("/index", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading PDF:", error);
      throw new Error(error.response?.data?.message || "Failed to upload PDF");
    }
  }

  /**
   * Send a chat message and get RAG-powered response
   * @param {string} message - The user's message/question
   * @returns {Promise} Response from the backend
   */
  async sendChatMessage(message) {
    try {
      const response = await this.axiosInstance.post("/chat", {
        query: message,
      });
      return response.data;
    } catch (error) {
      console.error("Error sending chat message:", error);
      throw new Error(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }

  /**
   * Upload raw text content
   * @param {string} text - The text content to index
   * @param {string} title - Optional title for the text
   * @returns {Promise} Response from the backend
   */
  async uploadText(text, title = "Pasted Text") {
    try {
      const response = await this.axiosInstance.post("/upload-text", {
        text: text,
        title: title,
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading text:", error);
      throw new Error(error.response?.data?.message || "Failed to upload text");
    }
  }

  /**
   * Get notebook documents with query
   * @param {string} query - The search query
   * @returns {Promise} List of indexed documents
   */
  async getNotebookDocs(query) {
    try {
      const response = await this.axiosInstance.post("/notebook-docs", {
        query: query,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting notebook docs:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get documents"
      );
    }
  }

  /**
   * Index content from a URL
   * @param {string} url - The URL to index
   * @returns {Promise} Response from the backend
   */
  async uploadURL(url) {
    try {
      const response = await this.axiosInstance.post("/url-loader", {
        url: url,
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading URL:", error);
      throw new Error(error.response?.data?.message || "Failed to upload URL");
    }
  }

  /**
   * Get indexed URL documents with query
   * @param {string} query - The search query
   * @returns {Promise} List of indexed URL documents
   */
  async getURLDocs(query) {
    try {
      const response = await this.axiosInstance.post("/get-url-docs", {
        query: query,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting URL docs:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get URL documents"
      );
    }
  }

  /**
   * Upload YouTube transcript
   * @param {string} youtubeUrl - The YouTube video URL
   * @returns {Promise} Response from the backend
   */
  async uploadYouTube(youtubeUrl) {
    try {
      const response = await this.axiosInstance.post("/youtube/upload", {
        url: youtubeUrl,
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading YouTube:", error);
      throw new Error(
        error.response?.data?.message || "Failed to upload YouTube video"
      );
    }
  }

  /**
   * Ask question about YouTube videos
   * @param {string} question - The question to ask
   * @returns {Promise} Response from the backend
   */
  async askYouTubeQuestion(question) {
    try {
      const response = await this.axiosInstance.post("/youtube/ask", {
        question: question,
      });
      return response.data;
    } catch (error) {
      console.error("Error asking YouTube question:", error);
      throw new Error(
        error.response?.data?.message || "Failed to ask YouTube question"
      );
    }
  }

  /**
   * Unified chat using single /chat endpoint
   * @param {string} message - The user's message/question
   * @param {Array} sources - Array of processed sources (for compatibility)
   * @returns {Promise} Response from the backend
   */
  async smartChat(message, sources) {
    try {
      // Use unified chat endpoint for all queries
      return await this.sendChatMessage(message);
    } catch (error) {
      console.error("Error in chat:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default ApiService;
