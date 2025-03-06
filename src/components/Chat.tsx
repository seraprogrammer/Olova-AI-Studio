import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Loader2,
  Send,
  Brain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ChatProps {
  currentChat: {
    id: string;
    title: string;
    messages: Array<{ role: string; content: string }>;
  } | null;
  isLoading: boolean;
  streamingContent: string;
  onSendMessage: (message: string) => void;
  onNewChat: () => void;
}

function ThinkingBlock({ content }: { content: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-4 border border-[#2A2F34]/80 rounded-lg overflow-hidden shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-[#2A2F34]/80 text-white flex items-center justify-between hover:bg-[#3A3F44]/80 transition-colors duration-200 backdrop-blur-sm"
      >
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-emerald-500" />
          <span className="font-medium">Thinking Process</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 bg-[#1A1F24]/70 text-gray-300 backdrop-blur-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline ? (
                  <CodeBlock
                    language={match ? match[1] : "text"}
                    value={String(children).replace(/\n$/, "")}
                  />
                ) : (
                  <code
                    className="bg-[#1A1F24]/80 text-gray-200 px-1 py-0.5 rounded backdrop-blur-sm"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export const Chat: React.FC<ChatProps> = ({
  currentChat,
  isLoading,
  streamingContent,
  onSendMessage,
  onNewChat,
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleExampleClick = (exampleText: string) => {
    setInput(exampleText);
    // Auto submit the example
    if (exampleText.trim() && !isLoading) {
      onSendMessage(exampleText.trim());
    }
  };

  const processThinkingContent = (content: string) => {
    const thinkMatches = content.match(/<think>(.*?)<\/think>/s);
    if (thinkMatches) {
      const thinkContent = thinkMatches[1];
      const remainingContent = content.replace(/<think>.*?<\/think>/s, "");
      return (
        <>
          <ThinkingBlock content={thinkContent} />
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline ? (
                  <CodeBlock
                    language={match ? match[1] : "text"}
                    value={String(children).replace(/\n$/, "")}
                  />
                ) : (
                  <code
                    className="bg-[#1A1F24]/80 text-gray-200 px-1 py-0.5 rounded backdrop-blur-sm"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              hr: () => (
                <hr className="my-4 border-t border-[#374151] border-dashed" />
              ),
              h1: ({ node, ...props }) => (
                <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-xl font-bold mt-5 mb-3" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg font-bold mt-4 mb-2" {...props} />
              ),
              p: ({ node, ...props }) => <p className="mb-4" {...props} />,
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />
              ),
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              a: ({ node, ...props }) => (
                <a
                  className="text-emerald-400 hover:text-emerald-300 underline"
                  {...props}
                />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-emerald-500/30 pl-4 italic text-gray-300 my-4"
                  {...props}
                />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-4">
                  <table
                    className="min-w-full border border-[#374151] rounded-lg"
                    {...props}
                  />
                </div>
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-[#1A1F24]" {...props} />
              ),
              tbody: ({ node, ...props }) => (
                <tbody className="divide-y divide-[#374151]" {...props} />
              ),
              tr: ({ node, ...props }) => (
                <tr className="hover:bg-[#1A1F24]/50" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th
                  className="px-4 py-2 text-left text-sm font-medium border-b border-[#374151]"
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td className="px-4 py-2 text-sm border-[#374151]" {...props} />
              ),
            }}
          >
            {remainingContent}
          </ReactMarkdown>
        </>
      );
    }

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline ? (
              <CodeBlock
                language={match ? match[1] : "text"}
                value={String(children).replace(/\n$/, "")}
              />
            ) : (
              <code
                className="bg-[#1A1F24]/80 text-gray-200 px-1 py-0.5 rounded backdrop-blur-sm"
                {...props}
              >
                {children}
              </code>
            );
          },
          hr: () => (
            <hr className="my-4 border-t border-[#374151] border-dashed" />
          ),
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold mt-5 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold mt-4 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => <p className="mb-4" {...props} />,
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          a: ({ node, ...props }) => (
            <a
              className="text-emerald-400 hover:text-emerald-300 underline"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-emerald-500/30 pl-4 italic text-gray-300 my-4"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                className="min-w-full border border-[#374151] rounded-lg"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#1A1F24]" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-[#374151]" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-[#1A1F24]/50" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-4 py-2 text-left text-sm font-medium border-b border-[#374151]"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-sm border-[#374151]" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const CodeBlock = ({
    language,
    value,
  }: {
    language: string;
    value: string;
  }) => {
    const [copied, setCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const copyToClipboard = () => {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="relative group my-4 transform transition-all duration-300">
        <div
          className={`relative z-50 h-full flex flex-col ${
            isFullscreen
              ? "bg-[#0F1419]/90 rounded-lg shadow-2xl backdrop-blur-md"
              : ""
          }`}
        >
          <div className="absolute right-2 top-2 z-10 flex space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-1.5 rounded bg-[#2A2F34]/80 hover:bg-[#3A3F44]/80 transition-all duration-300 backdrop-blur-sm ${
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
              className={`p-1.5 rounded bg-[#2A2F34]/80 hover:bg-[#3A3F44]/80 transition-all duration-300 backdrop-blur-sm ${
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
            className={`rounded-lg overflow-hidden border border-[#2A2F34]/80 shadow-lg transition-all duration-300 hover:border-[#3A3F44]/80 backdrop-blur-sm flex flex-col ${
              isFullscreen ? "h-full" : ""
            }`}
          >
            <div className="bg-[#2A2F34]/80 px-4 py-2 text-sm text-gray-400 border-b border-[#374151]/80 flex items-center justify-between shrink-0 backdrop-blur-sm">
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
            <div
              className={`relative bg-[#1A1F24]/90 group flex-1 overflow-auto backdrop-blur-sm`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-emerald-500/30 via-emerald-500/10 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent pointer-events-none"></div>
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
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Chat messages container with proper overflow handling */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-full mx-auto h-full">
          {currentChat ? (
            <>
              {currentChat.messages.map((message, index) => (
                <div
                  key={index}
                  className={`py-5 ${
                    message.role === "user"
                      ? "bg-transparent"
                      : "bg-[#1A1F24]/30 backdrop-blur-sm"
                  }`}
                >
                  <div className="max-w-3xl mx-auto px-4">
                    {message.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] bg-indigo-600/20 border border-indigo-500/30 rounded-lg px-4 py-3 backdrop-blur-sm">
                          <div className="text-xs font-medium mb-1 text-indigo-300">
                            You
                          </div>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({
                                node,
                                inline,
                                className,
                                children,
                                ...props
                              }) {
                                const match = /language-(\w+)/.exec(
                                  className || ""
                                );
                                return !inline ? (
                                  <CodeBlock
                                    language={match ? match[1] : "text"}
                                    value={String(children).replace(/\n$/, "")}
                                  />
                                ) : (
                                  <code
                                    className="bg-[#1A1F24]/80 text-gray-200 px-1 py-0.5 rounded backdrop-blur-sm"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              },
                              hr: () => (
                                <hr className="my-4 border-t border-[#374151] border-dashed" />
                              ),
                              h1: ({ node, ...props }) => (
                                <h1
                                  className="text-2xl font-bold mt-6 mb-4"
                                  {...props}
                                />
                              ),
                              h2: ({ node, ...props }) => (
                                <h2
                                  className="text-xl font-bold mt-5 mb-3"
                                  {...props}
                                />
                              ),
                              h3: ({ node, ...props }) => (
                                <h3
                                  className="text-lg font-bold mt-4 mb-2"
                                  {...props}
                                />
                              ),
                              p: ({ node, ...props }) => (
                                <p className="mb-4" {...props} />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul
                                  className="list-disc pl-5 mb-4 space-y-1"
                                  {...props}
                                />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol
                                  className="list-decimal pl-5 mb-4 space-y-1"
                                  {...props}
                                />
                              ),
                              li: ({ node, ...props }) => (
                                <li className="mb-1" {...props} />
                              ),
                              a: ({ node, ...props }) => (
                                <a
                                  className="text-emerald-400 hover:text-emerald-300 underline"
                                  {...props}
                                />
                              ),
                              blockquote: ({ node, ...props }) => (
                                <blockquote
                                  className="border-l-4 border-emerald-500/30 pl-4 italic text-gray-300 my-4"
                                  {...props}
                                />
                              ),
                              table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-4">
                                  <table
                                    className="min-w-full border border-[#374151] rounded-lg"
                                    {...props}
                                  />
                                </div>
                              ),
                              thead: ({ node, ...props }) => (
                                <thead className="bg-[#1A1F24]" {...props} />
                              ),
                              tbody: ({ node, ...props }) => (
                                <tbody
                                  className="divide-y divide-[#374151]"
                                  {...props}
                                />
                              ),
                              tr: ({ node, ...props }) => (
                                <tr
                                  className="hover:bg-[#1A1F24]/50"
                                  {...props}
                                />
                              ),
                              th: ({ node, ...props }) => (
                                <th
                                  className="px-4 py-2 text-left text-sm font-medium border-b border-[#374151]"
                                  {...props}
                                />
                              ),
                              td: ({ node, ...props }) => (
                                <td
                                  className="px-4 py-2 text-sm border-[#374151]"
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start">
                        <div className="bg-[#1A1F24]/50 border border-emerald-500/10 rounded-lg px-4 py-3 backdrop-blur-sm">
                          <div className="text-xs font-medium mb-1 text-emerald-400">
                            Assistant
                          </div>
                          {processThinkingContent(message.content)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="py-5 bg-transparent">
                  <div className="max-w-3xl mx-auto px-4">
                    <div className="flex justify-start">
                      <div className=" bg-[#1A1F24]/50 border border-emerald-500/10 rounded-lg px-4 py-3 backdrop-blur-sm">
                        <div className="text-xs font-medium mb-1 text-emerald-400">
                          Assistant
                        </div>
                        {streamingContent ? (
                          processThinkingContent(streamingContent)
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Thinking...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="max-w-2xl w-full mx-auto text-center px-4">
                <h1 className="text-4xl font-bold mb-6 text-gray-200">
                  What do you want to know?
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  <button
                    onClick={() =>
                      handleExampleClick(
                        "JavaScript: What is the difference between null and undefined?"
                      )
                    }
                    className="p-4 text-left rounded-xl bg-[#1A1F24]/50 border border-[#2A2F34]/70 backdrop-blur-sm hover:bg-[#1A1F24]/70 transition-all duration-200 hover:border-indigo-500/30"
                  >
                    <p className="text-sm text-gray-300">
                      JavaScript: What is the difference between null and
                      undefined?
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      handleExampleClick(
                        "JavaScript: What is the difference between == and ===?"
                      )
                    }
                    className="p-4 text-left rounded-xl bg-[#1A1F24]/50 border border-[#2A2F34]/70 backdrop-blur-sm hover:bg-[#1A1F24]/70 transition-all duration-200 hover:border-indigo-500/30"
                  >
                    <p className="text-sm text-gray-300">
                      JavaScript: What is the difference between == and ===?
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      handleExampleClick(
                        "JavaScript: What are closures, and how do they work?"
                      )
                    }
                    className="p-4 text-left rounded-xl bg-[#1A1F24]/50 border border-[#2A2F34]/70 backdrop-blur-sm hover:bg-[#1A1F24]/70 transition-all duration-200 hover:border-indigo-500/30"
                  >
                    <p className="text-sm text-gray-300">
                      JavaScript: What are closures, and how do they work?
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      handleExampleClick(
                        "JavaScript: How does this keyword work in JavaScript?"
                      )
                    }
                    className="p-4 text-left rounded-xl bg-[#1A1F24]/50 border border-[#2A2F34]/70 backdrop-blur-sm hover:bg-[#1A1F24]/70 transition-all duration-200 hover:border-indigo-500/30"
                  >
                    <p className="text-sm text-gray-300">
                      JavaScript: How does this keyword work in JavaScript?
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area fixed to the bottom of the container */}
      <div className="absolute bottom-0 inset-x-0 border-t border-[#2A2F34]/50 bg-[#0F1419]/90 backdrop-blur-md shadow-lg">
        <div className="max-w-3xl mx-auto p-3">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask anything..."
              className="w-full px-4 py-3 bg-[#1A1F24]/60 rounded-lg border border-[#2A2F34]/70 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 placeholder-gray-500 text-sm pr-10 backdrop-blur-sm shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
