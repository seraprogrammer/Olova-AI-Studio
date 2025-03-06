import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Chat } from "./types";

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}) => {
  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
      <div className="mb-4">
        <button
          onClick={onNewChat}
          className="flex items-center justify-between w-full px-5 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:shadow-emerald-500/30 hover:translate-y-[-1px]"
        >
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            <span>New Chat</span>
          </div>
          <div className="bg-white/20 rounded-full p-1">
            <Plus className="w-3 h-3" />
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`p-3 rounded-lg cursor-pointer flex items-center justify-between group ${
              chat.id === currentChatId ? "bg-[#2A2F34]" : "hover:bg-[#1A1F24]"
            } transition-colors duration-200`}
          >
            <span className="truncate flex-1 text-sm">{chat.title}</span>
            <button
              onClick={(e) => onDeleteChat(chat.id, e)}
              className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity duration-200 ml-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-[#2A2F34] text-xs text-gray-500 text-center">
        <p>Chat AI - v1.0</p>
      </div>
    </div>
  );
};
