import React from "react";
import { X, Trash2, Moon, Sun, Volume2, VolumeX } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1A1B1E] rounded-xl p-6 w-[400px] max-w-[90%] shadow-2xl border border-gray-800/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800/50 rounded-lg">
                <Moon className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div className="text-gray-200 font-medium">Theme</div>
                <div className="text-gray-400 text-sm">
                  Switch between dark and light mode
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Sun className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800/50 rounded-lg">
                <Volume2 className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div className="text-gray-200 font-medium">Sound</div>
                <div className="text-gray-400 text-sm">
                  Enable or disable sound effects
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <VolumeX className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Clear History */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800/50 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-gray-200 font-medium">Clear History</div>
                <div className="text-gray-400 text-sm">
                  Delete all chat messages
                </div>
              </div>
            </div>
            <button
              onClick={onClearHistory}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Version Info */}
          <div className="pt-4 border-t border-gray-800">
            <div className="text-gray-400 text-sm">Version 1.0.0</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
