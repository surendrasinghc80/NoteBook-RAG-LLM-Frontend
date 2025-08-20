# 🧠 NotebookLM RAG Frontend

A powerful, modern frontend for the NotebookLM-style RAG (Retrieval-Augmented Generation) system. Built with Next.js 15, React 19, and TypeScript, this application provides an intuitive interface for document analysis, source management, and AI-powered conversations.

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 📚 **Multi-Source Support**
- **PDF Documents** - Upload and analyze PDF files with intelligent chunking
- **Web URLs** - Extract and index content from any webpage
- **YouTube Videos** - Process video transcripts for analysis
- **Raw Text** - Paste and analyze text content directly
- **Google Integrations** - Drive, Docs, and Slides (coming soon)

### 💬 **Intelligent Chat Interface**
- **RAG-Powered Conversations** - Chat with your documents using advanced retrieval
- **Source Citations** - See which documents inform each response
- **Confidence Scoring** - Understand the reliability of AI responses
- **Message Actions** - Copy, regenerate, and provide feedback on responses
- **Typing Indicators** - Real-time processing status with animated stages

### 🎨 **Modern UI/UX**
- **Three-Panel Layout** - Sources, Chat, and Studio panels for optimal workflow
- **Dark/Light Theme** - Automatic theme switching with system preference
- **Responsive Design** - Works seamlessly across desktop and mobile devices
- **Beautiful Animations** - Smooth transitions and loading states
- **Accessibility** - Built with WCAG guidelines in mind

### 💾 **Persistent Storage**
- **Browser Persistence** - Sources and chat history survive page refreshes
- **Local Storage** - Secure client-side data storage with error handling
- **State Management** - React Context with useReducer for reliable state
- **Data Recovery** - Graceful handling of storage errors and data migration

### 🔧 **Developer Experience**
- **TypeScript** - Full type safety and IntelliSense support
- **Component Library** - Radix UI components with custom styling
- **Code Splitting** - Optimized bundle sizes with Next.js
- **Hot Reload** - Instant development feedback with Turbopack

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or later
- **npm**, **yarn**, **pnpm**, or **bun**
- **Backend Server** - [NotebookLM RAG Backend](https://github.com/your-repo/notebook-rag-backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/notebook-rag-llm-frontend.git
   cd notebook-rag-llm-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure API endpoint**
   
   Update the API base URL in `lib/api-service.js`:
   ```javascript
   const API_BASE_URL = "http://localhost:5000/api/rag"; // Local development
   // or
   const API_BASE_URL = "https://your-backend.onrender.com/api/rag"; // Production
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Usage Guide

### Adding Sources

1. **Click "Add Sources"** in the Sources panel
2. **Choose your source type:**
   - **Upload** - Drag & drop or select PDF files
   - **Link** - Enter website URLs or YouTube links
   - **Text** - Paste text content directly
   - **Integrations** - Connect Google services (coming soon)

### Chatting with Documents

1. **Wait for processing** - Sources show "processed" status when ready
2. **Ask questions** - Type your query in the chat interface
3. **Review responses** - See AI answers with source citations
4. **Use actions** - Copy, regenerate, or provide feedback on responses

### Managing Data

- **Clear Chat** - Remove conversation history while keeping sources
- **Delete Sources** - Remove individual sources from the panel
- **Persistent Storage** - Data automatically saves and restores on refresh

## 🏗️ Architecture

### Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript with strict mode
- **Styling:** Tailwind CSS with custom design system
- **UI Components:** Radix UI primitives with custom theming
- **State Management:** React Context with useReducer
- **Storage:** Browser localStorage with error handling
- **HTTP Client:** Axios with request/response interceptors
- **Icons:** Lucide React icon library

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.jsx         # Root layout with providers
│   └── page.jsx           # Main application page
├── components/            # React components
│   ├── ui/               # Reusable UI components (Radix-based)
│   ├── chat-interface.jsx # RAG chat functionality
│   ├── sources-panel.jsx  # Source management
│   └── add-sources-modal.jsx # Source upload modal
├── contexts/             # React Context providers
│   └── PersistentDataContext.jsx # Data persistence
├── lib/                  # Utility libraries
│   ├── api-service.js    # Backend API client
│   ├── storage-utils.js  # localStorage utilities
│   └── utils.ts          # General utilities
└── public/               # Static assets
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Optional: Custom API endpoint
NEXT_PUBLIC_API_URL=http://localhost:5000/api/rag

# Optional: Enable debug mode
NEXT_PUBLIC_DEBUG=true
```

### API Service Configuration

The application connects to a backend RAG service. Update the configuration in `lib/api-service.js`:

```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/rag";
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in the Vercel dashboard
3. **Deploy** - Automatic deployments on every push

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify** - Static export with `next export`
- **AWS Amplify** - Full-stack deployment
- **Docker** - Containerized deployment

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** - For GPT models and embeddings
- **Qdrant** - Vector database for semantic search
- **Vercel** - Next.js framework and deployment platform
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework

## 📞 Support

- **Issues** - [GitHub Issues](https://github.com/your-username/notebook-rag-llm-frontend/issues)
- **Discussions** - [GitHub Discussions](https://github.com/your-username/notebook-rag-llm-frontend/discussions)
- **Email** - support@yourproject.com

---

<div align="center">
  <strong>Built with ❤️ using Next.js and modern web technologies</strong>
</div>
