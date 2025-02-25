import React, { useState, useRef, useEffect } from "react";
import { Message, Settings } from "./types";
import { Chat } from "./components/Chat";
import { Editor } from "./components/Editor";
import { Header } from "./components/Header";

function App() {
  // Initialize state from localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("chatMessages");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState("");

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem("settings");
    return saved ? JSON.parse(saved) : { model: "deepseek-r1" };
  });

  const [editorContent, setEditorContent] = useState(() => {
    const saved = localStorage.getItem("editorContent");
    return saved || "// Your code here\n";
  });

  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Add state for live code output
  const [liveCodeOutput, setLiveCodeOutput] = useState(() => {
    const saved = localStorage.getItem("liveCodeOutput");
    return saved ? JSON.parse(saved) : false;
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  // Save editor content to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("editorContent", editorContent);
  }, [editorContent]);

  // Save live code output setting to localStorage
  useEffect(() => {
    localStorage.setItem("liveCodeOutput", JSON.stringify(liveCodeOutput));
  }, [liveCodeOutput]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Function to set up the event listener
    const setupEventListener = () => {
      const editor = document.querySelector<HTMLDivElement>(".monaco-editor");
      if (editor) {
        const handleAddCode = (event: Event) => {
          const customEvent = event as CustomEvent;
          console.log("Received addCode event", customEvent.detail);

          // Make sure we have the code to add
          if (customEvent.detail) {
            setEditorContent((prev) => {
              const newCode = customEvent.detail;

              // Check if editor is empty or has default content
              if (prev.trim() === "" || prev.trim() === "// Your code here") {
                return newCode;
              } else {
                // Add two newlines before the new code for better separation
                return `${prev}\n\n${newCode}`;
              }
            });

            console.log("Code successfully added to editor");
          } else {
            console.error("No code received in addCode event");
          }
        };

        // Remove any existing listener first to prevent duplicates
        editor.removeEventListener("addCode", handleAddCode);

        // Add the listener
        editor.addEventListener("addCode", handleAddCode);
        console.log("Added addCode event listener to editor");

        return () => {
          editor.removeEventListener("addCode", handleAddCode);
          console.log("Removed addCode event listener from editor");
        };
      } else {
        console.warn("Monaco editor not found, will retry");
        return null;
      }
    };

    // Try to set up the listener immediately
    let cleanup = setupEventListener();

    // If the editor wasn't found, try again after a short delay
    if (!cleanup) {
      const timerId = setTimeout(() => {
        cleanup = setupEventListener();

        // If still not found, try one more time with a longer delay
        if (!cleanup) {
          const secondTimerId = setTimeout(() => {
            cleanup = setupEventListener();
          }, 2000);

          return () => {
            clearTimeout(secondTimerId);
            if (cleanup) cleanup();
          };
        }
      }, 1000);

      return () => {
        clearTimeout(timerId);
        if (cleanup) cleanup();
      };
    }

    return cleanup;
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://chat-io-f25j.onrender.com/chat_stream",
        {
          method: "POST",
          mode: "cors",
          credentials: "omit",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            message: input,
            model: settings.model,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullResponse += chunk;

        setMessages([
          ...newMessages,
          { role: "assistant", content: fullResponse },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble connecting to the server. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    // Clear only the current chat messages
    setMessages([]);
    setInput("");
  };

  const handleClearHistory = () => {
    // Clear all data from localStorage
    localStorage.clear();

    // Reset all state to defaults
    setMessages([]);
    setInput("");
    setEditorContent("");
    setSettings({
      model: "gpt-3.5-turbo", // or whatever your default is
      temperature: 0.7,
      // other default settings
    });
    setLiveCodeOutput(false);

    // You might want to reload the page to ensure everything is reset
    // window.location.reload();
  };

  return (
    <div className="h-screen flex flex-col">
      <Header
        settings={settings}
        onSaveSettings={setSettings}
        liveCodeOutput={liveCodeOutput}
        onToggleLiveCodeOutput={() => setLiveCodeOutput(!liveCodeOutput)}
        onClearChat={handleClearChat}
        onClearHistory={handleClearHistory}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-2/6 border-r">
          <Chat
            messages={messages}
            input={input}
            isLoading={isLoading}
            onSend={handleSend}
            onInputChange={setInput}
            chatContainerRef={chatContainerRef}
          />
        </div>

        <div className="w-3/4">
          <Editor
            content={editorContent}
            onChange={(value) => setEditorContent(value || "")}
            liveCodeOutput={liveCodeOutput}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
