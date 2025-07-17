import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => {
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-yellow-500/30 shadow-2xl"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                    <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 bg-yellow-500/20 rounded-full">
                           <AlertTriangle className="text-yellow-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{title}</h3>
                            <p className="text-white/80 mt-1">{message}</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button 
                            onClick={onCancel} 
                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-md font-semibold"
                        >
                            いいえ
                        </button>
                        <button 
                            onClick={onConfirm} 
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold"
                        >
                            はい
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ConfirmModal;