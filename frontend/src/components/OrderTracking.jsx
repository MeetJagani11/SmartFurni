import React from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

const OrderTracking = ({ status, history }) => {
    const stages = [
        { key: 'pending', label: 'Order Placed', icon: Clock },
        { key: 'processing', label: 'Processing', icon: Package },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    const currentStageIndex = stages.findIndex(s => s.key === status);

    return (
        <div className="py-8">
            {/* Visual Timeline */}
            <div className="relative flex justify-between items-center mb-12 px-4 sm:px-12">
                {/* Progress Line */}
                <div className="absolute left-1/2 top-5 -translate-x-1/2 h-1 w-[80%] bg-gray-200 -z-10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-orange-500 transition-all duration-1000 ease-out"
                        style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
                    />
                </div>

                {stages.map((stage, index) => {
                    const isCompleted = index <= currentStageIndex;
                    const Icon = stage.icon;

                    return (
                        <div key={stage.key} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                                    : 'bg-white border-gray-300 text-gray-400'
                                }`}>
                                <Icon size={20} />
                            </div>
                            <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${isCompleted ? 'text-orange-600' : 'text-gray-400'
                                }`}>
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Tracking History List */}
            <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100">
                <h4 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock size={16} className="text-orange-500" />
                    Tracking Updates
                </h4>

                <div className="space-y-6">
                    {history && history.length > 0 ? (
                        history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((entry, index) => (
                            <div key={index} className="flex gap-4 group">
                                <div className="flex flex-col items-center">
                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1.5 ring-4 ring-orange-100" />
                                    {index !== history.length - 1 && (
                                        <div className="w-0.5 h-full bg-orange-100 group-hover:bg-orange-200 transition-colors my-1" />
                                    )}
                                </div>
                                <div className="pb-4">
                                    <p className="text-sm font-bold text-gray-900 capitalize">
                                        {entry.status}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {new Date(entry.timestamp).toLocaleString('en-IN', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short'
                                        })}
                                    </p>
                                    {entry.note && (
                                        <p className="text-sm text-gray-600 mt-2 bg-white px-3 py-2 rounded-lg border border-orange-100 inline-block">
                                            {entry.note}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-400 italic">No tracking updates available yet.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
                <MapPin size={14} />
                <span>Last updated from SmartFurni Logistics Center</span>
            </div>
        </div>
    );
};

export default OrderTracking;
