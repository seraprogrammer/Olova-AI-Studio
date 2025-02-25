import React, { useState, useEffect } from "react";
import Groq from "groq-sdk";
import { Settings } from "../types";
import { SettingsModal } from "./Settings";
import { ProblemGenerator } from "./ProblemGenerator";

interface HeaderProps {
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
  liveCodeOutput: boolean;
  onToggleLiveCodeOutput: () => void;
  onClearChat: () => void;
  onClearHistory: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  groqApiKey: string;
  setGroqApiKey: (key: string) => void;
  onSolveProblem?: (problem: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onSaveSettings,
  liveCodeOutput,
  onToggleLiveCodeOutput,
  onClearChat,
  onClearHistory,
  apiKey,
  setApiKey,
  groqApiKey,
  setGroqApiKey,
  onSolveProblem,
}) => {
  const [showApiModal, setShowApiModal] = useState(false);
  const [inputApiKey, setInputApiKey] = useState(apiKey);
  const [inputGroqApiKey, setInputGroqApiKey] = useState(groqApiKey);
  const [showProblemSidebar, setShowProblemSidebar] = useState(false);

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("geminiApiKey");
    const savedGroqApiKey = localStorage.getItem("groqApiKey");

    if (savedApiKey && !apiKey) {
      setApiKey(savedApiKey);
      setInputApiKey(savedApiKey);
    }

    if (savedGroqApiKey && !groqApiKey) {
      setGroqApiKey(savedGroqApiKey);
      setInputGroqApiKey(savedGroqApiKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    // Save to state
    setApiKey(inputApiKey);
    setGroqApiKey(inputGroqApiKey);

    // Save to localStorage
    localStorage.setItem("geminiApiKey", inputApiKey);
    localStorage.setItem("groqApiKey", inputGroqApiKey);

    setShowApiModal(false);
  };

  return (
    <>
      <header className="bg-gray-900 text-white px-6 py-2 flex items-center justify-between shadow-lg border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 2L19 21H5L12 2z"
            />
          </svg>
          <h1 className="text-lg font-semibold tracking-wide">Code Master</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onClearChat}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm bg-gray-800 text-gray-300 hover:bg-gray-700"
            title="Clear Chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>Clear Chat</span>
          </button>

          <button
            onClick={onClearHistory}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm bg-gray-800 text-gray-300 hover:bg-gray-700"
            title="Clear All History"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
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
            <span>Clear History</span>
          </button>

          <button
            onClick={onToggleLiveCodeOutput}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
              liveCodeOutput
                ? "bg-green-700 text-white hover:bg-green-600"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <span className="text-xs">{liveCodeOutput ? "▶" : "▶"}</span>
            <span>
              {liveCodeOutput ? "Live Output: On" : "Live Output: Off"}
            </span>
          </button>

          <span className="flex items-center gap-2 px-3 py-1.5 rounded text-sm bg-gray-800 text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>{settings.model}</span>
          </span>

          <SettingsModal settings={settings} onSave={onSaveSettings} />

          <div className="flex items-center">
            <button
              onClick={() => setShowApiModal(true)}
              className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              {apiKey && groqApiKey ? "Change API Keys" : "Set API Keys"}
            </button>
          </div>

          <button
            onClick={() => setShowProblemSidebar(true)}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Solve Problem
          </button>
        </div>

        {/* API Key Modal */}
        {showApiModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1e1e1e] rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
              <h3 className="text-xl text-white mb-4">Set API Keys</h3>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2 text-sm">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  className="w-full bg-[#252526] text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your Gemini API Key"
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Get your key at{" "}
                  <a
                    href="https://ai.google.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2 text-sm">
                  Groq API Key
                </label>
                <input
                  type="password"
                  className="w-full bg-[#252526] text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your Groq API Key"
                  value={inputGroqApiKey}
                  onChange={(e) => setInputGroqApiKey(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Get your key at{" "}
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Groq Console
                  </a>
                </p>
              </div>

              <div className="mb-4 text-sm text-gray-400">
                <p className="text-yellow-400">
                  Note: Keep your API keys secure and never share them publicly.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowApiModal(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save API Keys
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Problem Generator Component */}
      <ProblemGenerator
        groqApiKey={groqApiKey}
        onSolveProblem={onSolveProblem}
        showProblemSidebar={showProblemSidebar}
        setShowProblemSidebar={setShowProblemSidebar}
      />
    </>
  );
};

// Simple markdown to HTML converter function
function markdownToHtml(markdown: string): string {
  // Convert code blocks
  let html = markdown.replace(
    /```(\w*)([\s\S]*?)```/g,
    '<pre><code class="language-$1">$2</code></pre>'
  );

  // Convert inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Convert headers
  html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");

  // Convert bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Convert lists
  html = html.replace(/^\s*\d+\.\s+(.*$)/gm, "<li>$1</li>");
  html = html.replace(/^\s*\*\s+(.*$)/gm, "<li>$1</li>");

  // Wrap adjacent list items in ul/ol tags
  html = html.replace(/<li>.*?<\/li>(\s*<li>.*?<\/li>)*/g, "<ul>$&</ul>");

  // Convert paragraphs (must be done last)
  html = html.replace(/^(?!<[a-z])(.*$)/gm, "<p>$1</p>");

  return html;
}
