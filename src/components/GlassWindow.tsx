import { motion, useDragControls, PanInfo } from "motion/react";
import { X, Minus, Maximize2, Minimize2 } from "lucide-react";
import { useState, useRef, useEffect, FC, ReactNode, MouseEvent as ReactMouseEvent, RefObject } from "react";
import { WindowState } from "../hooks/useWindowManager";

interface GlassWindowProps {
  window: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onUpdatePosition: (id: string, pos: { x: number; y: number }) => void;
  onUpdateSize: (id: string, size: { width: number; height: number }) => void;
  children: ReactNode;
  constraintsRef?: RefObject<Element>;
}

export const GlassWindow: FC<GlassWindowProps> = ({
  window: win,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onUpdatePosition,
  onUpdateSize,
  children,
  constraintsRef
}) => {
  const dragControls = useDragControls();
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle drag end to update position
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        onUpdatePosition(win.id, { x: rect.x, y: rect.y });
    }
  };

  const handleResizeStart = (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const newWidth = Math.max(300, e.clientX - containerRef.current.getBoundingClientRect().left);
      const newHeight = Math.max(200, e.clientY - containerRef.current.getBoundingClientRect().top);
      onUpdateSize(win.id, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, win.id, onUpdateSize]);

  const variants = {
    normal: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      width: win.size.width,
      height: win.size.height,
      borderRadius: 20,
    },
    minimized: { 
      scale: 0.1, 
      opacity: 0, 
      y: 500, 
      transition: { duration: 0.5, type: "spring" }
    },
    maximized: { 
      scale: 1, 
      opacity: 1, 
      x: 0,
      y: 0,
      width: "100vw", 
      height: "100vh",
      borderRadius: 0,
      top: 0,
      left: 0,
      position: "fixed" as any,
      zIndex: 50
    }
  };

  return (
    <motion.div
      ref={containerRef}
      drag={win.status === 'normal'}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragConstraints={constraintsRef}
      dragElastic={0}
      onDragEnd={handleDragEnd}
      onPointerDown={() => onFocus(win.id)}
      initial={false}
      animate={win.status}
      variants={variants}
      style={{
        position: win.status === 'maximized' ? 'fixed' : 'absolute',
        left: win.status === 'maximized' ? 0 : win.position.x,
        top: win.status === 'maximized' ? 0 : win.position.y,
        zIndex: win.zIndex,
      }}
      className="overflow-hidden bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col ring-1 ring-white/10"
    >
      {/* Window Title Bar */}
      <div 
        onPointerDown={(e) => {
          onFocus(win.id);
          if (win.status === 'normal') dragControls.start(e);
        }}
        className="h-12 flex items-center justify-between px-4 bg-gradient-to-b from-white/10 to-transparent border-b border-white/5 cursor-grab active:cursor-grabbing select-none shrink-0"
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-2 group">
            <button onClick={() => onClose(win.id)} className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-colors flex items-center justify-center shadow-inner">
                <X className="w-2 h-2 text-black/50 opacity-0 group-hover:opacity-100" />
            </button>
            <button onClick={() => onMinimize(win.id)} className="w-3.5 h-3.5 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E]/80 transition-colors flex items-center justify-center shadow-inner">
                <Minus className="w-2 h-2 text-black/50 opacity-0 group-hover:opacity-100" />
            </button>
            <button onClick={() => onMaximize(win.id)} className="w-3.5 h-3.5 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 transition-colors flex items-center justify-center shadow-inner">
                {win.status === 'maximized' ? 
                    <Minimize2 className="w-2 h-2 text-black/50 opacity-0 group-hover:opacity-100" /> : 
                    <Maximize2 className="w-2 h-2 text-black/50 opacity-0 group-hover:opacity-100" />
                }
            </button>
          </div>
        </div>
        <span className="text-sm font-medium text-white/80 tracking-wide drop-shadow-sm">{win.title}</span>
        <div className="w-12" /> {/* Spacer */}
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden relative bg-black/5">
        {children}
      </div>

      {/* Resize Handle - Larger Area */}
      {win.status === 'normal' && (
        <div 
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 right-0 w-8 h-8 cursor-se-resize flex items-end justify-end p-1.5 opacity-50 hover:opacity-100 z-50"
        >
            <div className="w-3 h-3 border-r-2 border-b-2 border-white/40 rounded-br-sm" />
        </div>
      )}
    </motion.div>
  );
}
