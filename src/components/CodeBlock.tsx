import React, { useState } from "react";
import { Copy, Check, Minimize2, Maximize2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  language: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative group my-4 transform transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-4 z-50 my-0 transform-none"
          : "hover:translate-y-[-2px]"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}
      <div
        className={`relative z-50 h-full flex flex-col ${
          isFullscreen ? "bg-[#0F1419] rounded-lg shadow-2xl" : ""
        }`}
      >
        <div className="absolute right-2 top-2 z-10 flex space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-1.5 rounded bg-[#2A2F34] hover:bg-[#3A3F44] transition-all duration-300 ${
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            )}
          </button>
          <button
            onClick={copyToClipboard}
            className={`p-1.5 rounded bg-[#2A2F34] hover:bg-[#3A3F44] transition-all duration-300 ${
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            )}
          </button>
        </div>
        <div
          className={`rounded-lg overflow-hidden border border-[#2A2F34] shadow-lg transition-all duration-300 hover:border-[#3A3F44] backdrop-blur-sm flex flex-col ${
            isFullscreen ? "h-full" : ""
          }`}
        >
          <div className="bg-[#2A2F34] px-4 py-2 text-sm text-gray-400 border-b border-[#374151] flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-lg shadow-red-500/20 transition-transform hover:scale-110"
                />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-lg shadow-yellow-500/20 transition-transform hover:scale-110"></div>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="w-3 h-3 rounded-full bg-[#27C93F] shadow-lg shadow-green-500/20 transition-transform hover:scale-110"
                />
              </div>
              <span className="font-mono text-xs opacity-50">|</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="font-mono text-xs">{language}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs opacity-75">
              <span>{value.split("\n").length} lines</span>
              <span className="text-emerald-500/50">•</span>
              <span>{value.length} characters</span>
              <span className="text-emerald-500/50">•</span>
              <span className="text-emerald-500">ready</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          </div>
          <div className={`relative bg-[#1A1F24] group flex-1 overflow-auto`}>
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-emerald-500/30 via-emerald-500/10 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none"></div>
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
              <div className="text-xs text-gray-500 bg-[#2A2F34] px-2 py-1 rounded">
                <span className="text-emerald-500">⌘</span> + Click to select
                line
              </div>
            </div>
            <SyntaxHighlighter
              language={language}
              style={{
                ...oneDark,
                'pre[class*="language-"]': {
                  ...oneDark['pre[class*="language-"]'],
                  background: "#0F1419",
                },
                'code[class*="language-"]': {
                  ...oneDark['code[class*="language-"]'],
                  background: "transparent",
                },
              }}
              customStyle={{
                margin: 0,
                padding: "1rem 1rem 1rem 1.5rem",
                background: "transparent",
                fontSize: "0.875rem",
                lineHeight: "1.5",
                height: isFullscreen ? "100%" : "auto",
              }}
              showLineNumbers={true}
              wrapLines={true}
              lineProps={(lineNumber) => ({
                style: { cursor: "pointer" },
                onClick: (e) => {
                  if (e.metaKey || e.ctrlKey) {
                    console.log(`Selected line ${lineNumber}`);
                  }
                },
              })}
              lineNumberStyle={{
                minWidth: "2.5em",
                paddingRight: "1em",
                color: "#4B5563",
                textAlign: "right",
                borderRight: "1px solid #2A2F34",
                marginRight: "1em",
                userSelect: "none",
              }}
            >
              {value}
            </SyntaxHighlighter>
            <div className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-emerald-500/[0.02] via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent"></div>
          </div>
        </div>
      </div>
      <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-xl -z-10"></div>
    </div>
  );
};
