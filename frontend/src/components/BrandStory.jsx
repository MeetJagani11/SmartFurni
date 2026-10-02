import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Award, Zap, Heart, MapPin, Star, Ruler, Wallet, CheckCircle2 } from 'lucide-react';

const BrandStory = () => {
    return (
        <div className="bg-white py-16 md:py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Introduction Section */}
                <div className="text-center mb-20 max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        SmartFurni – Surat’s Trusted <span className="text-orange-600">Premium Furniture</span> Online/Offline Stores
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
                        If you’re looking for premium furniture in Surat, SmartFurni is your go-to destination. As a Surat-based furniture brand, we’ve reimagined how homes in Surat furnish their spaces. Every piece is designed with real materials, fair prices, Swadesi craftsmanship, and honest service at its core.
                    </p>
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-xl">
                        <p className="text-gray-700 italic">
                            With large-format Stores across Surat, 100+ products, and a 70,000 sq. ft. in-house manufacturing facility, we offer one of the largest assortments of Premium Furniture in Surat.
                        </p>
                    </div>
                </div>

                {/* Wholesale Prices Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
                            <Zap size={16} />
                            Wholesale-Like Prices, Everyday
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">Value Without Compromise</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            At SmartFurni, you don’t wait for a sale. We operate on a factory-direct, warehouse-style model meaning no middlemen, no inflated showroom costs, and no compromises. By building furniture in-house and keeping our stores practical, we ensure every Surat home gets access to Premium Furniture designs at wholesale-like prices, <span className="font-bold text-orange-600">50% lower than market</span>.
                        </p>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Whether you’re investing in a Sheesham sofa set, a marble dining table, a solid wood wardrobe, or premium tableware, you’ll always get real value for the unmatched quality they carry.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-orange-100 rounded-3xl blur-2xl opacity-50 -z-10"></div>
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
                            {[
                                { title: "Factory Direct", desc: "No middleman margins" },
                                { title: "Warehouse Model", desc: "No inflated showroom overheads" },
                                { title: "In-house Build", desc: "Complete quality control" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                                        <p className="text-gray-500 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Why SmartFurni Section - Grid of Features */}
                <div className="mb-24">
                    <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 italic">Why SmartFurni is Surat’s Favourite Destination</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Heart, title: "Proudly Indian", desc: "Designed and manufactured in Surat, celebrating Swadesi craftsmanship and local pride." },
                            { icon: Award, title: "Real Materials", desc: "Genuine Sheesham, Neem, and Acacia wood with premium GSM 350+ fabrics." },
                            { icon: Wallet, title: "Affordable Premium", desc: "Factory-direct pricing makes premium designs accessible at honest rates." },
                            { icon: Star, title: "Customization", desc: "50+ fabric options, modular layouts, and elegant finishes tailored to your style." },
                            { icon: ShieldCheck, title: "Post-Purchase Care", desc: "Lifetime termite protection, 3-year structural warranty, and 7-day returns." },
                            { icon: Truck, title: "On-Time Delivery", desc: "Ready pieces in 2-3 days, custom builds in 10-15 days across Surat." },
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-orange-100 group">
                                <feature.icon className="text-orange-600 mb-6 group-hover:scale-110 transition-transform" size={40} />
                                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Categories Layout */}
                <div className="space-y-24">
                    {/* Living Room */}
                    <div className="bg-gray-950 text-white rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-1 space-y-6">
                                <h3 className="text-4xl font-bold tracking-tight">Living Room <span className="text-orange-500">Furniture</span></h3>
                                <p className="text-gray-400 text-lg leading-relaxed">
                                    The living room is the heart of every home. SmartFurni’s collection brings both comfort and elegance with designs that balance timeless craftsmanship and modern functionality.
                                </p>
                            </div>
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-xl font-bold text-orange-400">Sofa Sets</h4>
                                    <p className="text-gray-400">Solid Sheesham wood, plush fabric sofas, and sectional sets built with kiln-dried frames and sag-resistant foam.</p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xl font-bold text-orange-400">Recliners</h4>
                                    <p className="text-gray-400">Single, double, and triple-seaters designed for true relaxation, perfect for movie nights or lazy weekends.</p>
                                </div>
                                <div className="space-y-4 md:col-span-2">
                                    <h4 className="text-xl font-bold text-orange-400">Coffee Tables</h4>
                                    <p className="text-gray-400">Solid wood or marble-top centerpieces that act as functional accents for hosting guests.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bedroom Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-4 space-y-6">
                            <h3 className="text-4xl font-extrabold text-gray-900">Bedroom <br/> Sanctuary</h3>
                            <p className="text-gray-600 text-lg">Your bedroom should reflect peace and comfort. We craft furniture that brings calm, organization, and timeless beauty.</p>
                            <div className="flex flex-wrap gap-3">
                                {["Sheesham Beds", "Wardrobes", "Nightstands", "Study Tables"].map(tag => (
                                    <span key={tag} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 border-l-2 border-orange-500 pl-6">
                                <h4 className="text-xl font-bold">Sheesham Wood Beds</h4>
                                <p className="text-gray-500">King & Queen size beds with hydraulic or box storage, finished in honey and walnut tones.</p>
                            </div>
                            <div className="space-y-4 border-l-2 border-orange-500 pl-6">
                                <h4 className="text-xl font-bold">Smart Wardrobes</h4>
                                <p className="text-gray-500">Spacious designs with multiple compartments and premium hardware to keep your essentials organized.</p>
                            </div>
                            <div className="space-y-4 border-l-2 border-orange-500 pl-6">
                                <h4 className="text-xl font-bold">Orthopedic Mattresses</h4>
                                <p className="text-gray-500">Mattresses designed for health and ease, features orthopedic support and high-resilience foam.</p>
                            </div>
                            <div className="space-y-4 border-l-2 border-orange-500 pl-6">
                                <h4 className="text-xl font-bold">Work From Home</h4>
                                <p className="text-gray-500">Ergonomic wooden study tables built to enhance focus and productivity in your Surat home.</p>
                            </div>
                        </div>
                    </div>

                    {/* Dining Room */}
                    <div className="bg-orange-600 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <h3 className="text-4xl font-bold">Dining Room Moments</h3>
                                <p className="text-orange-50 text-xl font-light leading-relaxed">
                                    Dining is about togetherness. Our Sheesham and Acacia wood tables make every occasion feel special.
                                </p>
                                <div className="flex gap-4">
                                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                        <div className="text-2xl font-bold">4-6 seater</div>
                                        <div className="text-xs uppercase opacity-70">Flexible Options</div>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                        <div className="text-2xl font-bold">Marble Top</div>
                                        <div className="text-xs uppercase opacity-70">Premium Tiers</div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6 bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                                <p className="text-lg">"No dining table is complete without comfortable seating. Our solid wood dining chairs with cushioned upholstery blend strength with comfort for those long family dinners."</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guide Section */}
                <div className="mt-32 border-t pt-24">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="h-px bg-gray-200 flex-grow"></div>
                        <h3 className="text-2xl font-bold text-gray-400 uppercase tracking-widest px-4">Expert Guide</h3>
                        <div className="h-px bg-gray-200 flex-grow"></div>
                    </div>
                    <h3 className="text-3xl font-bold text-center mb-16 text-gray-900">Things to Consider Before Buying Furniture</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {[
                            { id: "01", title: "Material Matters", desc: "Choose solid woods like Sheesham, Neem, or Acacia for maximum durability." },
                            { id: "02", title: "Space Planning", desc: "Visit our showrooms to check proportions and visualize the fit for your home." },
                            { id: "03", title: "Honest Pricing", desc: "With wholesale prices everyday, you get premium designs at fair rates." },
                            { id: "04", title: "Trust Factor", desc: "With 1000+ happy Surat customers, we have built a reputation on trust." },
                        ].map((tip, i) => (
                            <div key={i} className="space-y-4">
                                <div className="text-5xl font-black text-gray-100 leading-none">{tip.id}</div>
                                <h4 className="text-xl font-bold text-gray-900">{tip.title}</h4>
                                <p className="text-gray-500">{tip.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Locations Footer */}
                <div className="mt-32 text-center bg-gray-50 rounded-3xl p-12 border border-gray-100">
                    <MapPin className="text-orange-600 mx-auto mb-6" size={48} />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Visit SmartFurni – Surat’s Best Furniture Stores</h3>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-lg">
                        With showrooms spread across prime Surat locations, explore sofas, recliners, mattresses, and dining sets under one roof. 
                        Where Thoughtful Design Meets Everyday Comfort. 
                    </p>
                    <Link 
                        to="/our-stores"
                        className="inline-flex items-center gap-2 font-bold text-orange-600 text-lg hover:gap-4 transition-all cursor-pointer bg-orange-50 px-6 py-3 rounded-xl border border-orange-100 hover:bg-orange-100"
                    >
                        Find Our Locations <Truck size={20} />
                    </Link>
                    <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-500 font-medium tracking-wide italic">
                        Proudly Indian. Proudly Surat.
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BrandStory;
