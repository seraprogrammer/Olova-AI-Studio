import React, { useState, useRef, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface EditorProps {
  content: string;
  onChange: (value: string | undefined) => void;
  liveCodeOutput: boolean;
  apiKey?: string;
  fontSize?: number;
}

export const Editor: React.FC<EditorProps> = ({
  content,
  onChange,
  liveCodeOutput,
  apiKey,
  fontSize = 14,
}) => {
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [consoleHeight, setConsoleHeight] = useState(200);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const previousContentRef = useRef(content);

  // Add new state for AI modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedCode, setSelectedCode] = useState("");
  const editorRef = useRef<any>(null);

  // Add new state for language switcher - set JavaScript as default
  const [activeLanguage, setActiveLanguage] = useState<
    "javascript" | "html" | "css"
  >("javascript");

  // Initialize state from localStorage with proper references
  const [htmlContent, setHtmlContent] = useState(() => {
    return (
      localStorage.getItem("htmlContent") ||
      "<div>\n  <!-- Your HTML here -->\n  <h1>Hello World</h1>\n</div>"
    );
  });

  const [cssContent, setCssContent] = useState(() => {
    return (
      localStorage.getItem("cssContent") ||
      "/* Your CSS here */\nh1 {\n  color: blue;\n}"
    );
  });

  const [jsContent, setJsContent] = useState(() => {
    // First try to use the content prop, then fall back to localStorage
    return (
      content || localStorage.getItem("jsContent") || "// Your JavaScript here"
    );
  });

  const [showPreview, setShowPreview] = useState(false);

  // Save content to localStorage when it changes - or remove if empty
  useEffect(() => {
    if (htmlContent.trim() === "") {
      localStorage.removeItem("htmlContent");
    } else {
      localStorage.setItem("htmlContent", htmlContent);
    }
  }, [htmlContent]);

  useEffect(() => {
    if (cssContent.trim() === "") {
      localStorage.removeItem("cssContent");
    } else {
      localStorage.setItem("cssContent", cssContent);
    }
  }, [cssContent]);

  useEffect(() => {
    if (jsContent.trim() === "") {
      localStorage.removeItem("jsContent");
    } else {
      localStorage.setItem("jsContent", jsContent);
    }

    // Only call onChange when in JavaScript mode and when the content has actually changed
    if (
      activeLanguage === "javascript" &&
      jsContent !== previousContentRef.current
    ) {
      onChange(jsContent);
      previousContentRef.current = jsContent;
    }
  }, [jsContent, activeLanguage, onChange]);

  // Handle external content changes (like when applying code from chat)
  useEffect(() => {
    if (
      content !== previousContentRef.current &&
      activeLanguage === "javascript"
    ) {
      setJsContent(content);
      previousContentRef.current = content;
    }
  }, [content, activeLanguage]);

  const runCode = () => {
    const logs: string[] = [];
    const originalConsoleLog = console.log;

    try {
      // Override console.log
      (console as any).log = (...args: any[]) => {
        logs.push(
          args
            .map((arg) =>
              typeof arg === "object"
                ? JSON.stringify(arg, null, 2)
                : String(arg)
            )
            .join(" ")
        );
      };

      // Execute the code
      new Function(jsContent)();

      setConsoleOutput(logs);
    } catch (error) {
      setConsoleOutput([...logs, `Error: ${(error as Error).message}`]);
    } finally {
      // Restore original console.log
      console.log = originalConsoleLog;
    }
  };

  // Add effect for live code execution
  useEffect(() => {
    if (liveCodeOutput && jsContent !== previousContentRef.current) {
      const timeoutId = setTimeout(() => {
        runCode();
      }, 1000); // Debounce execution to avoid running on every keystroke

      previousContentRef.current = jsContent;
      return () => clearTimeout(timeoutId);
    }
  }, [jsContent, liveCodeOutput]);

  useEffect(() => {
    const resizeHandle = resizeHandleRef.current;
    if (!resizeHandle) return;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const editorContainer = resizeHandle.parentElement;
      if (!editorContainer) return;

      const containerRect = editorContainer.getBoundingClientRect();
      const availableHeight = containerRect.height;

      // Calculate new height (from bottom of container to mouse position)
      const newHeight = Math.max(
        100,
        Math.min(
          availableHeight * 0.8,
          availableHeight - (e.clientY - containerRect.top)
        )
      );

      setConsoleHeight(newHeight);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    resizeHandle.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      resizeHandle.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Function to handle editor mounting
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // Add context menu for "Edit with AI"
    editor.addAction({
      id: "edit-with-ai",
      label: "Edit with AI",
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.5,
      run: (editor: any) => {
        const selection = editor.getSelection();
        const selectedText = editor.getModel().getValueInRange(selection);
        if (selectedText) {
          setSelectedCode(selectedText);
          setShowAiModal(true);
        }
      },
    });
  };

  // Function to process AI request
  const processAiRequest = async () => {
    if (!apiKey) {
      setConsoleOutput([
        ...consoleOutput,
        "Error: API key not set. Please set your API key in the header.",
      ]);
      setShowAiModal(false);
      return;
    }

    setAiLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      };

      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });

      const prompt = `${aiPrompt}\n\nHere is the code to modify:\n\`\`\`\n${selectedCode}\n\`\`\``;
      const result = await chatSession.sendMessage(prompt);
      const aiResponse = result.response.text();

      // Extract code from response if it contains markdown code blocks
      let modifiedCode = aiResponse;
      const codeBlockRegex = /```(?:[\w]*\n)?([\s\S]*?)```/g;
      const match = codeBlockRegex.exec(aiResponse);
      if (match && match[1]) {
        modifiedCode = match[1].trim();
      }

      // Replace selected text with AI response
      const editor = editorRef.current;
      const selection = editor.getSelection();
      editor.executeEdits("ai-edit", [
        {
          range: selection,
          text: modifiedCode,
        },
      ]);

      setConsoleOutput([...consoleOutput, "AI edit applied successfully"]);
    } catch (error) {
      console.error("AI Error:", error);
      setConsoleOutput([
        ...consoleOutput,
        `AI Error: ${(error as Error).message}`,
      ]);
    } finally {
      setAiLoading(false);
      setShowAiModal(false);
    }
  };

  // Function to handle content change based on active language
  const handleContentChange = (value: string | undefined) => {
    if (value === undefined) return;

    switch (activeLanguage) {
      case "html":
        setHtmlContent(value);
        break;
      case "css":
        setCssContent(value);
        break;
      case "javascript":
        setJsContent(value);
        break;
    }
  };

  // Function to generate preview HTML with default values for empty content
  const generatePreviewHtml = () => {
    const htmlToUse =
      htmlContent.trim() ||
      "<div>\n  <!-- Your HTML here -->\n  <h1>Hello World</h1>\n</div>";
    const cssToUse =
      cssContent.trim() || "/* Your CSS here */\nh1 {\n  color: blue;\n}";
    const jsToUse = jsContent.trim() || "// Your JavaScript here";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssToUse}</style>
        </head>
        <body>
          ${htmlToUse}
          <script>
            // Capture console.log calls from the iframe
            (function() {
              const originalConsoleLog = console.log;
              console.log = function(...args) {
                originalConsoleLog.apply(console, args);
                window.parent.postMessage({
                  type: 'console-log',
                  data: args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                  ).join(' ')
                }, '*');
              };
              
              // Also capture errors
              window.addEventListener('error', function(event) {
                window.parent.postMessage({
                  type: 'console-error',
                  data: 'Error: ' + event.message
                }, '*');
              });
            })();
            
            // User's JavaScript code
            ${jsToUse}
          </script>
        </body>
      </html>
    `;
  };

  // Add event listener for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "console-log") {
        setConsoleOutput((prev) => [...prev, event.data.data]);
      } else if (event.data && event.data.type === "console-error") {
        setConsoleOutput((prev) => [...prev, event.data.data]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Add this useEffect to listen for code application events with improved feedback
  useEffect(() => {
    const handleApplyCode = (event: any) => {
      const { code, language } = event.detail;

      // Create a visual highlight effect for the tab that will receive the code
      const highlightTab = (lang: string) => {
        const tabElement = document.querySelector(
          `button[data-language="${lang}"]`
        );
        if (tabElement) {
          tabElement.classList.add("code-apply-highlight");
          setTimeout(() => {
            tabElement.classList.remove("code-apply-highlight");
          }, 1000);
        }
      };

      // Set the appropriate content based on detected language
      if (language === "html") {
        setActiveLanguage("html");
        setHtmlContent(code);
        highlightTab("html");
        toast.success("HTML code applied successfully!", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (language === "css") {
        setActiveLanguage("css");
        setCssContent(code);
        highlightTab("css");
        toast.success("CSS code applied successfully!", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        // Default to JavaScript
        setActiveLanguage("javascript");
        setJsContent(code);
        onChange(code);
        highlightTab("javascript");
        toast.success("JavaScript code applied successfully!", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

      // Add to console output
      setConsoleOutput((prev) => [
        ...prev,
        `Code applied to ${language} editor`,
      ]);
    };

    window.addEventListener("applyCode", handleApplyCode);
    return () => {
      window.removeEventListener("applyCode", handleApplyCode);
    };
  }, [onChange, setHtmlContent, setCssContent, setJsContent, setConsoleOutput]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Language switcher */}
      <div className="bg-[#252526] border-b border-gray-700 flex items-center">
        <div className="flex">
          <button
            data-language="html"
            onClick={() => setActiveLanguage("html")}
            className={`px-4 py-2 text-sm flex items-center ${
              activeLanguage === "html"
                ? "bg-[#1e1e1e] text-white border-t-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              className="mr-2"
            >
              <path
                fill="#E44D26"
                d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"
              />
            </svg>
            HTML
          </button>
          <button
            data-language="css"
            onClick={() => setActiveLanguage("css")}
            className={`px-4 py-2 text-sm flex items-center ${
              activeLanguage === "css"
                ? "bg-[#1e1e1e] text-white border-t-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              className="mr-2"
            >
              <path
                fill="#1572B6"
                d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414v-.001z"
              />
            </svg>
            CSS
          </button>
          <button
            data-language="javascript"
            onClick={() => setActiveLanguage("javascript")}
            className={`px-4 py-2 text-sm flex items-center ${
              activeLanguage === "javascript"
                ? "bg-[#1e1e1e] text-white border-t-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              className="mr-2"
            >
              <path
                fill="#F7DF1E"
                d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"
              />
            </svg>
            JavaScript
          </button>
        </div>
        <div className="ml-auto mr-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1 text-sm rounded ${
              showPreview
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-hidden"
        style={{ height: `calc(100% - ${consoleHeight}px - 36px)` }}
      >
        {showPreview ? (
          <div className="flex h-full">
            <div className="w-1/2 h-full">
              <MonacoEditor
                height="100%"
                defaultLanguage={activeLanguage}
                language={activeLanguage}
                theme="vs-dark"
                value={
                  activeLanguage === "html"
                    ? htmlContent
                    : activeLanguage === "css"
                    ? cssContent
                    : jsContent
                }
                onChange={handleContentChange}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: fontSize,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 10 },
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  contextmenu: true,
                }}
              />
            </div>
            <div className="w-1/2 h-full bg-white border-l border-gray-700">
              <iframe
                title="Preview"
                srcDoc={generatePreviewHtml()}
                className="w-full h-full"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        ) : (
          <MonacoEditor
            height="100%"
            defaultLanguage={activeLanguage}
            language={activeLanguage}
            theme="vs-dark"
            value={
              activeLanguage === "html"
                ? htmlContent
                : activeLanguage === "css"
                ? cssContent
                : jsContent
            }
            onChange={handleContentChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: fontSize,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 10 },
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              contextmenu: true,
            }}
          />
        )}
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] rounded-lg shadow-xl w-full max-w-2xl p-6 border border-gray-700">
            <h3 className="text-xl text-white mb-4">Edit with AI</h3>
            <div className="mb-4">
              <textarea
                className="w-full h-32 bg-[#252526] text-white p-3 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                placeholder="Describe how you want to modify the selected code..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={processAiRequest}
                disabled={aiLoading || !aiPrompt}
                className={`px-4 py-2 bg-blue-500 text-white rounded ${
                  aiLoading || !aiPrompt
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-600"
                }`}
              >
                {aiLoading ? "Processing..." : "Apply AI Edit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resize handle */}
      <div
        ref={resizeHandleRef}
        className="h-2 bg-gray-700 hover:bg-blue-500 cursor-ns-resize flex items-center justify-center"
      >
        <div className="w-16 h-1 bg-gray-600 rounded-full"></div>
      </div>

      <div
        ref={consoleRef}
        style={{ height: `${consoleHeight}px` }}
        className="bg-[#1e1e1e] border-t border-gray-700 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
          <span className="text-gray-300 text-sm">
            Console Output{" "}
            {liveCodeOutput && (
              <span className="text-green-500 ml-2">(Live)</span>
            )}
          </span>
          <div className="flex gap-2">
            <button
              onClick={runCode}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Run Code
            </button>
            <button
              onClick={() => setConsoleOutput([])}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
        <div
          className="p-4 font-mono text-sm text-gray-300 overflow-auto relative"
          style={{ height: "calc(100% - 40px)" }}
        >
          <div className="relative z-10">
            {consoleOutput.length === 0 ? (
              <div className="text-gray-500 italic flex items-center">
                <span className="mr-2">
                  {/* Bash-like icon (you can replace this with an actual icon) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-terminal"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6 9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1.5a1 1 0 0 1 1 1v2zm2.5-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-2zm-4 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-2z" />
                    <path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3zm2-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z" />
                  </svg>
                </span>
                Console output will appear here after running your code
              </div>
            ) : (
              consoleOutput.map((output, index) => (
                <div key={index} className="whitespace-pre-wrap mb-1">
                  {/* Bash-like prompt */}
                  <span className="text-green-500 mr-1">user@code:~$</span>
                  {output}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
