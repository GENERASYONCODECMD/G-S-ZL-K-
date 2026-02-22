import { useState, useEffect, useRef } from "react";
import { LiquidBackground } from "./components/LiquidBackground";
import { Dock } from "./components/Dock";
import { SearchBar } from "./components/SearchBar";
import { WordCard } from "./components/WordCard";
import { GlassWindow } from "./components/GlassWindow";
import { ThemeSelector } from "./components/ThemeSelector";
import { LockScreen } from "./components/LockScreen";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import { useWindowManager } from "./hooks/useWindowManager";
import { ThemeProvider } from "./context/ThemeContext";

function AppContent() {
  const { 
    windows, 
    openWindow, 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    focusWindow, 
    updateWindowPosition, 
    updateWindowSize,
    updateWindowData,
    restoreWindow
  } = useWindowManager();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery) return;
    
    setLoading(true);
    setError(null);

    // Ensure the search window is open and focused
    const searchWindow = windows.find(w => w.type === 'search');
    if (!searchWindow) {
        openWindow('Sözlük', 'search');
    } else {
        focusWindow(searchWindow.id);
    }

    try {
      const response = await fetch(`/api/tdk?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        alert(data.error);
      } else if (Array.isArray(data) && data.length > 0) {
        // Update the existing search window with the result data
        const targetWindow = windows.find(w => w.type === 'search');
        if (targetWindow) {
            updateWindowData(targetWindow.id, data[0]);
        } else {
            // Fallback if window was closed during search (unlikely)
            openWindow('Sözlük', 'search', data[0]);
        }
      } else {
        setError("Kelime bulunamadı.");
        alert("Kelime bulunamadı.");
      }
    } catch (err) {
      setError("Bir hata oluştu.");
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (word: string) => {
    setFavorites(prev => 
      prev.includes(word) 
        ? prev.filter(w => w !== word)
        : [...prev, word]
    );
  };

  const handleDockClick = (type: 'search' | 'themes' | 'word') => {
    if (type === 'search') {
        openWindow('Sözlük', 'search');
    } else if (type === 'themes') {
        openWindow('Temalar', 'themes');
    }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      <LiquidBackground />

      <AnimatePresence>
        {isLocked && (
            <LockScreen onUnlock={() => setIsLocked(false)} />
        )}
      </AnimatePresence>

      {/* Main Desktop Area */}
      <main ref={constraintsRef} className={`absolute inset-0 overflow-hidden transition-all duration-1000 ${isLocked ? 'scale-95 blur-sm' : 'scale-100 blur-0'}`}>
        
        {/* Lock Button */}
        <button 
            onClick={() => setIsLocked(true)}
            className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-all group"
        >
            <Lock className="w-5 h-5 text-white/70 group-hover:text-white" />
        </button>

        {/* Windows Layer */}
        <AnimatePresence>
            {windows.map(win => (
                <GlassWindow
                    key={win.id}
                    window={win}
                    onClose={closeWindow}
                    onMinimize={minimizeWindow}
                    onMaximize={maximizeWindow}
                    onFocus={focusWindow}
                    onUpdatePosition={updateWindowPosition}
                    onUpdateSize={updateWindowSize}
                    constraintsRef={constraintsRef}
                >
                    {win.type === 'word' && win.data && (
                        <WordCard 
                            data={win.data}
                            isFavorite={favorites.includes(win.data.madde)}
                            onToggleFavorite={() => toggleFavorite(win.data.madde)}
                        />
                    )}
                    {win.type === 'search' && (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-white/10 bg-white/5">
                                <SearchBar onSearch={handleSearch} isLoading={loading} />
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                                {win.data ? (
                                    <WordCard 
                                        data={win.data}
                                        isFavorite={favorites.includes(win.data.madde)}
                                        onToggleFavorite={() => toggleFavorite(win.data.madde)}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-white/30">
                                        <p className="text-lg">Aramak için bir kelime yazın</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {win.type === 'themes' && (
                        <ThemeSelector />
                    )}
                </GlassWindow>
            ))}
        </AnimatePresence>
      </main>

      {!isLocked && (
        <Dock 
            onOpenWindow={handleDockClick}
            minimizedWindows={windows.filter(w => w.status === 'minimized')}
            onRestoreWindow={restoreWindow}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
