import React, { useState, useEffect } from "react";
import { Chat as ChatType } from "./components/types";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Chat } from "./components/Chat";
import "./App.css";

function App() {
  const [chats, setChats] = useState<ChatType[]>(() => {
    const saved = localStorage.getItem("chats");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [selectedModel, setSelectedModel] = useState("blackboxai-pro");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentChat = chats.find((chat) => chat.id === currentChatId) || null;

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSidebarOpen && window.innerWidth < 768) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const createNewChat = () => {
    const newChat: ChatType = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const handleSendMessage = async (message: string) => {
    setIsLoading(true);

    // Create new chat if needed and get its ID
    let chatId = currentChatId;
    if (!chatId) {
      const newChat: ChatType = {
        id: Date.now().toString(),
        title: message.slice(0, 30) + (message.length > 30 ? "..." : ""),
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setChats((prev) => [newChat, ...prev]);
      chatId = newChat.id;
      setCurrentChatId(chatId);
    } else {
      // Update the title of the chat if it's the first message
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === chatId && chat.messages.length === 0) {
            return {
              ...chat,
              title: message.slice(0, 30) + (message.length > 30 ? "..." : ""),
            };
          }
          return chat;
        })
      );
    }

    // Add user message
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, { role: "user", content: message }],
            model: selectedModel,
          };
        }
        return chat;
      })
    );

    try {
      // Define multiple API endpoints to try in order
      const API_URLS = [
        import.meta.env.VITE_API_URL || "https://chat-io-v3p1.onrender.com",
        import.meta.env.VITE_FALLBACK_API_URL ||
          import.meta.env.VITE_FALLBACK_API_URL2 ||
          import.meta.env.VITE_FALLBACK_API_URL3,
      ];

      let response = null;
      let currentUrlIndex = 0;
      let error = null;

      // Try each API URL until one succeeds or we run out of options
      while (response === null && currentUrlIndex < API_URLS.length) {
        const currentUrl = API_URLS[currentUrlIndex];
        try {
          const tempResponse = await fetch(`${currentUrl}/chat_stream`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, model: selectedModel }),
            signal: AbortSignal.timeout(30000), // Increased timeout to 30 seconds
          });

          if (tempResponse.ok && tempResponse.body) {
            response = tempResponse;
          } else {
            throw new Error(`HTTP error! status: ${tempResponse.status}`);
          }
        } catch (err) {
          error = err;
          console.warn(`API endpoint ${currentUrl} failed:`, err);
          currentUrlIndex++;
        }
      }

      if (!response) {
        throw error || new Error("All API endpoints failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let lastUpdateTime = Date.now();
      let readAttempts = 0;
      const maxReadAttempts = 3;

      try {
        while (true) {
          try {
            const { done, value } = await reader.read();
            if (done) break;

            // Reset read attempts on successful read
            readAttempts = 0;

            const chunk = decoder.decode(value);
            accumulatedContent += chunk;

            const currentTime = Date.now();
            if (currentTime - lastUpdateTime > 150) {
              setStreamingContent(accumulatedContent);
              lastUpdateTime = currentTime;
            }
          } catch (readError) {
            console.warn("Read error:", readError);
            readAttempts++;

            // If we've tried too many times, throw the error to be caught by outer catch
            if (
              readAttempts >= maxReadAttempts ||
              readError.name !== "AbortError"
            ) {
              throw readError;
            }

            // For AbortError, wait a bit and try again
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        // Update final response
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    { role: "assistant", content: accumulatedContent },
                  ],
                }
              : chat
          )
        );
      } catch (streamError) {
        console.error("Stream reading error:", streamError);

        // If we have partial content, use it; otherwise show an error message
        const finalContent =
          accumulatedContent.length > 0
            ? accumulatedContent +
              "\n\n[Connection interrupted. Partial response shown.]"
            : "Sorry, the connection was interrupted. Please try again.";

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    { role: "assistant", content: finalContent },
                  ],
                }
              : chat
          )
        );
      }
    } catch (error) {
      console.error("Error:", error);

      // Provide more specific error messages based on error type
      let errorMessage =
        "Sorry, there was an error processing your request. Please try again.";

      if (error.name === "AbortError") {
        errorMessage =
          "The request timed out. The model might be busy - please try again or try a different model.";
      } else if (error.message && error.message.includes("network")) {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { role: "assistant", content: errorMessage },
                ],
              }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
      setStreamingContent("");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#0F1419] text-white overflow-hidden">
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar with slide-in animation */}
      <div
        id="sidebar"
        className={`fixed md:static inset-y-0 left-0 w-72 z-20 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } bg-[#0F1419] border-r border-[#2A2F34]`}
      >
        <Sidebar
          chats={chats}
          currentChatId={currentChatId}
          onNewChat={createNewChat}
          onSelectChat={(id) => {
            setCurrentChatId(id);
            if (window.innerWidth < 768) {
              setIsSidebarOpen(false);
            }
          }}
          onDeleteChat={deleteChat}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full md:w-auto">
        <Header
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <Chat
          currentChat={currentChat}
          isLoading={isLoading}
          streamingContent={streamingContent}
          onSendMessage={handleSendMessage}
          onNewChat={createNewChat}
        />
      </div>
    </div>
  );
}

export default App;
