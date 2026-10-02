import React, { useEffect } from 'react';
import StaticLayout from '../components/StaticLayout';

const AboutUs = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <StaticLayout title="About SmartFurni">
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                    Welcome to <strong>SmartFurni</strong>, India's most trusted premium online furniture brand. 
                    We believe that your home is a reflection of your personality, and our mission is to help 
                    you transform your living spaces into sanctuaries of comfort and style.
                </p>
                <p>
                    From the very beginning, SmartFurni has focused on the three pillars of excellence: 
                    <strong>Premium Quality</strong>, <strong>Innovative Design</strong>, and <strong>Absolute Durability</strong>. 
                    Our collection is meticulously curated to bring you the best in contemporary and traditional furniture.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                    <div className="bg-orange-50 p-8 rounded-2xl border border-orange-100">
                        <h3 className="text-xl font-bold text-orange-600 mb-4">Our Vision</h3>
                        <p className="text-sm">To be the first choice for every Indian home seeking premium furniture that blends artistic design with long-lasting quality.</p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Our Craft</h3>
                        <p className="text-sm">Every piece of SmartFurni furniture is crafted using high-grade materials like seasoned Sheesham wood and premium upholstery fabrics.</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 pt-4">Why Choose Us?</h2>
                <ul className="list-disc pl-6 space-y-3">
                    <li><strong>Direct from Source:</strong> We cut out the middleman to provide premium furniture at honest prices.</li>
                    <li><strong>Quality Checks:</strong> Each product undergoes 30+ stringent quality tests before reaching your home.</li>
                    <li><strong>Expert Support:</strong> Our dedicated team of interior enthusiasts is always here to help you choose the right piece.</li>
                    <li><strong>Pan-India Delivery:</strong> We ensure your favorites reach you safely, no matter where you are.</li>
                </ul>
                
                <p className="pt-6 italic">
                    Join thousands of happy customers who have already transformed their homes with SmartFurni. 
                    Explore our collection today and experience the difference of true premium furniture.
                </p>
            </div>
        </StaticLayout>
    );
};

export default AboutUs;
