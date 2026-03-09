import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";
import { Send } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const Setting = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-base-100 flex justify-center p-6 pt-24 text-base-content transition-colors duration-300">
      <div className="max-w-5xl w-full">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold mb-2">Theme</h1>
            <p className="text-base-content/60">Choose a theme for your chat interface</p>
          </div>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mb-12">
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`group flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${theme === t ? "bg-base-200" : "hover:bg-base-200/50"
                }`}
            >
              <div
                className="w-full relative h-10 rounded-xl overflow-hidden shadow-sm border border-base-content/10"
                data-theme={t}
              >
                <div className="absolute inset-0 grid grid-cols-4 gap-0.5 p-1 bg-base-100">
                  <div className="bg-primary rounded-sm" />
                  <div className="bg-secondary rounded-sm" />
                  <div className="bg-accent rounded-sm" />
                  <div className="bg-neutral rounded-sm" />
                </div>
              </div>
              <span className="text-xs font-medium truncate w-full text-center capitalize">
                {t}
              </span>
            </button>
          ))}
        </div>

        {/* Preview Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-6">Preview</h2>
          <div className="w-full max-w-2xl mx-auto border border-base-300 rounded-2xl overflow-hidden shadow-xl bg-base-100">
            {/* Mock Header */}
            <div className="p-4 border-b border-base-300 flex items-center gap-4 bg-base-100">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold shadow-sm">
                J
              </div>
              <div>
                <h3 className="font-semibold text-base-content text-sm">John Doe</h3>
                <p className="text-xs text-base-content/60">Online</p>
              </div>
            </div>

            {/* Mock Chat Area */}
            <div className="p-6 space-y-6 min-h-[300px] flex flex-col justify-center bg-base-100">
              {PREVIEW_MESSAGES.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.isSent
                      ? "bg-primary text-primary-content rounded-tr-none"
                      : "bg-base-200 text-base-content rounded-tl-none"
                      }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-2 opacity-70 ${msg.isSent ? "text-right" : "text-left"}`}>
                      12:00 PM
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mock Input Area */}
            <div className="p-4 border-t border-base-300 bg-base-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="This is a preview"
                  className="w-full px-4 py-3 bg-base-200 rounded-xl text-sm border-none focus:outline-none placeholder-base-content/50"
                  readOnly
                />
                <button className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary text-primary-content flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Setting;
