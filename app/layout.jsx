import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { PersistentDataProvider } from "@/contexts/PersistentDataContext"
import "./globals.css"

export const metadata = {
  title: "NotebookLM - RAG Application",
  description: "AI-powered notebook for document analysis and chat",
  generator: "v0.app",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <PersistentDataProvider>
            {children}
          </PersistentDataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
