import { useTheme, Theme } from "../context/ThemeContext";
import { motion } from "motion/react";
import { Check } from "lucide-react";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes: { id: Theme; name: string; colors: string }[] = [
    { id: 'aurora', name: 'Aurora', colors: 'bg-gradient-to-br from-purple-600 to-blue-600' },
    { id: 'midnight', name: 'Midnight', colors: 'bg-gradient-to-br from-slate-900 to-black' },
    { id: 'sunset', name: 'Sunset', colors: 'bg-gradient-to-br from-orange-500 to-red-600' },
    { id: 'ocean', name: 'Ocean', colors: 'bg-gradient-to-br from-cyan-500 to-blue-700' },
  ];

  return (
    <div className="p-8 h-full flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-8 text-white">Tema Seç</h2>
      <div className="grid grid-cols-2 gap-6 w-full max-w-md">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`relative group p-4 rounded-2xl border transition-all duration-300 ${
              theme === t.id 
                ? "bg-white/10 border-white/40 shadow-xl scale-105" 
                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
            }`}
          >
            <div className={`w-full h-24 rounded-xl mb-3 ${t.colors} shadow-inner`} />
            <span className="text-lg font-medium text-white/90">{t.name}</span>
            
            {theme === t.id && (
              <motion.div 
                layoutId="check"
                className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-black"
              >
                <Check className="w-4 h-4" />
              </motion.div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
