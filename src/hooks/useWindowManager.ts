import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface WindowState {
  id: string;
  title: string;
  type: 'word' | 'search' | 'themes';
  data?: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  status: 'normal' | 'minimized' | 'maximized';
  zIndex: number;
}

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  const openWindow = useCallback((title: string, type: WindowState['type'], data?: any) => {
    // Check if a window of this type already exists (optional, but good for search/settings)
    const existingWindow = windows.find(w => w.type === type && type !== 'word');
    if (existingWindow) {
      // Restore if minimized
      if (existingWindow.status === 'minimized') {
        setWindows(prev => prev.map(w => w.id === existingWindow.id ? { ...w, status: 'normal' } : w));
      }
      setActiveWindowId(existingWindow.id);
      // Bring to front
      setWindows(prev => {
        const maxZ = Math.max(...prev.map(w => w.zIndex), 0);
        return prev.map(w => w.id === existingWindow.id ? { ...w, zIndex: maxZ + 1 } : w);
      });
      return;
    }

    const id = uuidv4();
    const newWindow: WindowState = {
      id,
      title,
      type,
      data,
      position: { x: 100 + (windows.length * 40), y: 100 + (windows.length * 40) },
      size: { width: 600, height: 500 }, // Default size
      status: 'normal',
      zIndex: windows.length > 0 ? Math.max(...windows.map(w => w.zIndex)) + 1 : 1
    };
    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(id);
  }, [windows]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
  }, [activeWindowId]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, status: 'minimized' } : w));
    if (activeWindowId === id) setActiveWindowId(null);
  }, [activeWindowId]);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, status: w.status === 'maximized' ? 'normal' : 'maximized' };
      }
      return w;
    }));
    setActiveWindowId(id);
  }, []);

  const focusWindow = useCallback((id: string) => {
    setActiveWindowId(id);
    setWindows(prev => {
      const maxZ = Math.max(...prev.map(w => w.zIndex), 0);
      return prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w);
    });
  }, []);

  const updateWindowPosition = useCallback((id: string, pos: { x: number; y: number }) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, position: pos } : w));
  }, []);

  const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, size } : w));
  }, []);

  const updateWindowData = useCallback((id: string, data: any) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, data } : w));
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, status: 'normal' } : w));
    focusWindow(id);
  }, [focusWindow]);

  return {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    updateWindowData,
    restoreWindow
  };
}
