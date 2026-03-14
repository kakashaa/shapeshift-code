import { useState, useRef, useCallback, ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const threshold = 70;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = containerRef.current;
    if (el && el.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || refreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) setPullDistance(Math.min(diff * 0.4, 100));
  }, [pulling, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    setPulling(false);
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      setPullDistance(40);
      try { await onRefresh(); } catch {}
      setRefreshing(false);
    }
    setPullDistance(0);
  }, [pulling, pullDistance, refreshing, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div
        animate={{ height: pullDistance }}
        transition={pulling ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 }}
        className="flex items-center justify-center overflow-hidden"
      >
        {refreshing ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        ) : (
          <motion.div style={{ opacity: progress, scale: 0.6 + progress * 0.4 }} className="text-primary">
            <Loader2 className="w-5 h-5" style={{ transform: `rotate(${progress * 360}deg)` }} />
          </motion.div>
        )}
      </motion.div>
      {children}
    </div>
  );
}
