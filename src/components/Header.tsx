import React from "react";
import { Settings } from "../types";
import { SettingsModal } from "./Settings";

interface HeaderProps {
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
  liveCodeOutput: boolean;
  onToggleLiveCodeOutput: () => void;
  onClearChat: () => void;
  onClearHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onSaveSettings,
  liveCodeOutput,
  onToggleLiveCodeOutput,
  onClearChat,
  onClearHistory
}) => {
  return (
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
          <span className="text-xs">
            {liveCodeOutput ? "▶" : "▶"}
          </span>
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
      </div>
    </header>
  );
};
