import React from "react";
import { Brain, Menu, X, Github } from "lucide-react";

interface HeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedModel,
  onModelChange,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  return (
    <div className="border-b border-[#2A2F34] bg-[#1A1F24]/80 backdrop-blur-xl">
      <div className="mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 mr-2 text-gray-400 hover:text-white"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-emerald-500" />
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="bg-[#2A2F34]/80 px-3 py-1.5 rounded-lg border border-[#2A2F34] focus:outline-none focus:border-emerald-500/20 text-gray-300 text-sm transition-colors duration-200 hover:border-emerald-500/20"
            >
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="o3-mini">O3 Mini</option>
              <option value="mixtral-8x22b">Mixtral 8x22B</option>
              <option value="mixtral-small-24b">Mixtral Small 24B</option>
              <option value="mixtral-small-28b">Mixtral Small 28B</option>
              <option value="hermes-2-dpo">Hermes 2 DPO</option>
              <option value="phi-4">Phi 4</option>
              <option value="wizardlm-2-7b">WizardLM 2 7B</option>
              <option value="wizardlm-2-8x22b">WizardLM 2 8x22B</option>
              <option value="claude-3-haiku">Claude 3 Haiku</option>
              <option value="blackboxai">Blackbox AI</option>
              <option value="blackboxai-pro">Blackbox AI Pro</option>
              <option value="command-r">Command R</option>
              <option value="command-r-plus">Command R Plus</option>
              <option value="command-r7b">Command R 7B</option>
              <option value="qwen-2-72b">Qwen 2 72B</option>
              <option value="qwq-32b">QWQ 32B</option>
              <option value="qvq-72b">QVQ 72B</option>
              <option value="deepseek-chat">DeepSeek Chat</option>
              <option value="deepseek-v3">DeepSeek V3</option>
              <option value="deepseek-r1">DeepSeek R1</option>
              <option value="dbrx-instruct">DBRX Instruct</option>
              <option value="glm-4">GLM 4</option>
              <option value="airoboros-70b">Airoboros 70B</option>
              <option value="lzlv-70b">LZLV 70B</option>
              <option value="tulu-3-405b">Tulu 3 405B</option>
              <option value="sd-3-5">SD 3.5</option>
              <option value="flux">Flux</option>
            </select>
          </div>
        </div>

        {/* Social links */}
        <div className="flex items-center space-x-4">
          <a
            href="https://discord.gg/qH77DrZYWj"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Discord"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 -28.5 256 256"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              preserveAspectRatio="xMidYMid"
              className="fill-current"
            >
              <g>
                <path
                  d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
                  fillRule="nonzero"
                ></path>
              </g>
            </svg>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};
