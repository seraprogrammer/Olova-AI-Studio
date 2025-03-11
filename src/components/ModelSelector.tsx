import React from "react";
import { ChevronDown } from "lucide-react";

interface Model {
  id: string;
  name: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  models: Model[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  models,
  isOpen,
  onToggle,
  onSelect,
}) => {
  return (
    <>
      {isOpen && (
        <div className="fixed bottom-[152px] left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-[50rem] rounded-lg bg-gray-800 border border-gray-700 shadow-lg overflow-x-auto z-50">
          <div className="flex flex-row flex-wrap gap-2 p-3">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelect(model.id);
                  onToggle();
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedModel === model.id
                    ? "bg-gray-700/80 text-white"
                    : "text-gray-200 hover:bg-gray-700/50"
                }`}
              >
                <span>{model.name}</span>
                {selectedModel === model.id && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-green-400"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center relative">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-gray-200 hover:bg-gray-800 transition-colors"
        >
          <span className="text-sm">
            {models.find((m) => m.id === selectedModel)?.name || "Select Model"}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </>
  );
};

export default ModelSelector;
