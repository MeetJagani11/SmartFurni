import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import StaticLayout from '../components/StaticLayout';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';

const ContactUs = () => {
    const { toast } = useToast();
    const location = useLocation();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        if (location.state?.subject) {
            setFormData(prev => ({ ...prev, subject: location.state.subject }));
        }
    }, [location]);

    const handleInputChange = (e) => {
        const { id, value, name } = e.target;
        // The Input components might use 'id' or 'name', handle both
        const fieldName = name || id;
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            toast({
                title: "Message Sent!",
                description: "We've received your inquiry and will get back to you within 24 hours.",
            });
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        }, 1500);
    };

    return (
        <StaticLayout title="Contact Us">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Get in Touch</h2>
                        <p className="text-gray-600">Have questions about our products or an existing order? We're here to help.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Call Us</h3>
                                <p className="text-sm text-gray-600">+91 97235 26763</p>
                                <p className="text-xs text-gray-400 mt-1">Available 10 AM - 7 PM</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Email Us</h3>
                                <p className="text-sm text-gray-600">support@smartfurni.com</p>
                                <p className="text-xs text-gray-400 mt-1">Response within 24 hours</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Head Office</h3>
                                <p className="text-sm text-gray-600">Surat, Gujarat, India</p>
                                <p className="text-xs text-gray-400 mt-1">Visit any of our 12 stores for demos</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input 
                                    id="name"
                                    required 
                                    placeholder="Your name" 
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input 
                                    id="email"
                                    required 
                                    type="email" 
                                    placeholder="Email address" 
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject</label>
                            <Input 
                                id="subject"
                                required 
                                placeholder="How can we help?" 
                                value={formData.subject}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message</label>
                            <Textarea 
                                id="message"
                                required 
                                placeholder="Enter your detailed message" 
                                className="min-h-[150px]" 
                                value={formData.message}
                                onChange={handleInputChange}
                            />
                        </div>
                        <Button type="submit" disabled={submitting} className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg">
                            {submitting ? "Sending..." : "Send Message"}
                            <Send size={18} className="ml-2" />
                        </Button>
                    </form>
                </div>
            </div>
        </StaticLayout>
    );
};

export default ContactUs;
