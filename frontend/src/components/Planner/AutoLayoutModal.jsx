import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

const AutoLayoutModal = ({ isOpen, onClose, onGenerate }) => {
    const [roomType, setRoomType] = useState('living');
    const [style, setStyle] = useState('modern');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onGenerate({ roomType, style });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 border-b border-orange-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-600 p-2 rounded-xl shadow-inner shadow-orange-700/50">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Auto Layout Generator</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-orange-900 hover:bg-orange-200 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                            Room Type
                        </label>
                        <select
                            value={roomType}
                            onChange={(e) => setRoomType(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        >
                            <option value="living">Living Room</option>
                            <option value="bedroom">Bedroom</option>
                            <option value="dining">Dining Room</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                            Style Preference
                        </label>
                        <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        >
                            <option value="modern">Modern</option>
                            <option value="minimalist">Minimalist</option>
                            <option value="classic">Classic</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        <Sparkles size={18} />
                        Generate Space
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AutoLayoutModal;
