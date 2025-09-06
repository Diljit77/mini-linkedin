import { motion } from "framer-motion";

export default function RecordingAnimation() {
  return (
    <div className="flex items-center gap-1">
  
      <motion.div
        className="w-2 h-2 rounded-full bg-error"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      />

   
      <motion.div
        className="w-2 h-3 bg-base-content/50 rounded-sm"
        animate={{ height: [3, 8, 3] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: 0.1 }}
      />
      <motion.div
        className="w-2 h-4 bg-base-content/70 rounded-sm"
        animate={{ height: [4, 10, 4] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-3 bg-base-content/50 rounded-sm"
        animate={{ height: [3, 7, 3] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
      />
    </div>
  );
}