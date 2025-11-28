"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl border-3 border-primary-200 p-6 mb-4"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary-400 to-joy-400 flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Need help?</h4>
                <p className="text-sm text-neutral-600">
                  I'm here to answer any questions about CodeCraft!
                </p>
              </div>
            </div>
            <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors">
              Start Chat
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={
          isOpen
            ? { rotate: 0 }
            : {
                rotate: [0, -10, 10, -10, 0],
              }
        }
        transition={
          isOpen
            ? {}
            : {
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 3,
              }
        }
        className="w-16 h-16 rounded-full bg-linear-to-br from-primary-500 to-joy-500 text-white shadow-2xl shadow-primary-400/50 flex items-center justify-center"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>
    </div>
  );
}
