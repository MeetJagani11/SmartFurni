import React, { useEffect } from 'react';
import StaticLayout from '../components/StaticLayout';
import { Lock, Shield, Eye } from 'lucide-react';

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <StaticLayout title="Privacy Policy">
            <div className="space-y-8 text-gray-700">
                <p className="text-lg">
                    At SmartFurni, we respect your privacy and are committed to protecting your personal data. 
                    This policy outlines how we collect, use, and safeguard your information when you visit our website.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
                    <div className="p-6 bg-gray-50 rounded-2xl text-center space-y-3">
                        <Lock className="mx-auto text-orange-600" size={32} />
                        <h3 className="font-bold">Encryption</h3>
                        <p className="text-xs">All your data is encrypted using industry-standard SSL technology.</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-2xl text-center space-y-3">
                        <Shield className="mx-auto text-orange-600" size={32} />
                        <h3 className="font-bold">Security</h3>
                        <p className="text-xs">We never sell your data to third parties. Your information stays with us.</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-2xl text-center space-y-3">
                        <Eye className="mx-auto text-orange-600" size={32} />
                        <h3 className="font-bold">Transparency</h3>
                        <p className="text-xs">You have total control over what information you share with us.</p>
                    </div>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Information We Collect</h2>
                    <p>When you use SmartFurni, we collect information you provide, such as your name, email, shipping address, and phone number, solely to process your orders and provide a personalized experience.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Use of Cookies</h2>
                    <p>We use cookies to improve your browsing experience, remember your cart items, and understand how you interact with our site. You can always disable cookies in your browser settings.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Your Rights</h2>
                    <p>You have the right to access, update, or delete your personal information at any time. Simply log in to your account or contact our support team for assistance.</p>
                </section>

                <p className="text-sm text-gray-400 pt-8 border-t">
                    Last Updated: March 2025. SmartFurni reserves the right to update this policy as needed.
                </p>
            </div>
        </StaticLayout>
    );
};

export default PrivacyPolicy;
