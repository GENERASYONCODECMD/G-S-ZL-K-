import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

export function LiquidBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { theme } = useTheme();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const getThemeColors = () => {
    switch (theme) {
      case 'midnight':
        return {
          bg: "from-slate-950 via-slate-900 to-black",
          blob1: "bg-indigo-900/40",
          blob2: "bg-purple-900/40",
          blob3: "bg-blue-900/30",
          blob4: "bg-cyan-900/20"
        };
      case 'sunset':
        return {
          bg: "from-orange-950 via-red-950 to-slate-950",
          blob1: "bg-orange-600/30",
          blob2: "bg-pink-600/30",
          blob3: "bg-red-600/20",
          blob4: "bg-yellow-600/10"
        };
      case 'ocean':
        return {
          bg: "from-cyan-950 via-blue-950 to-slate-950",
          blob1: "bg-cyan-600/30",
          blob2: "bg-teal-600/30",
          blob3: "bg-blue-600/20",
          blob4: "bg-emerald-600/10"
        };
      case 'aurora':
      default:
        return {
          bg: "from-slate-900 via-slate-800 to-black",
          blob1: "bg-purple-600/30",
          blob2: "bg-blue-600/30",
          blob3: "bg-indigo-600/20",
          blob4: "bg-cyan-500/10"
        };
    }
  };

  const colors = getThemeColors();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black transition-colors duration-1000">
      {/* Base gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-80 transition-colors duration-1000`} />

      {/* Animated Mesh Blobs */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -50, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute top-[-20%] left-[-10%] h-[60vh] w-[60vw] rounded-full blur-[120px] transition-colors duration-1000 ${colors.blob1}`}
      />
      
      <motion.div
        animate={{
          x: [0, -70, 30, 0],
          y: [0, 80, -40, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className={`absolute top-[20%] right-[-10%] h-[50vh] w-[50vw] rounded-full blur-[100px] transition-colors duration-1000 ${colors.blob2}`}
      />

      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -30, 30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
        className={`absolute bottom-[-10%] left-[20%] h-[40vh] w-[40vw] rounded-full blur-[90px] transition-colors duration-1000 ${colors.blob3}`}
      />

      {/* Interactive Blob following mouse (subtle) */}
      <motion.div
        animate={{
          x: mousePosition.x * 5, // subtle movement
          y: mousePosition.y * 5,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 400 }}
        className={`absolute top-1/2 left-1/2 h-[30vh] w-[30vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] transition-colors duration-1000 ${colors.blob4}`}
      />

      {/* Noise Texture Overlay for "Glass" feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
    </div>
  );
}
