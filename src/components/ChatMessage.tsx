import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";
import ThoughtBlock from "./ThoughtBlock";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  messageIndex: number;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  messageIndex,
}) => {
  const processContent = useMemo(() => {
    if (typeof content !== "string") return content;

    // Clean up the content first
    const cleanContent = content
      // Remove multiple consecutive horizontal rules
      .replace(/(\n-{3,}|\n\*{3,}|\n_{3,})\n+(?=\n-{3,}|\n\*{3,}|\n_{3,})/g, "")
      // Ensure proper spacing around horizontal rules
      .replace(/(\n-{3,}|\n\*{3,}|\n_{3,})/g, "\n\n---\n\n")
      // Remove extra newlines
      .replace(/\n{3,}/g, "\n\n");

    // Split content by think tags first
    const parts = [];
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    let lastIndex = 0;
    let match;

    // If no think tags present, return the cleaned content
    if (!/<think>/g.test(cleanContent)) {
      return cleanContent;
    }

    while ((match = thinkRegex.exec(cleanContent)) !== null) {
      // Add text before the think tag as markdown
      if (match.index > lastIndex) {
        const beforeText = cleanContent.slice(lastIndex, match.index).trim();
        if (beforeText) {
          parts.push(beforeText);
        }
      }

      // Add the think block
      const thoughtContent = match[1].trim();
      if (thoughtContent) {
        parts.push(
          <ThoughtBlock
            key={`think-${messageIndex}-${match.index}`}
            content={thoughtContent}
            messageIndex={messageIndex}
            matchIndex={match.index}
          />
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text after the last think tag
    if (lastIndex < cleanContent.length) {
      const afterText = cleanContent.slice(lastIndex).trim();
      if (afterText) {
        parts.push(afterText);
      }
    }

    return parts;
  }, [content, messageIndex]);

  const renderMarkdown = (text: string) => {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    );
  };

  const components: Partial<Components> = {
    code(props) {
      const { className, children } = props;
      if (!children) return null;

      const match = /language-(\w+)/.exec(className || "");
      const lang = match ? match[1] : undefined;
      const code = String(children).replace(/\n$/, "");

      // Check if this code block is inside a pre (block code)
      const isInPre = props.node?.position?.start?.column === 1;

      if (!isInPre) {
        return (
          <code className="bg-gray-800/60 px-1.5 py-0.5 rounded-md text-[0.9em] font-mono text-gray-200">
            {children}
          </code>
        );
      }

      return code;
    },
    pre(props) {
      const { children } = props;
      if (!children) return null;

      const childArray = React.Children.toArray(children);
      const codeElement = childArray[0];

      if (React.isValidElement(codeElement)) {
        const code = String(codeElement.props.children || "");
        const className = codeElement.props.className || "";
        const match = /language-(\w+)/.exec(className);
        const lang = match ? match[1] : undefined;

        return <CodeBlock code={code} language={lang} inline={false} />;
      }

      return <pre className="whitespace-pre-wrap">{children}</pre>;
    },
    hr(props) {
      return <hr className="my-4 border-t border-gray-700" />;
    },
    p(props) {
      const { children } = props;

      // Don't wrap pre elements or empty paragraphs in paragraphs
      const childArray = React.Children.toArray(children);
      if (childArray.length === 0) return null;

      if (childArray.length === 1) {
        if (React.isValidElement(childArray[0])) {
          const element = childArray[0];
          if (element.type === "pre" || element.type === "hr") {
            return children;
          }
        } else if (typeof childArray[0] === "string" && !childArray[0].trim()) {
          return null;
        }
      }

      return (
        <p className="text-gray-200 leading-7 mb-4 text-[15px] whitespace-pre-wrap">
          {children}
        </p>
      );
    },
    h1(props) {
      return (
        <h1 className="text-2xl font-semibold text-white mt-8 mb-4">
          {props.children}
        </h1>
      );
    },
    h2(props) {
      return (
        <h2 className="text-xl font-semibold text-white mt-6 mb-3">
          {props.children}
        </h2>
      );
    },
    h3(props) {
      return (
        <h3 className="text-lg font-semibold text-white mt-5 mb-2">
          {props.children}
        </h3>
      );
    },
    ul(props) {
      return (
        <ul className="list-disc list-outside space-y-1.5 mb-4 ml-4 text-[15px]">
          {props.children}
        </ul>
      );
    },
    ol(props) {
      return (
        <ol className="list-decimal list-outside space-y-1.5 mb-4 ml-4 text-[15px]">
          {props.children}
        </ol>
      );
    },
    li(props) {
      return <li className="text-gray-200 pl-1.5">{props.children}</li>;
    },
    blockquote(props) {
      return (
        <blockquote className="border-l-4 border-gray-700 pl-4 py-1 italic text-gray-300 my-4 bg-gray-800/30 rounded-r-lg">
          {props.children}
        </blockquote>
      );
    },
    a(props) {
      const { href, children } = props;
      return (
        <a
          href={href}
          className="text-blue-400 hover:text-blue-300 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <span className="font-medium">
          {role === "user" ? "You" : "Assistant"}
        </span>
      </div>
      <div
        className={`p-4 rounded-lg ${
          role === "user"
            ? "bg-[#1D1E20] text-white"
            : "bg-[#1D1E20] text-gray-100"
        }`}
      >
        {Array.isArray(processContent)
          ? processContent.map((part, index) =>
              typeof part === "string" ? (
                <div key={`md-${index}`} className="markdown-content">
                  {renderMarkdown(part)}
                </div>
              ) : (
                <React.Fragment key={`fragment-${index}`}>
                  {part}
                </React.Fragment>
              )
            )
          : renderMarkdown(processContent)}
      </div>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(ChatMessage);
