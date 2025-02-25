import React, { useState, useRef, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";

interface EditorProps {
  content: string;
  onChange: (value: string | undefined) => void;
  liveCodeOutput: boolean;
}

export const Editor: React.FC<EditorProps> = ({ content, onChange, liveCodeOutput }) => {
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [consoleHeight, setConsoleHeight] = useState(200);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const previousContentRef = useRef(content);

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
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 10 },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
          }}
        />
      </div>

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
            Console Output {liveCodeOutput && <span className="text-green-500 ml-2">(Live)</span>}
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
