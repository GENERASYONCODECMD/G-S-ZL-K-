import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Lock } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [time, setTime] = useState(new Date());
  const [isAOD, setIsAOD] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, -200], [1, 0]);
  
  // Clock animations
  const clockScale = useTransform(y, [0, -300], [1, 0.8]);
  const clockY = useTransform(y, [0, -300], [0, -50]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check for custom wallpaper
  useEffect(() => {
    const img = new Image();
    img.src = '/lockscreen-bg.png';
    img.onload = () => setBgImage('/lockscreen-bg.png');
  }, []);

  // AOD Logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetAOD = () => {
      setIsAOD(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsAOD(true), 5000); // 5s to AOD
    };

    window.addEventListener('mousemove', resetAOD);
    window.addEventListener('mousedown', resetAOD);
    window.addEventListener('touchstart', resetAOD);
    window.addEventListener('keydown', resetAOD);
    
    resetAOD();

    return () => {
      window.removeEventListener('mousemove', resetAOD);
      window.removeEventListener('mousedown', resetAOD);
      window.removeEventListener('touchstart', resetAOD);
      window.removeEventListener('keydown', resetAOD);
      clearTimeout(timeout);
    };
  }, []);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.y < -150) {
      onUnlock();
    } else {
      animate(y, 0);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <motion.div 
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-between pb-10 transition-colors duration-1000 ${isAOD ? 'bg-black' : 'bg-black/40 backdrop-blur-xl'}`}
      style={{ opacity }}
    >
      {/* Background Layer */}
      <motion.div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        animate={{ opacity: isAOD ? (bgImage ? 1 : 0) : 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-black" />
        
        {bgImage ? (
            <motion.img 
                src={bgImage} 
                alt="Lock Screen Wallpaper" 
                className="absolute inset-0 w-full h-full object-cover"
                animate={{ 
                    opacity: isAOD ? 0.5 : 1,
                    scale: isAOD ? 1.05 : 1,
                    filter: isAOD ? "blur(0px) grayscale(50%)" : "blur(0px) grayscale(0%)"
                }}
                transition={{ duration: 1.5 }}
            />
        ) : (
            /* Fallback Liquid Blob */
            <motion.div
                animate={{
                    x: [0, 30, -30, 0],
                    y: [0, -30, 30, 0],
                    scale: [1, 1.1, 0.9, 1],
                    opacity: isAOD ? 0 : 1
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px]"
            />
        )}
      </motion.div>

      {/* Clock Container */}
      <motion.div 
        className="flex flex-col items-center mt-32 z-10"
        style={{ scale: clockScale, y: clockY }}
      >
        <motion.div 
            className="flex flex-col items-center relative"
            style={{ transformOrigin: 'top' }}
            animate={{
                scaleY: isAOD ? 1.3 : 1, // Stretch downwards
                opacity: isAOD ? 0.7 : 1,
                filter: isAOD ? "blur(1px)" : "blur(0px)",
                y: isAOD ? 50 : 0, // Move down slightly as it stretches
            }}
            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
        >
            <Lock className={`w-6 h-6 mb-4 transition-colors duration-500 ${isAOD ? 'text-white/30' : 'text-white/80'}`} />
            <h1 className={`text-8xl font-bold tracking-tighter transition-colors duration-1000 ${isAOD ? 'text-white/50' : 'text-white'}`}>
                {formatTime(time)}
            </h1>
        </motion.div>
        
        <motion.p 
            className={`text-xl mt-4 font-medium transition-colors duration-1000 ${isAOD ? 'text-white/30' : 'text-white/80'}`}
            animate={{
                y: isAOD ? 100 : 0, // Push date down as clock stretches
                opacity: isAOD ? 0.4 : 1
            }}
            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {formatDate(time)}
        </motion.p>
      </motion.div>

      {!isAOD && (
        <motion.div 
          className="flex flex-col items-center gap-2 z-10 cursor-grab active:cursor-grabbing"
          style={{ y }}
          drag="y"
          dragConstraints={{ top: -300, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          <div className="w-32 h-1 bg-white/50 rounded-full mb-2" />
          <p className="text-white/60 text-sm font-medium tracking-wide">Açmak için yukarı kaydır</p>
        </motion.div>
      )}
    </motion.div>
  );
}
