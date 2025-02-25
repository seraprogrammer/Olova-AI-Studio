import React, { useState } from "react";
import { Settings as SettingsIcon, X } from "lucide-react";
import { Settings } from "../types";

interface SettingsProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export const SettingsModal: React.FC<SettingsProps> = ({
  settings,
  onSave,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [model, setModel] = useState(settings.model);
  const [fontSize, setFontSize] = useState(settings.fontSize || 14);

  const handleSave = () => {
    onSave({ model, fontSize });
    setIsOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-gray-800 rounded-full text-gray-300"
      >
        <SettingsIcon size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white rounded-lg p-6 w-96 shadow-xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="deepseek-r1">DeepSeek-R1</option>
                  <option value="llama-3.1-70b">GPT-3.5</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="phi-4">Phi-4</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="claude-3-haiku">Claude 3 Haiku</option>
                  <option value="qvq-72b">QVQ-72B</option>
                  <option value="deepseek-v3">DeepSeek-V3</option>
                  <option value="llama-3.3-70b">llama-3.3-70b</option>
                  <option value="llama-3.2-90b">llama-3.2-90b</option>
                  <option value="llama-3.1-8b">llama-3.1-8b</option>
                  <option value="mixtral-small-28b">mixtral-small-28b</option>
                  <option value="mixtral-small-28b">mixtral-small-28b</option>
                  <option value="mixtral-8x22b">mixtral-8x22b</option>
                  <option value="wizardlm-2-7b">wizardlm-2-7b</option>
                  <option value="wizardlm-2-8x22b">wizardlm-2-8x22b</option>
                  <option value="minicpm-2.5">minicpm-2.5</option>
                  <option value="qvq-72b">qvq-72b</option>
                  <option value="qwen-2-72b">qwen-2-72b</option>
                  <option value="blackboxai-pro">blackboxai-pro</option>
                  <option value="Claude">Claude</option>
                  <option value="command-r-plus">command-r-plus</option>
                  <option value="sonar-reasoning-pro">
                    Sonar Reasoning Pro
                  </option>
                  <option value="Cohere">Cohere</option>
                  <option value="dbrx-instruct">dbrx-instruct</option>
                  <option value="GLM-4">GLM-4</option>
                  <option value="yi-34b">yi-34b</option>
                  <option value="dolphin-2.6">dolphin-2.6</option>
                  <option value="airoboros-70b">airoboros-70b</option>
                  <option value="lzlv-70b">lzlv-70b</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Editor Font Size
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className="bg-gray-800 px-2 py-1 rounded min-w-[40px] text-center">
                    {fontSize}px
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
