import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message } from "../types";
import {
  Code2,
  Copy,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

// Add components prop to ThinkBlock
interface ThinkBlockProps {
  content: string;
  components: any;
}

// Component for the collapsible thinking section
const ThinkBlock = ({ content, components }: ThinkBlockProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedContent, setDisplayedContent] = useState("");
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;

    // Check if content ends with "..." to determine if it's still thinking
    if (content.trim().endsWith("...")) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      if (isOpen) {
        setDisplayedContent(content);
      }
    }
  }, [content, isOpen]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setDisplayedContent(contentRef.current);
    }
  };

  return (
    <div className="my-3 border border-gray-700 rounded-md overflow-hidden">
      <div
        className="flex items-center bg-gray-800 p-2 cursor-pointer hover:bg-gray-750"
        onClick={toggleOpen}
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span className="ml-2 font-medium text-gray-300 flex items-center">
          Thinking
          {isAnimating && (
            <span className="ml-2 inline-flex">
              <span className="animate-pulse">.</span>
              <span className="animate-pulse animation-delay-200">.</span>
              <span className="animate-pulse animation-delay-400">.</span>
            </span>
          )}
        </span>
      </div>

      {isOpen && (
        <div className="p-3 bg-gray-850 border-t border-gray-700 text-gray-300 text-sm">
          {isAnimating ? (
            <div className="typing-animation">
              <ReactMarkdown components={components}>
                {displayedContent}
              </ReactMarkdown>
              <span className="inline-flex">
                <span className="animate-pulse">.</span>
                <span className="animate-pulse animation-delay-200">.</span>
                <span className="animate-pulse animation-delay-400">.</span>
              </span>
            </div>
          ) : (
            <ReactMarkdown components={components}>
              {displayedContent}
            </ReactMarkdown>
          )}
        </div>
      )}
    </div>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  // Extract think blocks and replace them with placeholders
  const processContent = (content: string) => {
    const thinkBlocks: string[] = [];

    // Replace <think> tags with placeholders and collect their content
    const processedContent = content.replace(
      /<think>(.*?)<\/think>/gs,
      (_, thinkContent) => {
        const placeholder = `__THINK_BLOCK_${thinkBlocks.length}__`;
        thinkBlocks.push(thinkContent);
        return placeholder;
      }
    );

    return { processedContent, thinkBlocks };
  };

  const handleApplyCode = (code: string) => {
    const editorElement = document.querySelector(".monaco-editor");
    if (editorElement) {
      try {
        // Create a custom event with the code to add
        const event = new CustomEvent("addCode", {
          detail: code.trim(),
          bubbles: true,
        });

        // Dispatch the event on the editor element
        editorElement.dispatchEvent(event);

        // Show a temporary "Applied!" tooltip
        const tooltip = document.createElement("div");
        tooltip.textContent = "Applied!";
        tooltip.className =
          "fixed right-10 top-10 bg-green-600 text-white px-3 py-2 rounded text-sm z-50";
        document.body.appendChild(tooltip);
        setTimeout(() => document.body.removeChild(tooltip), 1500);

        console.log("Code apply event dispatched", code.trim());
      } catch (error) {
        console.error("Error dispatching addCode event:", error);
      }
    } else {
      console.warn("Monaco editor element not found");

      // Fallback approach - try to find the editor after a short delay
      setTimeout(() => {
        const editorElement = document.querySelector(".monaco-editor");
        if (editorElement) {
          const event = new CustomEvent("addCode", {
            detail: code.trim(),
            bubbles: true,
          });
          editorElement.dispatchEvent(event);
          console.log("Code apply event dispatched (delayed)", code.trim());
        } else {
          console.error("Monaco editor element still not found after delay");
        }
      }, 500);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard
      .writeText(code.trim())
      .then(() => {
        // Show a temporary "Copied!" tooltip
        const tooltip = document.createElement("div");
        tooltip.textContent = "Copied!";
        tooltip.className =
          "absolute right-2 -top-8 bg-gray-700 text-white px-2 py-1 rounded text-xs";
        document.body.appendChild(tooltip);
        setTimeout(() => document.body.removeChild(tooltip), 1500);
      })
      .catch((err) => console.error("Failed to copy code:", err));
  };

  // Detect language from code block if not specified
  const detectLanguage = (code: string, specifiedLang?: string) => {
    if (specifiedLang && specifiedLang !== "") return specifiedLang;

    // Simple language detection based on common patterns
    if (
      code.includes("import React") ||
      code.includes("useState") ||
      code.includes("export default")
    )
      return "jsx";
    if (code.includes("<template>") && code.includes("</template>"))
      return "vue";
    if (code.includes("func ") && code.includes("package main")) return "go";
    if (code.includes("def ") && code.includes("import ")) return "python";
    if (
      code.includes("function") ||
      code.includes("const ") ||
      code.includes("let ")
    )
      return "javascript";
    if (code.includes("public class") || code.includes("private void"))
      return "java";
    if (code.includes("#include")) return "cpp";

    return "text"; // Default fallback
  };

  const markdownComponents = {
    h1: (props: any) => (
      <h1
        className="text-2xl font-bold mt-6 mb-4 pb-2 border-b border-gray-700 text-gray-100"
        {...props}
      />
    ),
    h2: (props: any) => (
      <h2 className="text-xl font-bold mt-5 mb-3 text-gray-100" {...props} />
    ),
    h3: (props: any) => (
      <h3 className="text-lg font-bold mt-4 mb-2 text-gray-100" {...props} />
    ),
    h4: (props: any) => (
      <h4 className="text-base font-bold mt-3 mb-2 text-gray-200" {...props} />
    ),
    p: (props: any) => (
      <p className="my-3 leading-relaxed text-gray-300" {...props} />
    ),
    ul: (props: any) => (
      <ul className="list-disc pl-6 my-3 space-y-1 text-gray-300" {...props} />
    ),
    ol: (props: any) => (
      <ol
        className="list-decimal pl-6 my-3 space-y-1 text-gray-300"
        {...props}
      />
    ),
    li: (props: any) => <li className="my-1 text-gray-300" {...props} />,
    blockquote: (props: any) => (
      <blockquote
        className="border-l-4 border-blue-500 pl-4 py-1 my-3 bg-gray-800/50 rounded-r text-gray-300"
        {...props}
      />
    ),
    a: ({ href, ...props }: any) => (
      <a
        href={href}
        className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {props.children}
        <ExternalLink size={14} className="ml-1" />
      </a>
    ),
    table: (props: any) => (
      <div className="overflow-x-auto my-4">
        <table
          className="min-w-full border border-gray-700 rounded text-gray-300"
          {...props}
        />
      </div>
    ),
    thead: (props: any) => (
      <thead className="bg-gray-800 text-gray-200" {...props} />
    ),
    th: (props: any) => (
      <th
        className="px-4 py-2 border-b border-gray-700 text-left text-gray-200"
        {...props}
      />
    ),
    td: (props: any) => (
      <td
        className="px-4 py-2 border-b border-gray-700 text-gray-300"
        {...props}
      />
    ),
    hr: (props: any) => <hr className="my-6 border-gray-700" {...props} />,
    img: (props: any) => (
      <img
        className="max-w-full h-auto rounded my-4 border border-gray-700"
        {...props}
        alt={props.alt || "Image"}
      />
    ),
    code({
      inline,
      className,
      children,
      ...props
    }: {
      node?: unknown;
      inline?: boolean;
      className?: string;
      children: React.ReactNode;
    }) {
      const match = /language-(\w+)/.exec(className || "");
      const code = String(children).replace(/\n$/, "");

      if (!inline && (match || code.includes("\n"))) {
        const language = detectLanguage(code, match?.[1]);
        return (
          <div className="relative group my-4">
            <div className="absolute top-0 right-0 bg-gray-800 text-xs text-gray-400 px-2 py-1 rounded-bl">
              {language}
            </div>
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={language}
              PreTag="div"
              className="rounded-md border border-gray-700 !bg-gray-850"
              showLineNumbers={code.split("\n").length > 5}
              {...props}
            >
              {code}
            </SyntaxHighlighter>
            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleCopyCode(code)}
                className="text-white bg-gray-700 hover:bg-gray-600 p-2 rounded shadow-lg"
                title="Copy code to clipboard"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={() => handleApplyCode(code)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded shadow-lg"
                title="Apply code to editor"
              >
                <Code2 size={16} />
              </button>
            </div>
          </div>
        );
      }
      return (
        <code
          className="bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded font-mono text-sm"
          {...props}
        >
          {children}
        </code>
      );
    },
  };

  const { processedContent, thinkBlocks } = processContent(message.content);

  // Replace placeholders with ThinkBlock components
  const renderContent = () => {
    let parts = processedContent.split(/(__THINK_BLOCK_\d+__)/);

    return parts.map((part, index) => {
      const match = part.match(/__THINK_BLOCK_(\d+)__/);
      if (match) {
        const blockIndex = parseInt(match[1], 10);
        return (
          <ThinkBlock
            key={`think-${index}`}
            content={thinkBlocks[blockIndex]}
            components={markdownComponents}
          />
        );
      }
      return part ? (
        <ReactMarkdown key={`text-${index}`} components={markdownComponents}>
          {part}
        </ReactMarkdown>
      ) : null;
    });
  };

  return (
    <div
      className={`p-4 rounded-lg shadow-md border border-gray-700 ${
        message.role === "assistant"
          ? "bg-gray-900 text-gray-300"
          : "bg-gray-800 text-gray-200"
      }`}
    >
      <div className="max-w-3xl mx-auto">
        <div className="font-medium mb-2 text-sm text-gray-400">
          {message.role === "assistant" ? "AI Assistant" : "You"}
        </div>
        <div className="prose prose-sm max-w-none text-gray-300">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
