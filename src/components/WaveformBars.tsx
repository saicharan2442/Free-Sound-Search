import { motion } from "framer-motion";

interface Props {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
}

export function WaveformBars({ isPlaying, barCount = 5, className = "" }: Props) {
  return (
    <div className={`flex items-end gap-[2px] h-5 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-primary"
          animate={
            isPlaying
              ? {
                  height: ["20%", "100%", "40%", "80%", "20%"],
                }
              : { height: "20%" }
          }
          transition={
            isPlaying
              ? {
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
          style={{ minHeight: 3 }}
        />
      ))}
    </div>
  );
}
