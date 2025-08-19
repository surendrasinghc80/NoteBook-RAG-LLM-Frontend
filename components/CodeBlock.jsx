"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={copyToClipboard}
        className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded bg-zinc-700 px-2 py-1 text-xs text-white hover:bg-zinc-600"
      >
        {copied ? (
          <>
            <CheckIcon className="h-3 w-3" />
            Copied!
          </>
        ) : (
          <>
            <ClipboardDocumentIcon className="h-3 w-3" />
            Copy
          </>
        )}
      </button>
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        customStyle={{
          backgroundColor: "#27272a", // zinc-800
          borderRadius: "0.5rem",
          padding: "1rem",
          margin: "0.5rem 0",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}
