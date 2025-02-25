import React from "react";
import { Message } from "../types";
import { ChatMessage } from "./ChatMessage";
import { Send } from "lucide-react";

interface ChatProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  onSend: () => void;
  onInputChange: (value: string) => void;
  chatContainerRef: React.RefObject<HTMLDivElement>;
}

export const Chat: React.FC<ChatProps> = ({
  messages,
  input,
  isLoading,
  onSend,
  onInputChange,
  chatContainerRef,
}) => {
  return (
    <div className="flex flex-col h-full bg-black text-white shadow-2xl border border-gray-700 rounded-lg">
      <div
        ref={chatContainerRef}
        className="chat-messages flex-1 overflow-y-auto p-4 space-y-2 bg-gray-900 rounded-t-lg"
      >
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-950 rounded-b-lg">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button
            onClick={onSend}
            className={`p-2 bg-purple-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-purple-700"
            }`}
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
