import React, { useState, useRef, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface EditorProps {
  content: string;
  onChange: (value: string | undefined) => void;
  liveCodeOutput: boolean;
  apiKey?: string;
}

export const Editor: React.FC<EditorProps> = ({
  content,
  onChange,
  liveCodeOutput,
  apiKey,
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
      new Function(content)();

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
    if (liveCodeOutput && content !== previousContentRef.current) {
      const timeoutId = setTimeout(() => {
        runCode();
      }, 1000); // Debounce execution to avoid running on every keystroke

      previousContentRef.current = content;
      return () => clearTimeout(timeoutId);
    }
  }, [content, liveCodeOutput]);

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

  return (
    <div className="flex flex-col h-full relative">
      <div
        className="flex-1 overflow-hidden"
        style={{ height: `calc(100% - ${consoleHeight}px)` }}
      >
        <MonacoEditor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={content}
          onChange={onChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
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
          className="p-4 font-mono text-sm text-gray-300 overflow-auto"
          style={{ height: "calc(100% - 40px)" }}
        >
          {consoleOutput.length === 0 ? (
            <div className="text-gray-500 italic">
              Console output will appear here after running your code
            </div>
          ) : (
            consoleOutput.map((output, index) => (
              <div key={index} className="whitespace-pre-wrap mb-1">
                {output}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
