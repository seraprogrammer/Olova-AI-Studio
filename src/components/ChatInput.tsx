import React, { useRef, useEffect } from "react";
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
      // Set cursor position after the new line
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
            <div className="duration-100 relative w-full max-w-[50rem] ring-1 ring-gray-700 ring-inset overflow-hidden bg-[#1D1E23] hover:ring-gray-600 focus-within:ring-1 focus-within:ring-purple-500 hover:focus-within:ring-purple-500 focus-within:outline-none outline-none pb-12 px-2 sm:px-3 rounded-3xl shadow-lg">
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
                      onClick={onSearch}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-gray-200 hover:bg-gray-800 transition-colors border border-gray-700"
                    >
                      <Search
                        className={`w-5 h-5 ${
                          isSearching ? "animate-spin" : ""
                        } text-gray-400`}
                      />
                      <span>DeepSearch</span>
                    </button>
                    <button
                      type="button"
                      onClick={onThinkClick}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-gray-200 hover:bg-gray-800 transition-colors border border-gray-700"
                    >
                      <BrainCircuit className="w-5 h-5 text-gray-400" />
                      <span>Think</span>
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
                <button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="group flex justify-center items-center h-9 w-9 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
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
