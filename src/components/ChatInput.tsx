import React, { useRef, useEffect, useState } from "react";
import { Send, Loader2, Paperclip, Search, BrainCircuit } from "lucide-react";
import ModelSelector from "./ModelSelector";

interface Model {
  id: string;
  name: string;
}

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  isLoading: boolean;
  isSearching: boolean;
  selectedModel: string;
  models: Model[];
  isModelMenuOpen: boolean;
  setIsModelMenuOpen: (isOpen: boolean) => void;
  setSelectedModel: (modelId: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSearch: () => void;
  onThinkClick: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  message,
  setMessage,
  isLoading,
  isSearching,
  selectedModel,
  models,
  isModelMenuOpen,
  setIsModelMenuOpen,
  setSelectedModel,
  onSubmit,
  onSearch,
  onThinkClick,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loadingTime, setLoadingTime] = useState(0);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [activeButton, setActiveButton] = useState<"search" | "think" | null>(
    null
  );

  useEffect(() => {
    if (isLoading) {
      setLoadingTime(0);
      loadingTimerRef.current = setTimeout(() => {
        setLoadingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      setLoadingTime(0);
    }
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [isLoading]);

  const handleSearchClick = () => {
    if (activeButton === "search") {
      setActiveButton(null);
    } else {
      setActiveButton("search");
      onSearch();
    }
  };

  const handleThinkClick = () => {
    if (activeButton === "think") {
      setActiveButton(null);
    } else {
      setActiveButton("think");
      onThinkClick();
    }
  };

  // Reset active button when loading/searching is complete
  useEffect(() => {
    if (!isLoading && !isSearching) {
      setActiveButton(null);
    }
  }, [isLoading, isSearching]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    } else if (e.key === "Enter" && (e.ctrlKey || e.shiftKey)) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      setMessage(message.substring(0, start) + "\n" + message.substring(end));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center w-full">
      <div className="relative w-full px-2 pb-3 sm:pb-4">
        <form
          onSubmit={onSubmit}
          className="bottom-0 w-full text-base flex flex-col gap-2 items-center justify-center relative z-20"
        >
          <div className="flex flex-row gap-2 justify-center w-full relative">
            <div className="duration-100 relative w-full max-w-[50rem] ring-1 ring-gray-700 ring-inset overflow-hidden bg-[#1D1E23] hover:ring-gray-600 focus-within:ring-1 focus-within:ring-emerald-400 hover:focus-within:ring-emerald-400 focus-within:outline-none outline-none pb-12 px-2 sm:px-3 rounded-3xl shadow-lg">
              <div className="relative z-10">
                <span className="absolute px-2 sm:px-3 py-5 text-gray-400 pointer-events-none">
                  {message.length === 0 && "How can I help?"}
                </span>
                <textarea
                  ref={textareaRef}
                  dir="auto"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="w-full px-2 sm:px-3 pt-5 mb-5 bg-transparent focus:outline-none outline-none text-white align-bottom resize-none transition-all duration-200"
                  style={{ height: "44px", maxHeight: "200px" }}
                />
              </div>
              <div className="flex gap-1.5 absolute inset-x-0 bottom-0 border-2 border-transparent p-2 sm:p-3 max-w-full">
                <button
                  type="button"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex grow gap-1.5 max-w-full">
                  <div className="grow flex gap-1.5 max-w-full">
                    <button
                      type="button"
                      onClick={handleSearchClick}
                      disabled={isLoading}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-gray-200 transition-all duration-300 border ${
                        activeButton === "search"
                          ? "bg-emerald-600/20 border-emerald-500 text-emerald-400 scale-105"
                          : "hover:bg-gray-800 border-gray-700"
                      }`}
                    >
                      <Search
                        className={`w-5 h-5 ${
                          isSearching ? "animate-spin" : ""
                        } ${
                          activeButton === "search"
                            ? "text-emerald-400"
                            : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`${
                          activeButton === "search" ? "text-emerald-400" : ""
                        }`}
                      >
                        DeepSearch
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleThinkClick}
                      disabled={isLoading}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-gray-200 transition-all duration-300 border ${
                        activeButton === "think"
                          ? "bg-blue-600/20 border-blue-500 text-blue-400 scale-105"
                          : "hover:bg-gray-800 border-gray-700"
                      }`}
                    >
                      <BrainCircuit
                        className={`w-5 h-5 ${
                          activeButton === "think"
                            ? "text-blue-400"
                            : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`${
                          activeButton === "think" ? "text-blue-400" : ""
                        }`}
                      >
                        Think
                      </span>
                    </button>
                  </div>
                  <ModelSelector
                    selectedModel={selectedModel}
                    models={models}
                    isOpen={isModelMenuOpen}
                    onToggle={() => setIsModelMenuOpen(!isModelMenuOpen)}
                    onSelect={setSelectedModel}
                  />
                </div>
                <div className="relative">
                  <button
                    type="submit"
                    disabled={isLoading || !message.trim()}
                    className="group flex justify-center items-center h-9 w-9 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                          {loadingTime}s
                        </span>
                      </>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        <div className="absolute bottom-0 w-[calc(100%-1rem)] h-full rounded-t-[40px] bg-[#1D1E20] z-10" />
      </div>
    </div>
  );
};

export default ChatInput;
