import React from "react";
import { motion } from "framer-motion";

export const LoadingNew = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] w-full p-96">
      <div className="relative flex items-center justify-center w-20 h-20 mb-4">
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl animate-pulse" />

        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-[#004C97] shadow-sm"
        />
        
        {/* Inner Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-3 rounded-full border-[3px] border-slate-100 border-b-[#F7931E]"
        />

        {/* Center Element */}
        <motion.div 
          animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-4 h-4 bg-[#004C97] rounded-full shadow-[0_0_12px_rgba(0,76,151,0.4)]"
        />
      </div>
      
      {/* Loading Text */}
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="text-[#071942] font-semibold text-sm tracking-widest uppercase"
      >
        Loading...
      </motion.div>
    </div>
  );
};

export default LoadingNew;
