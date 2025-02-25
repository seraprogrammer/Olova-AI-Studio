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

  const handleSave = () => {
    onSave({ model });
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full border border-gray-700 bg-gray-800 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="deepseek-r1">DeepSeek-R1</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="phi-4">Phi-4</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
                <option value="qvq-72b">QVQ-72B</option>
                <option value="deepseek-v3">DeepSeek-V3</option>
                <option value="sonar-reasoning-pro">Sonar Reasoning Pro</option>
              </select>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
