import { motion, AnimatePresence } from "motion/react";
import { Search, History, Star, Palette, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";
import { WindowState } from "../hooks/useWindowManager";

interface DockProps {
  onOpenWindow: (type: WindowState['type']) => void;
  minimizedWindows: WindowState[];
  onRestoreWindow: (id: string) => void;
}

export function Dock({ onOpenWindow, minimizedWindows, onRestoreWindow }: DockProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Handle swipe up from bottom to show dock
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (window.innerHeight - e.clientY < 50) {
            setIsVisible(true);
        }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const dockItems = [
    { id: "search", icon: Search, label: "Ara", type: 'search' as const },
    { id: "themes", icon: Palette, label: "Temalar", type: 'themes' as const },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className="flex items-end gap-3 px-4 py-3 rounded-[2rem] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10">
            
            {/* Main App Icons */}
            {dockItems.map((item) => {
              const isThemes = item.id === 'themes';
              return (
                <motion.button
                  key={item.id}
                  layout
                  onClick={() => onOpenWindow(item.type)}
                  whileHover={{ 
                      scale: 1.25, 
                      y: -15,
                      rotate: isThemes ? 90 : 0,
                  }}
                  whileTap={{ 
                      scale: 0.85,
                      rotate: isThemes ? -15 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="relative group flex flex-col items-center justify-center w-12 h-12"
                >
                  <div className={`w-12 h-12 rounded-2xl backdrop-blur-md border flex items-center justify-center shadow-lg transition-all duration-300
                      ${isThemes 
                          ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30 group-hover:from-purple-500/40 group-hover:to-pink-500/40 group-hover:border-purple-400/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                          : 'bg-white/10 border-white/20 group-hover:bg-white/20 group-hover:border-white/40'
                      }`}
                  >
                      <item.icon className={`w-6 h-6 drop-shadow-md transition-colors ${isThemes ? 'text-purple-100 group-hover:text-white' : 'text-white/90 group-hover:text-white'}`} />
                  </div>
                  
                  <motion.span 
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      whileHover={{ opacity: 1, y: -55, scale: 1 }}
                      className="absolute pointer-events-none bg-black/80 text-white text-[10px] font-medium px-2 py-1 rounded-lg backdrop-blur-md whitespace-nowrap border border-white/10 shadow-xl z-50"
                  >
                    {item.label}
                  </motion.span>
                </motion.button>
              );
            })}

            {/* Divider if there are minimized windows */}
            {minimizedWindows.length > 0 && (
                <motion.div 
                    layout
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    className="w-[1px] h-8 bg-white/20 mx-2 self-center rounded-full" 
                />
            )}

            {/* Minimized Windows */}
            <AnimatePresence mode="popLayout">
                {minimizedWindows.map((win) => (
                    <motion.button
                        key={win.id}
                        layout
                        initial={{ scale: 0, opacity: 0, width: 0 }}
                        animate={{ scale: 1, opacity: 1, width: 'auto' }}
                        exit={{ scale: 0, opacity: 0, width: 0 }}
                        whileHover={{ scale: 1.2, y: -10 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        onClick={() => onRestoreWindow(win.id)}
                        className="relative group flex flex-col items-center justify-center w-12 h-12"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shadow-lg group-hover:bg-cyan-500/30 group-hover:border-cyan-400/50 transition-colors overflow-hidden">
                            <LayoutGrid className="w-6 h-6 text-cyan-200 drop-shadow-md" />
                        </div>
                        <motion.span 
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            whileHover={{ opacity: 1, y: -50, scale: 1 }}
                            className="absolute pointer-events-none bg-black/80 text-white text-[10px] font-medium px-2 py-1 rounded-lg backdrop-blur-md whitespace-nowrap border border-white/10 shadow-xl"
                        >
                            {win.title}
                        </motion.span>
                    </motion.button>
                ))}
            </AnimatePresence>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
