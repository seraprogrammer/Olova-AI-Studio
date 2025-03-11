import React, { useState } from "react";
import { ChevronDown, ChevronRight, BrainCircuit } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";

interface ThoughtBlockProps {
  content: string;
  messageIndex: number;
  matchIndex: number;
  initialCollapsed?: boolean;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

const ThoughtBlock: React.FC<ThoughtBlockProps> = ({
  content,
  messageIndex,
  matchIndex,
  initialCollapsed = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const thoughtKey = `${messageIndex}-${matchIndex}`;

  return (
    <div className="my-4">
      <div className="rounded-lg overflow-hidden backdrop-blur-md bg-gray-800/30 border border-gray-700/50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full px-4 py-3 flex items-center gap-2 text-gray-200 hover:bg-gray-700/30 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-purple-400" />
            <span className="font-medium">Thinking Process</span>
          </div>
        </button>
        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            isCollapsed ? "max-h-0 py-0" : "max-h-[1000px] py-3"
          }`}
        >
          <div
            className={`px-4 border-t border-gray-700/50 text-gray-300 text-sm ${
              isCollapsed ? "hidden" : "block"
            }`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({
                  inline,
                  className,
                  children,
                  ...props
                }: CodeProps) => {
                  const language = className
                    ? className.replace("language-", "")
                    : undefined;
                  return (
                    <CodeBlock
                      code={String(children)}
                      language={language}
                      inline={!!inline}
                      {...props}
                    />
                  );
                },
                p: ({ children }) => (
                  <p className="text-gray-200 leading-7 mb-4 text-[15px]">
                    {children}
                  </p>
                ),
                h1: ({ children }) => (
                  <h1 className="text-2xl font-semibold text-white mt-8 mb-4">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-white mt-6 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-white mt-5 mb-2">
                    {children}
                  </h3>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-outside space-y-1.5 mb-4 ml-4 text-[15px]">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-outside space-y-1.5 mb-4 ml-4 text-[15px]">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-200 pl-1.5">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-700 pl-4 py-1 italic text-gray-300 my-4 bg-gray-800/30 rounded-r-lg">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThoughtBlock;
