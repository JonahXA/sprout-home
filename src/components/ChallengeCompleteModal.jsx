import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Zap, Sparkles, Star } from "lucide-react";
import { Button } from "./ui/button";

export default function ChallengeCompleteModal({ challenge, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -20,
    rotation: Math.random() * 360,
    scale: Math.random() * 0.5 + 0.5,
    color: ["#2D9B6F", "#22c55e", "#eab308", "#f97316", "#ec4899"][Math.floor(Math.random() * 5)],
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Confetti */}
        {confetti.map((conf) => (
          <motion.div
            key={conf.id}
            initial={{ x: `${conf.x}vw`, y: -20, rotate: 0 }}
            animate={{
              y: "100vh",
              rotate: conf.rotation,
              x: `${conf.x + (Math.random() - 0.5) * 20}vw`,
            }}
            transition={{ duration: 2 + Math.random() * 2, ease: "easeIn" }}
            className="absolute w-3 h-3 rounded-full"
            style={{ backgroundColor: conf.color, transform: `scale(${conf.scale})` }}
          />
        ))}

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header */}
          <div className="bg-[#1B2B5E] p-8 text-center relative overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 left-4 opacity-20"
            >
              <Sparkles className="w-16 h-16 text-white" />
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, -360, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-4 right-4 opacity-20"
            >
              <Star className="w-16 h-16 text-white" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Trophy className="w-24 h-24 mx-auto mb-4 text-yellow-300 drop-shadow-lg" />
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-2">Challenge Complete! 🎉</h2>
            <p className="text-white/90 text-lg">You crushed it!</p>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{challenge.title}</h3>

            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2 text-white">
                  <Zap className="w-8 h-8" />
                  <span className="text-3xl font-bold">+{challenge.xp_reward}</span>
                </div>
                <p className="text-sm text-white/90 mt-1">XP Earned</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">{challenge.description}</p>

            <Button
              onClick={onClose}
              className="w-full h-14 text-lg bg-[#1B2B5E] hover:bg-[#141E43] text-white shadow-lg"
            >
              Continue Learning
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
