import React, { useEffect } from 'react';
import StaticLayout from '../components/StaticLayout';
import { RefreshCw, ShieldCheck, CheckCircle } from 'lucide-react';

const ReturnPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <StaticLayout title="Return & Refund Policy">
            <div className="space-y-12">
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-xl">
                    <h2 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <RefreshCw size={20} />
                        7-Day Easy Returns
                    </h2>
                    <p className="text-blue-800">Your satisfaction is our priority. If you're not completely happy with your purchase, we've got you covered with our simple return policy.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 space-y-4">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mx-auto">
                            <span className="text-2xl font-bold">1</span>
                        </div>
                        <h3 className="font-bold">Raise Request</h3>
                        <p className="text-sm text-gray-500">Log a return request within 7 days of delivery through our website or customer care.</p>
                    </div>
                    <div className="text-center p-6 space-y-4">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mx-auto">
                            <span className="text-2xl font-bold">2</span>
                        </div>
                        <h3 className="font-bold">Quality Check</h3>
                        <p className="text-sm text-gray-500">Our logistics partner will pick up the item and it will undergo a quick inspection.</p>
                    </div>
                    <div className="text-center p-6 space-y-4">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mx-auto">
                            <span className="text-2xl font-bold">3</span>
                        </div>
                        <h3 className="font-bold">Instant Refund</h3>
                        <p className="text-sm text-gray-500">Once verified, we'll process your refund to your original payment method or wallet.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Policy Details</h2>
                    <div className="space-y-4 text-gray-700">
                        <div className="flex gap-4">
                            <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                            <p><strong>Condition:</strong> Products must be returned in their original condition, unused, and with all original packaging and accessories.</p>
                        </div>
                        <div className="flex gap-4">
                            <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                            <p><strong>Exceptions:</strong> Personalized or custom-made furniture items are not eligible for returns unless there's a manufacturing defect.</p>
                        </div>
                        <div className="flex gap-4">
                            <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                            <p><strong>Damages:</strong> If a product arrives damaged, please report it within 48 hours for an immediate replacement at no extra cost.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 text-white p-10 rounded-3xl text-center">
                    <h2 className="text-3xl font-bold mb-4">Peace of mind, guaranteed.</h2>
                    <p className="opacity-80 max-w-2xl mx-auto">We take full responsibility for our products. In case of any defects or issues, we're committed to making it right.</p>
                </div>
            </div>
        </StaticLayout>
    );
};

export default ReturnPolicy;
