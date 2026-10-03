import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Settings, Users, BarChart2, Sparkles, Sliders, ChevronLeft, ChevronRight } from 'lucide-react';
import logo from '../../assets/logo.png';

const AdminLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
        { name: 'Recommendation Rules', path: '/admin/recommendation-rules', icon: Sparkles },
        { name: 'Settings', path: '/admin/settings', icon: Sliders },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white border-r shadow-sm flex flex-col shrink-0 transition-all duration-300 ease-in-out relative`}>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-10 bg-white border shadow-md rounded-full p-1 text-gray-500 hover:text-orange-600 transition-colors z-10"
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                <div className={`p-6 pb-4 transition-all duration-300 ${isCollapsed ? 'px-3 justify-center' : 'px-6'}`}>
                    <Link to="/admin" className="flex items-center gap-3.5 group">
                        <div className="w-14 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                            <img src={logo} alt="SmartFurni Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className={`transition-all duration-300 origin-left ${isCollapsed ? 'opacity-0 scale-0 w-0' : 'opacity-100 scale-100'}`}>
                            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight whitespace-nowrap">Admin<span className="text-orange-600">Pulse</span></h2>
                            <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase whitespace-nowrap">SmartFurni Hub</p>
                        </div>
                    </Link>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                title={isCollapsed ? item.name : ''}
                                className={`flex items-center py-3.5 text-sm transition-all duration-200 whitespace-nowrap relative ${isCollapsed ? 'px-0 justify-center' : 'px-8'} ${isActive
                                    ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-600 font-bold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-orange-500'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-orange-600' : 'text-gray-400'} ${isCollapsed ? '' : 'mr-3.5'}`} />
                                <span className={`transition-all duration-300 origin-left ${isCollapsed ? 'opacity-0 scale-0 w-0' : 'opacity-100 scale-100'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto h-screen transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
