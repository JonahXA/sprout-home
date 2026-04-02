import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Star, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LevelUpModal({ level, onClose }) {
 const [confetti, setConfetti] = useState([]);

 useEffect(() => {
 // Generate confetti particles
 const particles = Array.from({ length: 50 }, (_, i) => ({
 id: i,
 x: Math.random() * 100,
 delay: Math.random() * 0.5,
 duration: 2 + Math.random() * 2,
 }));
 setConfetti(particles);

 // Auto close after 5 seconds
 const timer = setTimeout(onClose, 5000);
 return () => clearTimeout(timer);
 }, [onClose]);

 return (
 <AnimatePresence>
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
 onClick={onClose}
 />

 {/* Confetti */}
 {confetti.map((particle) => (
 <motion.div
 key={particle.id}
 className="absolute w-2 h-2 rounded-full"
 style={{
 left: `${particle.x}%`,
 top: "-10%",
 background: `hsl(${Math.random() * 360}, 100%, 60%)`,
 }}
 animate={{
 y: ["0vh", "110vh"],
 x: [0, (Math.random() - 0.5) * 200],
 rotate: [0, Math.random() * 720],
 opacity: [1, 1, 0],
 }}
 transition={{
 duration: particle.duration,
 delay: particle.delay,
 ease: "easeOut",
 }}
 />
 ))}

 {/* Modal */}
 <motion.div
 initial={{ scale: 0.5, opacity: 0, y: 50 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.5, opacity: 0, y: 50 }}
 transition={{ type: "spring", damping: 20, stiffness: 300 }}
 className="relative z-10 w-full max-w-lg"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="relative overflow-hidden rounded-3xl bg-[#1B2B5E] p-1 shadow-2xl">
 <div className="rounded-3xl bg-white p-8 text-center">
 {/* Close Button */}
 <button
 onClick={onClose}
 className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
 >
 <X className="w-4 h-4 text-gray-600" />
 </button>

 {/* Trophy Animation */}
 <motion.div
 animate={{
 scale: [1, 1.2, 1],
 rotate: [0, -10, 10, -10, 0],
 }}
 transition={{
 duration: 0.8,
 repeat: Infinity,
 repeatDelay: 1,
 }}
 className="mx-auto w-32 h-32 bg-[#1B2B5E] rounded-full flex items-center justify-center mb-6 shadow-xl"
 >
 <Trophy className="w-16 h-16 text-white" />
 </motion.div>

 {/* Sparkles */}
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
 className="absolute top-20 left-1/4"
 >
 <Sparkles className="w-8 h-8 text-yellow-400" />
 </motion.div>
 <motion.div
 animate={{ rotate: -360 }}
 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
 className="absolute top-32 right-1/4"
 >
 <Star className="w-6 h-6 text-[#2D9B6F]" />
 </motion.div>

 {/* Text Content */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 >
 <h2 className="text-4xl font-bold text-gray-900 mb-2">
 Congratulations! 
 </h2>
 <p className="text-xl text-gray-700 mb-6">You've reached</p>
 <div className="bg-[#E8F0FE] rounded-2xl p-6 mb-6">
 <p className="text-6xl font-black text-[#1B2B5E] mb-2">
 Level {level}
 </p>
 <p className="text-gray-600 font-medium">
 You're becoming a financial expert!
 </p>
 </div>

 <div className="flex items-center justify-center gap-2 text-[#2D9B6F] font-semibold mb-6">
 <Zap className="w-5 h-5" />
 <span>Keep learning to unlock more rewards!</span>
 </div>

 <Button
 onClick={onClose}
 className="w-full bg-[#1B2B5E] hover:bg-[#141E43] text-white h-14 text-lg shadow-xl"
 >
 Continue Learning
 </Button>
 </motion.div>
 </div>
 </div>
 </motion.div>
 </div>
 </AnimatePresence>
 );
}
