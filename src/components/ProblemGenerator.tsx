import React, { useState } from "react";
import Groq from "groq-sdk";

interface ProblemGeneratorProps {
  groqApiKey: string;
  onSolveProblem?: (problem: string) => void;
  showProblemSidebar: boolean;
  setShowProblemSidebar: (show: boolean) => void;
}

export const ProblemGenerator: React.FC<ProblemGeneratorProps> = ({
  groqApiKey,
  onSolveProblem,
  showProblemSidebar,
  setShowProblemSidebar,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );
  const [problem, setProblem] = useState<string>("");

  const generateProblem = async (difficulty: string) => {
    if (!groqApiKey) {
      alert("Please set your Groq API key first");
      return;
    }

    setIsLoading(true);
    setSelectedDifficulty(difficulty);

    try {
      const groq = new Groq({
        apiKey: groqApiKey,
        dangerouslyAllowBrowser: true,
      });

      const prompt = `Generate a ${difficulty} level vanilla JavaScript coding problem. 
      The problem should:
      1. Be solvable without any external libraries or frameworks
      2. Include a clear problem statement
      3. Provide example inputs and expected outputs
      4. Include hints (optional)
      5. Format the response using markdown with proper code highlighting
      
      For ${difficulty} difficulty:
      - Easy: Basic concepts like variables, loops, conditionals, and simple functions
      - Medium: More complex algorithms, array methods, and intermediate concepts
      - Hard: Advanced algorithms, optimization problems, and complex data structures
      
      Please provide ONLY the problem, no solutions.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "qwen-2.5-coder-32b",
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
      });

      const generatedProblem =
        chatCompletion.choices[0]?.message?.content ||
        "Failed to generate problem";
      setProblem(generatedProblem);

      if (onSolveProblem) {
        onSolveProblem(generatedProblem);
      }
    } catch (error) {
      console.error("Error generating problem:", error);
      setProblem(
        "Error generating problem. Please check your API key and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-1/3 bg-[#1e1e1e] border-r border-gray-700 shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
        showProblemSidebar ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-white font-semibold">
            JavaScript Problems
          </h2>
          <button
            onClick={() => setShowProblemSidebar(false)}
            className="text-gray-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6">
          <button
            onClick={() => generateProblem("easy")}
            className={`p-3 rounded text-white ${
              isLoading && selectedDifficulty === "easy"
                ? "bg-green-800 opacity-75"
                : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={isLoading}
          >
            {isLoading && selectedDifficulty === "easy"
              ? "Generating..."
              : "Easy"}
          </button>

          <button
            onClick={() => generateProblem("medium")}
            className={`p-3 rounded text-white ${
              isLoading && selectedDifficulty === "medium"
                ? "bg-yellow-700 opacity-75"
                : "bg-yellow-600 hover:bg-yellow-700"
            }`}
            disabled={isLoading}
          >
            {isLoading && selectedDifficulty === "medium"
              ? "Generating..."
              : "Medium"}
          </button>

          <button
            onClick={() => generateProblem("hard")}
            className={`p-3 rounded text-white ${
              isLoading && selectedDifficulty === "hard"
                ? "bg-red-800 opacity-75"
                : "bg-red-600 hover:bg-red-700"
            }`}
            disabled={isLoading}
          >
            {isLoading && selectedDifficulty === "hard"
              ? "Generating..."
              : "Hard"}
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-[#252526] rounded p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : problem ? (
            <div className="prose prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: markdownToHtml(problem) }}
              />
            </div>
          ) : (
            <div className="text-gray-400 text-center h-full flex items-center justify-center">
              <p>Select a difficulty level to generate a JavaScript problem</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced markdown to HTML converter function
function markdownToHtml(markdown: string): string {
  if (!markdown) return "";

  // Process the markdown in a specific order to avoid conflicts

  // 1. Escape HTML characters to prevent injection
  let html = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. Convert code blocks with syntax highlighting
  html = html.replace(/```(\w*)([\s\S]*?)```/g, (match, language, code) => {
    const lang = language || "javascript";
    return `<pre class="bg-[#1e1e1e] rounded-md p-4 overflow-x-auto"><code class="language-${lang} text-sm">${code.trim()}</code></pre>`;
  });

  // 3. Convert inline code with better styling
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-[#2d2d2d] px-1.5 py-0.5 rounded text-yellow-300 font-mono text-sm">$1</code>'
  );

  // 4. Process headers (from largest to smallest to avoid conflicts)
  html = html.replace(
    /^# (.*$)/gm,
    '<h1 class="text-3xl font-bold mt-8 mb-5 text-blue-100">$1</h1>'
  );
  html = html.replace(
    /^## (.*$)/gm,
    '<h2 class="text-2xl font-bold mt-7 mb-4 text-blue-200">$1</h2>'
  );
  html = html.replace(
    /^### (.*$)/gm,
    '<h3 class="text-xl font-bold mt-6 mb-3 text-blue-300">$1</h3>'
  );
  html = html.replace(
    /^#### (.*$)/gm,
    '<h4 class="text-lg font-bold mt-5 mb-2 text-blue-400">$1</h4>'
  );
  html = html.replace(
    /^##### (.*$)/gm,
    '<h5 class="text-base font-bold mt-4 mb-2 text-blue-500">$1</h5>'
  );

  // 5. Convert horizontal rules
  html = html.replace(/^\s*---+\s*$/gm, '<hr class="my-6 border-gray-600" />');

  // 6. Convert blockquotes with better styling
  html = html.replace(
    /^\s*>\s*(.*$)/gm,
    '<blockquote class="pl-4 border-l-4 border-gray-500 text-gray-300 italic my-4">$1</blockquote>'
  );

  // 7. Process lists
  // Convert ordered lists
  const processOrderedLists = (text: string): string => {
    const lines = text.split("\n");
    let inList = false;
    let listContent = "";
    let result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^\s*(\d+)\.\s+(.*$)/);

      if (match) {
        if (!inList) {
          inList = true;
          listContent = `<ol class="list-decimal pl-8 my-4 space-y-2">\n<li class="text-gray-200">${match[2]}</li>`;
        } else {
          listContent += `\n<li class="text-gray-200">${match[2]}</li>`;
        }
      } else if (inList) {
        inList = false;
        listContent += "\n</ol>";
        result.push(listContent);
        result.push(line);
      } else {
        result.push(line);
      }
    }

    if (inList) {
      listContent += "\n</ol>";
      result.push(listContent);
    }

    return result.join("\n");
  };

  // Convert unordered lists
  const processUnorderedLists = (text: string): string => {
    const lines = text.split("\n");
    let inList = false;
    let listContent = "";
    let result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^\s*[-*]\s+(.*$)/);

      if (match) {
        if (!inList) {
          inList = true;
          listContent = `<ul class="list-disc pl-8 my-4 space-y-2">\n<li class="text-gray-200">${match[1]}</li>`;
        } else {
          listContent += `\n<li class="text-gray-200">${match[1]}</li>`;
        }
      } else if (inList) {
        inList = false;
        listContent += "\n</ul>";
        result.push(listContent);
        result.push(line);
      } else {
        result.push(line);
      }
    }

    if (inList) {
      listContent += "\n</ul>";
      result.push(listContent);
    }

    return result.join("\n");
  };

  html = processOrderedLists(html);
  html = processUnorderedLists(html);

  // 8. Convert text formatting (bold, italic)
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="text-yellow-200">$1</strong>'
  );
  html = html.replace(/\*(.*?)\*/g, '<em class="text-green-200">$1</em>');

  // 9. Convert links with better styling
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>'
  );

  // 10. Convert paragraphs (must be done last)
  // First, identify lines that aren't already HTML elements
  html = html
    .split("\n")
    .map((line) => {
      // Skip lines that start with HTML tags or are empty
      if (/^\s*<\/?[a-z].*>|^\s*$/.test(line)) {
        return line;
      }
      return `<p class="my-3 text-gray-200">${line}</p>`;
    })
    .join("\n");

  // 11. Fix any empty paragraphs
  html = html.replace(/<p class="my-3 text-gray-200">\s*<\/p>/g, "");

  return html;
}
