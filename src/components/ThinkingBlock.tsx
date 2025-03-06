import React from "react";

interface ThinkingBlockProps {
  content: string;
}

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({ content }) => {
  return (
    <div className="thinking-block">
      <div className="thinking-content">
        {content.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
};
