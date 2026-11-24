import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Loader({ show = false, label = "NexSys" }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex flex-col items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Label with rotating + pulsing + glowing ring */}
          <motion.div className="relative flex items-center justify-center mb-4 w-32 h-32">
            {/* Label text in the center */}
            <motion.div
             style={{ fontSize: "0.875rem" }}
              className="text-white text-2xl font-bold tracking-wide z-10"
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.8, 1, 0.8] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {label}
            </motion.div>

            {/* Rotating & pulsing ring with glow */}
            <motion.div
              className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
              animate={{ rotate: 360, scale: [1, 1.05, 1] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            >
              <div className="absolute w-32 h-32 border-4 border-white/30 border-t-indigo-400 rounded-full
                              shadow-[0_0_20px_rgba(99,102,241,0.7)]"></div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
