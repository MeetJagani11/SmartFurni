import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaticLayout from '../components/StaticLayout';
import { MapPin, Clock, Phone } from 'lucide-react';

const OurStores = () => {
    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const stores = [
        { name: 'Adajan', hours: '10:00 AM – 9:00 PM (Daily)', contact: '+91 97235 26761' },
        { name: 'Vesu', hours: '10:30 AM – 9:30 PM (Daily)', contact: '+91 97235 26762' },
        { name: 'Piplod', hours: '10:00 AM – 8:30 PM (Daily)', contact: '+91 97235 26763' },
        { name: 'City Light', hours: '11:00 AM – 9:30 PM (Daily)', contact: '+91 97235 26764' },
        { name: 'Althan', hours: '10:30 AM – 9:00 PM (Daily)', contact: '+91 97235 26765' },
        { name: 'Katargam', hours: '10:00 AM – 8:00 PM (Daily)', contact: '+91 97235 26766' },
        { name: 'Varachha', hours: '10:30 AM – 9:30 PM (Daily)', contact: '+91 97235 26767' },
        { name: 'Udhna', hours: '10:00 AM – 8:30 PM (Daily)', contact: '+91 97235 26768' },
        { name: 'Dindoli', hours: '11:00 AM – 9:00 PM (Daily)', contact: '+91 97235 26769' },
        { name: 'Athwa', hours: '10:30 AM – 9:00 PM (Daily)', contact: '+91 97235 26770' },
        { name: 'Pal', hours: '10:00 AM – 8:30 PM (Daily)', contact: '+91 97235 26771' },
        { name: 'Sarthana', hours: '10:30 AM – 9:30 PM (Daily)', contact: '+91 97235 26772' }
    ];

    return (
        <StaticLayout title="Our Experience Centers">
            <div className="space-y-8">
                <p className="text-lg text-gray-700">
                    Come visit us and experience the quality and comfort of SmartFurni furniture in person. 
                    Our stores feature a wide range of sofas, beds, dining sets, and more.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stores.map((store, index) => (
                        <div key={index} className="bg-white border border-gray-200 p-6 rounded-xl hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="text-orange-600" size={18} />
                                SmartFurni {store.name}
                            </h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex gap-2">
                                    <Clock size={16} className="mt-0.5" />
                                    <span>Open: {store.hours}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Phone size={16} className="mt-0.5" />
                                    <span>Contact: {store.contact}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-orange-600 text-white p-8 rounded-2xl text-center mt-12">
                    <h2 className="text-2xl font-bold mb-4">Want a personal consultation?</h2>
                    <p className="mb-6 opacity-90">Book an appointment at our nearest store for a guided tour and expert advice.</p>
                    <button 
                        onClick={() => navigate('/contact-us', { state: { subject: 'Book a Free Visit' } })}
                        className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors"
                    >
                        Book a Free Visit
                    </button>
                </div>
            </div>
        </StaticLayout>
    );
};

export default OurStores;
