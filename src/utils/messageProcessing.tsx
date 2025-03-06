import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "../components/CodeBlock";
import { CodeProps } from "../components/types";
import { ThinkingBlock } from "../components/ThinkingBlock";

export const processThinkingContent = (content: string) => {
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
          components={markdownComponents}
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
      components={markdownComponents}
    >
      {formatCodeBlocks(content)}
    </ReactMarkdown>
  );
};

export const formatCodeBlocks = (content: string) => {
  const parts = content.split("```");
  if (parts.length === 1) return content;

  return parts
    .map((part, index) => {
      if (index % 2 === 0) {
        return part;
      } else {
        const firstLineEnd = part.indexOf("\n");
        const language =
          firstLineEnd === -1 ? part : part.slice(0, firstLineEnd);
        const code = firstLineEnd === -1 ? "" : part.slice(firstLineEnd + 1);
        return `\`\`\`${language}\n${code}\n\`\`\``;
      }
    })
    .join("\n\n");
};

export const markdownComponents = {
  p: ({ node, ...props }: any) => <p className="mb-4 last:mb-0" {...props} />,
  ul: ({ node, ...props }: any) => (
    <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="list-decimal ml-6 mb-4 space-y-2" {...props} />
  ),
  li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
  h1: ({ node, ...props }: any) => (
    <h1 className="text-2xl font-bold mb-4" {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="text-xl font-bold mb-3" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="text-lg font-bold mb-2" {...props} />
  ),
  code({ node, inline, className, children, ...props }: CodeProps) {
    const match = /language-(\w+)/.exec(className || "");
    const content = String(children).replace(/\n$/, "");

    if (!inline && (className || content.startsWith("```"))) {
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

    return (
      <code className="bg-[#1A1F24] rounded px-1.5 py-0.5" {...props}>
        {children}
      </code>
    );
  },
};
