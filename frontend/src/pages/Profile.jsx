import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { LogOut, User, Mail, Phone, Calendar, Package, Camera, Loader2, Heart } from 'lucide-react';
import RecommendationsCarousel from '../components/RecommendationsCarousel';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { toast } from '../hooks/use-toast';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const Profile = () => {
    const { user, logout, token, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        email: '',
        phone: ''
    });
    const [saving, setSaving] = useState(false);

    // Update editData when user is loaded
    React.useEffect(() => {
        if (user) {
            setEditData({
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await axios.put(`${API_BASE_URL}/user/profile/`, editData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            toast({ title: "Success", description: "Profile updated successfully!" });
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error("Update error:", error);
            toast({
                title: "Update Failed",
                description: error.response?.data?.detail || "Could not update profile.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast({ title: "Invalid File", description: "Please select an image file.", variant: "destructive" });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await axios.post(`${API_BASE_URL}/user/profile/upload-picture`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            toast({ title: "Success", description: "Profile picture updated successfully!" });
            // The AuthContext might need to be refreshed or the user object updated locally
            window.location.reload(); // Quickest way to sync
        } catch (error) {
            console.error("Upload error:", error);
            toast({ title: "Upload Failed", description: error.response?.data?.detail || "Could not upload image.", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    <p className="text-gray-500 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Please log in to view your profile.</p>
                <Button onClick={() => navigate('/login')} className="ml-4">Login</Button>
            </div>
        );
    }

    // Helper to get initials
    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-50 to-transparent -z-10"></div>
            <div className="absolute top-20 right-[-10%] w-96 h-96 bg-orange-200/20 rounded-full blur-[120px] -z-10"></div>
            <div className="absolute bottom-20 left-[-10%] w-96 h-96 bg-red-100/20 rounded-full blur-[120px] -z-10"></div>

            <div className="max-w-6xl mx-auto relative">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">My Account</h1>
                    <div className="h-1.5 w-20 bg-orange-600 rounded-full"></div>
                </header>

                <div className="grid gap-8 lg:grid-cols-12 items-start">
                    {/* Sidebar / User Info Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-orange-600 to-red-600 opacity-10 -z-10"></div>
                            
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <div className="absolute -inset-1 bg-gradient-to-tr from-orange-600 to-red-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                    <Avatar className="h-32 w-32 border-4 border-white shadow-2xl relative">
                                        <AvatarImage
                                            src={user.profile_picture ? `${API_BASE_URL.replace('/api', '')}${user.profile_picture}` : ""}
                                            alt={user.name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="text-4xl bg-orange-50 text-orange-600 font-bold">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />

                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="absolute bottom-1 right-1 p-3 bg-white border border-gray-100 rounded-2xl text-orange-600 shadow-xl hover:bg-orange-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 disabled:bg-gray-100"
                                        title="Change Photo"
                                    >
                                        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                                    </button>
                                </div>

                                <h2 className="text-2xl font-bold text-slate-900 mb-1">{user.name}</h2>
                                <p className="text-slate-500 font-medium mb-8 flex items-center gap-1.5">
                                    <Mail size={14} className="text-orange-500" /> {user.email}
                                </p>

                                <div className="w-full space-y-3">
                                    <button 
                                        onClick={() => navigate('/orders')}
                                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-orange-600 hover:text-white rounded-2xl transition-all group/btn"
                                    >
                                        <span className="flex items-center gap-3 font-semibold">
                                            <Package size={20} className="group-hover/btn:text-white text-orange-600" />
                                            My Orders
                                        </span>
                                        <span className="text-slate-400 group-hover/btn:text-white">→</span>
                                    </button>

                                    <button 
                                        onClick={() => navigate('/wishlist')}
                                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-orange-600 hover:text-white rounded-2xl transition-all group/btn"
                                    >
                                        <span className="flex items-center gap-3 font-semibold">
                                            <Heart size={20} className="group-hover/btn:text-white text-orange-600" />
                                            My Wishlist
                                        </span>
                                        <span className="text-slate-400 group-hover/btn:text-white">→</span>
                                    </button>

                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-3 p-4 mt-4 border-2 border-slate-100 text-slate-600 hover:border-red-100 hover:bg-red-50 hover:text-red-600 font-bold rounded-2xl transition-all"
                                    >
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="lg:col-span-8">
                        <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[2.5rem] overflow-hidden">
                            <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">Account Details</h3>
                                    <p className="text-slate-500 font-medium tracking-tight">Manage your personal information and preferences.</p>
                                </div>
                                {!isEditing ? (
                                    <Button 
                                        variant="outline" 
                                        className="rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50 font-bold px-6 py-5"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <div className="flex gap-3">
                                        <Button 
                                            variant="ghost" 
                                            className="rounded-xl text-slate-500 font-bold px-6 py-5"
                                            onClick={() => setIsEditing(false)} 
                                            disabled={saving}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-5 shadow-lg shadow-orange-100"
                                            onClick={handleSaveProfile} 
                                            disabled={saving}
                                        >
                                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 md:p-10 space-y-10">
                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                                                <User size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-bold">{user.name}</span>
                                                <span className="text-[10px] text-slate-400 uppercase font-black">Verified Identity</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Member Since</Label>
                                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                                                <Calendar size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-bold">
                                                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="text-[10px] text-orange-600 uppercase font-black">Platinum Member</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                                    {isEditing ? (
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                                            <Input
                                                id="email"
                                                name="email"
                                                value={editData.email}
                                                onChange={handleInputChange}
                                                className="pl-14 h-16 rounded-2xl border-slate-200 focus:ring-orange-500 focus:border-orange-500 text-slate-900 font-bold"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 p-5 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                            <Mail className="text-slate-400" size={20} />
                                            <span className="text-slate-700 font-bold">{user.email}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-slate-400">Phone Number</Label>
                                    {isEditing ? (
                                        <div className="relative group">
                                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={editData.phone}
                                                onChange={handleInputChange}
                                                className="pl-14 h-16 rounded-2xl border-slate-200 focus:ring-orange-500 focus:border-orange-500 text-slate-900 font-bold"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 p-5 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                            <Phone className="text-slate-400" size={20} />
                                            <span className="text-slate-700 font-bold">{user.phone || 'Not linked yet'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20">
                    <RecommendationsCarousel />
                </div>
            </div>
        </div>
    );
};

export default Profile;
