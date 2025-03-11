import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import Welcome from "./Welcome";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import SettingsModal from "./SettingsModal";

// Types
interface SearchHistoryItem {
  role: string;
  parts: Array<{ text: string }>;
}

// Initialize Google AI
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const systemPrompt = `You are a Google search engine with the ability to fetch up-to-date data from the web. Your task is to provide concise and accurate answers to user queries based on the most current information available. Always include direct URLs to trustworthy and authoritative sources in your response. These links should be presented in a clear format, such as a list at the end of your answer.`;

const searchModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-001",
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    topK: 30,
    maxOutputTokens: 8192,
  },
}) as GenerativeModel;

const models = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "o3-mini", name: "O3 Mini" },
  { id: "mixtral-8x22b", name: "Mixtral 8x22B" },
  { id: "mixtral-small-24b", name: "Mixtral Small 24B" },
  { id: "mixtral-small-28b", name: "Mixtral Small 28B" },
  { id: "hermes-2-dpo", name: "Hermes 2 DPO" },
  { id: "phi-4", name: "Phi 4" },
  { id: "wizardlm-2-7b", name: "WizardLM 2 7B" },
  { id: "wizardlm-2-8x22b", name: "WizardLM 2 8x22B" },
  { id: "claude-3-haiku", name: "Claude 3 Haiku" },
  { id: "blackboxai", name: "Blackbox AI" },
  { id: "blackboxai-pro", name: "Blackbox AI Pro" },
  { id: "command-r", name: "Command R" },
  { id: "command-r-plus", name: "Command R Plus" },
  { id: "command-r7b", name: "Command R 7B" },
  { id: "qwen-2-72b", name: "Qwen 2 72B" },
  { id: "qwq-32b", name: "QWQ 32B" },
  { id: "qvq-72b", name: "QVQ 72B" },
  { id: "deepseek-chat", name: "DeepSeek Chat" },
  { id: "deepseek-v3", name: "DeepSeek V3" },
  { id: "deepseek-r1", name: "DeepSeek R1" },
  { id: "dbrx-instruct", name: "DBRX Instruct" },
  { id: "glm-4", name: "GLM 4" },
  { id: "airoboros-70b", name: "Airoboros 70B" },
  { id: "lzlv-70b", name: "LZLV 70B" },
  { id: "tulu-3-405b", name: "Tulu 3 405B" },
  { id: "sd-3-5", name: "SD 3.5" },
  { id: "flux", name: "Flux" },
];

function Chat() {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("phi-4");
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >(() => {
    // Initialize chatHistory from localStorage if available
    const savedHistory = localStorage.getItem("chatHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const newMessage = { role: "user" as const, content: message };
    setChatHistory((prev) => [...prev, newMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const conversation = chatHistory
        .concat(newMessage)
        .map(
          (msg) =>
            `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
        )
        .join("\n");

      const response = await fetch(
        "https://seraprogrammerio-production.up.railway.app/chat_stream",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: conversation,
            model: selectedModel,
          }),
        }
      );

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { role: "assistant" as const, content: "" };

      setChatHistory((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage.content += chunk;

        setChatHistory((prev) => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { ...assistantMessage };
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Could not connect to server" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!message.trim() || isSearching) return;

    setIsSearching(true);
    try {
      // Add query to history
      const newQuery = { role: "user", parts: [{ text: message }] };
      setSearchHistory((prev) => [...prev, newQuery]);

      // Start chat session with history
      const chatSession = searchModel.startChat({
        history: searchHistory,
      });

      // Send message and get response
      const result = await chatSession.sendMessage(message);
      const response = await result.response;
      const responseText = response.text();

      // Add response to histories
      setSearchHistory((prev) => [
        ...prev,
        { role: "model", parts: [{ text: responseText }] },
      ]);
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: responseText },
      ]);

      // Clear message
      setMessage("");
    } catch (error) {
      console.error("Search error:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: message },
        {
          role: "assistant",
          content: "Error: Could not perform search. Please try again.",
        },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleThinkClick = () => {
    setSelectedModel("deepseek-r1");
  };

  const clearHistory = () => {
    setChatHistory([]);
    localStorage.removeItem("chatHistory");
    setIsSettingsOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#1D1E20] flex flex-col">
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearHistory={clearHistory}
      />

      <main className="flex-1 overflow-hidden pb-[180px] relative">
        <div className="max-w-4xl mx-auto h-full flex flex-col relative">
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors shadow-lg"
              aria-label="Open settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-custom p-6 space-y-8">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <Welcome />
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <ChatMessage
                  key={index}
                  role={msg.role}
                  content={msg.content}
                  messageIndex={index}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <ChatInput
        message={message}
        setMessage={setMessage}
        isLoading={isLoading}
        isSearching={isSearching}
        selectedModel={selectedModel}
        models={models}
        isModelMenuOpen={isModelMenuOpen}
        setIsModelMenuOpen={setIsModelMenuOpen}
        setSelectedModel={setSelectedModel}
        onSubmit={handleSubmit}
        onSearch={handleSearch}
        onThinkClick={handleThinkClick}
      />
    </div>
  );
}

export default Chat;
