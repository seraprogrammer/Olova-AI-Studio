import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import {
  Send,
  Loader2,
  Search,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  Brain,
  Minimize2,
  Maximize2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import "./App.css";

interface Chat {
  id: string;
  title: string;
  messages: Array<{ role: string; content: string }>;
  createdAt: string;
  model?: string;
}

interface ThinkingBlockProps {
  content: string;
}

// Update the CodeProps interface to extend the correct types
interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function ThinkingBlock({ content }: ThinkingBlockProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-4 border border-[#2A2F34] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-[#2A2F34] text-white flex items-center justify-between hover:bg-[#3A3F44] transition-colors duration-200"
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
        <div className="p-4 bg-[#1A1F24] text-gray-300">
          <ReactMarkdown
            className="prose prose-invert max-w-none"
            remarkPlugins={[remarkGfm]}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ language, value }: { language: string; value: string }) {
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
}

function App() {
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem("chats");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [selectedModel, setSelectedModel] = useState("blackboxai-pro");
  const inputRef = useRef<HTMLInputElement>(null);

  const currentChat = chats.find((chat) => chat.id === currentChatId) || null;

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);

    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const formatCodeBlocks = (content: string) => {
    // Split by code block markers
    const parts = content.split("```");

    // If no code blocks found, return original content
    if (parts.length === 1) return content;

    // Reconstruct with proper formatting
    return parts
      .map((part, index) => {
        // Even indices are regular text, odd indices are code
        if (index % 2 === 0) {
          return part;
        } else {
          // Extract language and code
          const firstLineEnd = part.indexOf("\n");
          const language =
            firstLineEnd === -1 ? part : part.slice(0, firstLineEnd);
          const code = firstLineEnd === -1 ? "" : part.slice(firstLineEnd + 1);

          // Return properly formatted code block
          return `\`\`\`${language}\n${code}\n\`\`\``;
        }
      })
      .join("\n\n");
  };

  const processThinkingContent = (content: string) => {
    const thinkMatches = content.match(/<think>(.*?)<\/think>/s);
    if (thinkMatches) {
      const thinkContent = thinkMatches[1];
      const remainingContent = content.replace(/<think>.*?<\/think>/s, "");
      return (
        <>
          <ThinkingBlock content={formatCodeBlocks(thinkContent)} />
          <ReactMarkdown
            className="prose prose-invert max-w-none"
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => (
                <p className="mb-4 last:mb-0" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal ml-6 mb-4 space-y-2" {...props} />
              ),
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              h1: ({ node, ...props }) => (
                <h1 className="text-2xl font-bold mb-4" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-xl font-bold mb-3" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg font-bold mb-2" {...props} />
              ),
              code({ node, inline, className, children, ...props }: CodeProps) {
                const match = /language-(\w+)/.exec(className || "");
                const content = String(children).replace(/\n$/, "");

                const isCodeBlock =
                  (!inline && className) || content.startsWith("```");

                if (isCodeBlock) {
                  let language = match ? match[1] : "";
                  let codeContent = content;

                  if (content.startsWith("```")) {
                    const firstLineEnd = content.indexOf("\n");
                    const firstLine = content.slice(3, firstLineEnd).trim();
                    if (firstLine) {
                      language = firstLine;
                      codeContent = content
                        .slice(firstLineEnd + 1)
                        .replace(/```$/, "")
                        .trim();
                    }
                  }

                  return <CodeBlock language={language} value={codeContent} />;
                }

                // For inline code blocks
                const [copied, setCopied] = useState(false);
                const [isHovered, setIsHovered] = useState(false);

                const copyToClipboard = (e: React.MouseEvent) => {
                  e.preventDefault();
                  navigator.clipboard.writeText(content);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                };

                return (
                  <span
                    className="relative inline-block group"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <code
                      className="bg-[#1A1F24] rounded px-1.5 py-0.5"
                      {...props}
                    >
                      {children}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className={`absolute -right-2 top-1/2 -translate-y-1/2 p-1 rounded bg-[#2A2F34] hover:bg-[#3A3F44] transition-all duration-300 ${
                        isHovered
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-75"
                      }`}
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
                      )}
                    </button>
                  </span>
                );
              },
            }}
          >
            {formatCodeBlocks(remainingContent)}
          </ReactMarkdown>
        </>
      );
    }

    return (
      <ReactMarkdown
        className="prose prose-invert max-w-none"
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => (
            <p className="mb-4 last:mb-0" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal ml-6 mb-4 space-y-2" {...props} />
          ),
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold mb-2" {...props} />
          ),
          code({ node, inline, className, children, ...props }: CodeProps) {
            const match = /language-(\w+)/.exec(className || "");
            const content = String(children).replace(/\n$/, "");

            const isCodeBlock =
              (!inline && className) || content.startsWith("```");

            if (isCodeBlock) {
              let language = match ? match[1] : "";
              let codeContent = content;

              if (content.startsWith("```")) {
                const firstLineEnd = content.indexOf("\n");
                const firstLine = content.slice(3, firstLineEnd).trim();
                if (firstLine) {
                  language = firstLine;
                  codeContent = content
                    .slice(firstLineEnd + 1)
                    .replace(/```$/, "")
                    .trim();
                }
              }

              return <CodeBlock language={language} value={codeContent} />;
            }

            // For inline code blocks
            const [copied, setCopied] = useState(false);
            const [isHovered, setIsHovered] = useState(false);

            const copyToClipboard = (e: React.MouseEvent) => {
              e.preventDefault();
              navigator.clipboard.writeText(content);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            };

            return (
              <span
                className="relative inline-block group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <code className="bg-[#1A1F24] rounded px-1.5 py-0.5" {...props}>
                  {children}
                </code>
                <button
                  onClick={copyToClipboard}
                  className={`absolute -right-2 top-1/2 -translate-y-1/2 p-1 rounded bg-[#2A2F34] hover:bg-[#3A3F44] transition-all duration-300 ${
                    isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
                  }`}
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
                  )}
                </button>
              </span>
            );
          },
        }}
      >
        {formatCodeBlocks(content)}
      </ReactMarkdown>
    );
  };

  // Separate the input component completely to prevent re-renders
  const ChatInput = () => {
    const [localInputMessage, setLocalInputMessage] = useState("");

    const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalInputMessage(e.target.value);
    };

    const handleLocalSubmit = (
      e?:
        | React.FormEvent<HTMLFormElement>
        | React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (e) {
        e.preventDefault();
      }
      if (!localInputMessage.trim() || isLoading) return;

      // Call the parent submit handler with the local value
      const message = localInputMessage.trim();
      setLocalInputMessage("");
      handleParentSubmit(message);
    };

    return (
      <form
        onSubmit={handleLocalSubmit}
        className="border-t border-[#2A2F34] bg-[#0F1419]"
      >
        <div className="max-w-4xl mx-auto p-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={localInputMessage}
              onChange={handleLocalInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleLocalSubmit(e);
                }
              }}
              placeholder="Ask me anything..."
              className="w-full px-6 py-4 bg-[#1A1F24]/80 rounded-xl border border-[#2A2F34] focus:outline-none focus:border-emerald-500/20 placeholder-gray-500 text-base pr-14"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !localInputMessage.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-[#2A2F34] hover:bg-[#3A3F44] text-white rounded-lg border border-[#3A3F44] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </form>
    );
  };

  // Parent submit handler that will be called from the isolated input component
  const handleParentSubmit = async (message: string) => {
    setIsLoading(true);

    // Create new chat if needed and get its ID
    let chatId = currentChatId;
    if (!chatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: message.slice(0, 30) + (message.length > 30 ? "..." : ""),
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setChats((prev) => [newChat, ...prev]);
      chatId = newChat.id;
      setCurrentChatId(chatId);
    } else {
      // Update the title of the chat if it's the first message
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === chatId && chat.messages.length === 0) {
            return {
              ...chat,
              title: message.slice(0, 30) + (message.length > 30 ? "..." : ""),
            };
          }
          return chat;
        })
      );
    }

    // Add user message
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, { role: "user", content: message }],
            model: selectedModel,
          };
        }
        return chat;
      })
    );

    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "https://chat-io-v3p1.onrender.com";
      const response = await fetch(`${API_URL}/chat_stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, model: selectedModel }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let lastUpdateTime = Date.now();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedContent += chunk;
        console.log("Received chunk:", chunk);

        const currentTime = Date.now();
        if (currentTime - lastUpdateTime > 150) {
          setStreamingContent(accumulatedContent);
          lastUpdateTime = currentTime;
        }
      }

      console.log("Final response:", accumulatedContent);

      // Update final response
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { role: "assistant", content: accumulatedContent },
                ],
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Error:", error);
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    role: "assistant",
                    content:
                      "Sorry, there was an error processing your request. Please try again.",
                  },
                ],
              }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
      setStreamingContent("");
    }
  };

  return (
    <div className="flex h-screen bg-[#0F1419] text-white">
      {/* Sidebar */}
      <div className="w-72 border-r border-[#2A2F34] p-4 flex flex-col">
        <div className="mb-4">
          <button
            onClick={createNewChat}
            className="flex items-center justify-between w-full px-5 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:shadow-emerald-500/30 hover:translate-y-[-1px]"
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              <span>New Chat</span>
            </div>
            <div className="bg-white/20 rounded-full p-1">
              <Plus className="w-3 h-3" />
            </div>
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-auto space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setCurrentChatId(chat.id)}
              className={`p-2 rounded-lg cursor-pointer flex items-center justify-between group ${
                chat.id === currentChatId
                  ? "bg-[#2A2F34]"
                  : "hover:bg-[#1A1F24]"
              }`}
            >
              <span className="truncate flex-1">{chat.title}</span>
              <button
                onClick={(e) => deleteChat(chat.id, e)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity duration-200 ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Model Selection Header */}
        <div className="border-b border-[#2A2F34] bg-[#1A1F24]/80 backdrop-blur-xl">
          <div className="mx-auto px-4 py-2 flex items-center">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-emerald-500" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-[#2A2F34]/80 px-3 py-1.5 rounded-lg border border-[#2A2F34] focus:outline-none focus:border-emerald-500/20 text-gray-300 text-sm transition-colors duration-200 hover:border-emerald-500/20"
              >
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="o3-mini">O3 Mini</option>
                <option value="mixtral-8x22b">Mixtral 8x22B</option>
                <option value="mixtral-small-24b">Mixtral Small 24B</option>
                <option value="mixtral-small-28b">Mixtral Small 28B</option>
                <option value="hermes-2-dpo">Hermes 2 DPO</option>
                <option value="phi-4">Phi 4</option>
                <option value="wizardlm-2-7b">WizardLM 2 7B</option>
                <option value="wizardlm-2-8x22b">WizardLM 2 8x22B</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
                <option value="blackboxai">Blackbox AI</option>
                <option value="blackboxai-pro">Blackbox AI Pro</option>
                <option value="command-r">Command R</option>
                <option value="command-r-plus">Command R Plus</option>
                <option value="command-r7b">Command R 7B</option>
                <option value="qwen-2-72b">Qwen 2 72B</option>
                <option value="qwq-32b">QWQ 32B</option>
                <option value="qvq-72b">QVQ 72B</option>
                <option value="deepseek-chat">DeepSeek Chat</option>
                <option value="deepseek-v3">DeepSeek V3</option>
                <option value="deepseek-r1">DeepSeek R1</option>
                <option value="dbrx-instruct">DBRX Instruct</option>
                <option value="glm-4">GLM 4</option>
                <option value="airoboros-70b">Airoboros 70B</option>
                <option value="lzlv-70b">LZLV 70B</option>
                <option value="tulu-3-405b">Tulu 3 405B</option>
                <option value="sd-3-5">SD 3.5</option>
                <option value="flux">Flux</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {currentChat?.messages.map((message, index) => (
              <div
                key={index}
                className={`${
                  message.role === "user" ? "bg-[#2A2F34]" : "bg-[#1A1F24]"
                } p-4 rounded-lg`}
              >
                {processThinkingContent(message.content)}
              </div>
            ))}
            {streamingContent && (
              <div className="bg-[#1A1F24] p-4 rounded-lg">
                {processThinkingContent(streamingContent)}
              </div>
            )}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>
        </div>

        <ChatInput />
      </div>
    </div>
  );
}

export default App;
