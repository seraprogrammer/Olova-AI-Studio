import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language?: string;
  inline?: boolean;
}

interface StyleObject {
  [key: string]: React.CSSProperties;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "text",
  inline = false,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isCodeContent = (content: string) => {
    const codePatterns = [
      /^[a-zA-Z0-9_]+\s*\([^\)]*\)\s*[{=>]/,
      /^\([^\)]*\)\s*=>\s*[{]?/,
      /^(const|let|var|import|export|class|function|if|for|while|return|async|await)\b/,
      /^(public|private|protected|static|interface|type|enum)\b/,
      /[{}<>[\]$]/,
      /[;=:]/,
      /^\s{4,}/,
      /^\t+/,
      /^[a-zA-Z0-9_]+\s*[=:]/,
      /\.[a-zA-Z0-9_]+\(.*\)/,
      /\b(console|window|document|Array|Object|String)\.[a-zA-Z]/,
      /^<a-zA-Z][^>]*>/,
      /^<\/[a-zA-Z][^>]*>/,
      /\b(try|catch|finally)\b/,
      /\b(map|filter|reduce|forEach)\b/,
      /\b(Promise|async|await)\b/,
      /^[./]*(src|components|utils|lib|dist|tests?|public)\/[^\s]+/,
      /^import\s.*from\s['"]/,
      /^require\(['"]/,
      /^\/\/.*$/,
      /^\/\*[\s\S]*?\*\//,
      /^#\s.*$/,
      /^#\!.+$/,
      /\.(js|ts|jsx|tsx|py|rb|java|c|cpp|html|css|md|json|sh|bash)\b/,
      /^\s*$/,
    ];

    return codePatterns.some((pattern) => pattern.test(content));
  };

  const value = code.replace(/\n$/, "");
  const isActualCode = !inline && isCodeContent(value);

  if (isActualCode) {
    return (
      <div className="not-prose my-4">
        <pre className="relative group">
          <div className="absolute top-0 left-0 right-0 h-11 bg-gray-800/90 rounded-t-lg border-b border-gray-700 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs font-mono text-gray-400 ml-2 select-none">
                {language}
              </span>
            </div>
            <button
              onClick={() => handleCopyCode(value)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600/50 transition-all duration-200"
              aria-label="Copy code"
            >
              {copiedCode === value ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <SyntaxHighlighter
            style={oneDark as StyleObject}
            language={language}
            PreTag="div"
            className="!mt-0 !bg-[#1a1a1a] !rounded-lg !pt-12 !pb-4 shadow-2xl border border-gray-700/50"
            showLineNumbers={true}
            wrapLines={true}
            wrapLongLines={true}
            customStyle={{
              margin: 0,
              fontSize: "0.9em",
              lineHeight: "1.5",
            }}
          >
            {value}
          </SyntaxHighlighter>
        </pre>
      </div>
    );
  }

  if (inline) {
    return (
      <code className="bg-gray-800/60 px-1.5 py-0.5 rounded-md text-[0.9em] font-mono text-gray-200 border border-gray-700/40">
        {value}
      </code>
    );
  }

  return (
    <div className="not-prose my-4">
      <pre>
        <code className="block bg-gray-800/60 p-4 rounded-lg text-[0.9em] font-mono text-gray-200 border border-gray-700/40">
          {value}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
