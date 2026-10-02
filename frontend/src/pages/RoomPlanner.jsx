import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import FabricCanvas from '../components/Planner/FabricCanvas';
import Room3DViewer from '../components/Planner/Room3DViewer';
import FurnitureLibrary from '../components/Planner/FurnitureLibrary';
import AutoLayoutModal from '../components/Planner/AutoLayoutModal';
import { Layout, Save, Trash2, ArrowLeft, Loader2, Maximize2, RotateCcw, Sparkles, AlertTriangle, Box, Plus, Edit2, Check, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';

const RoomPlanner = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [layouts, setLayouts] = useState([]);
    const [currentLayout, setCurrentLayout] = useState({
        name: "My New Room",
        room_length: 5,
        room_width: 5,
        items: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isAutoLayoutOpen, setIsAutoLayoutOpen] = useState(false);
    const [viewMode, setViewMode] = useState('2D'); // '2D' or '3D'
    const [editingLayoutId, setEditingLayoutId] = useState(null);
    const [tempName, setTempName] = useState("");
    const [canvasKey, setCanvasKey] = useState(0);

    // Budget Tracking
    const [currentItems, setCurrentItems] = useState([]);
    const [maxBudget, setMaxBudget] = useState(100000);
    const totalCost = currentItems.reduce((acc, item) => acc + (item.price || 0), 0);
    const isOverBudget = totalCost > maxBudget;
    const validateAddition = (product) => {
        const price = product.smart_furni_price || product.price || 0;
        if (totalCost + price > maxBudget) {
            toast({
                title: "Budget Exceeded!",
                description: `Adding "${product.name}" (₹${price.toLocaleString()}) would exceed your maximum budget of ₹${maxBudget.toLocaleString()}.`,
                variant: "destructive"
            });
            return false;
        }
        return true;
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchLayouts();
    }, [token, navigate]);

    const fetchLayouts = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/planner/layouts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLayouts(res.data);
            if (res.data.length > 0) {
                // Load most recent or first layout?
                // For now, let's keep the empty one or load the first if any
            }
        } catch (err) {
            console.error("Failed to fetch layouts", err);
        } finally {
            setLoading(false);
        }
    };    const handleNewLayout = () => {
        if (currentItems.length > 0 && !window.confirm("Start a new design? Any unsaved changes will be lost.")) return;
        
        setCurrentLayout({
            name: "My New Room",
            room_length: 5,
            room_width: 5,
            items: []
        });
        setCurrentItems([]);
        setCanvasKey(prev => prev + 1);
        if (window.plannerClearCanvas) window.plannerClearCanvas();
        toast({ title: "New Design Started", description: "Canvas has been cleared." });
    };

    const handleRenameLayout = async (layoutId) => {
        if (!tempName.trim()) return;
        try {
            const layout = layouts.find(l => (l.id || l._id) === layoutId);
            const cleanLayout = {
                name: tempName,
                room_length: layout.room_length,
                room_width: layout.room_width,
                items: layout.items.map(item => ({
                    product_id: item.product_id,
                    name: item.name || "Furniture",
                    x: item.x,
                    y: item.y,
                    rotation: item.rotation || 0,
                    width: item.width || 0.5,
                    length: item.length || 0.5,
                    image: item.image || null
                }))
            };

            await axios.put(`${API_BASE_URL}/planner/layouts/${layoutId}`, cleanLayout, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: "Renamed!", description: "Layout name updated." });
            setEditingLayoutId(null);
            fetchLayouts();
            
            // If renaming the current one, update it
            if ((currentLayout.id || currentLayout._id) === layoutId) {
                setCurrentLayout(prev => ({ ...prev, name: tempName }));
            }
        } catch (err) {
            toast({ title: "Rename Failed", description: err.message, variant: "destructive" });
        }
    };

    const handleSave = async (items) => {
        try {
            setSaving(true);
            
            const cleanItems = items.map(item => ({
                product_id: item.product_id,
                name: item.name || "Furniture",
                x: item.x,
                y: item.y,
                rotation: item.rotation || 0,
                width: item.width || 0.5,
                length: item.length || 0.5,
                image: item.image || null
            }));

            const payload = {
                name: currentLayout.name,
                room_length: currentLayout.room_length,
                room_width: currentLayout.room_width,
                items: cleanItems
            };
            
            const layoutId = currentLayout._id || currentLayout.id;
            
            if (layoutId) {
                // Update existing layout
                await axios.put(`${API_BASE_URL}/planner/layouts/${layoutId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast({ title: "Layout Updated!", description: "Changes have been saved to this design." });
            } else {
                // Create new layout
                const res = await axios.post(`${API_BASE_URL}/planner/layouts`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast({ title: "Draft Saved!", description: "New layout created successfully." });
                // Set the current layout to the newly created one to avoid future duplicates
                setCurrentLayout(res.data);
            }
            
            fetchLayouts();
        } catch (err) {
            console.error("Save Design Error Details:", err);
            const errMsg = err.response?.data?.detail || err.message || "Network Error";
            toast({ title: "Error Saving", description: errMsg, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLayout = async (e, layoutId) => {
        e.stopPropagation(); // Prevent loading the layout when clicking delete

        if (!window.confirm("Are you sure you want to delete this layout?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/planner/layouts/${layoutId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: "Layout Deleted", description: "Design has been removed." });

            // Clear current if it was the one deleted
            const deletedId = layoutId;
            const currentId = currentLayout._id || currentLayout.id;
            if (currentId === deletedId) {
                setCurrentLayout({
                    name: "My New Room",
                    room_length: 5,
                    room_width: 5,
                    items: []
                });
            }

            fetchLayouts();
        } catch (err) {
            toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
        }
    };

    const generateAutoLayout = async ({ roomType, style }) => {
        try {
            // 1. Clear Canvas
            if (window.plannerClearCanvas) {
                window.plannerClearCanvas();
            }

            // 2. Fetch or filter products (Using general products endpoint)
            const res = await axios.get(`${API_BASE_URL}/products/`);
            const allProducts = res.data;

            // Simple search helper
            const findItem = (kw) => {
                // Try to find by style and keyword first
                let match = allProducts.find(p => p.name.toLowerCase().includes(kw) && p.category.toLowerCase().includes(style));
                if (!match) match = allProducts.find(p => p.name.toLowerCase().includes(kw));
                // Fallback to first item in category if keyword fails
                if (!match) match = allProducts.find(p => p.category.toLowerCase().includes(kw));
                return match;
            };

            const PPM = 80;
            const RL = currentLayout.room_length * PPM;
            const RW = currentLayout.room_width * PPM;
            const cx = RL / 2; // Center X
            const cy = RW / 2; // Center Y

            // Helper to snap coordinates to 0.25m grid (PPM/4 = 20px)
            const snap = (val) => Math.floor(val / 20) * 20;

            const itemsToAdd = [];

            if (roomType === 'bedroom') {
                const bed = findItem('bed');
                if (bed) {
                    const bw = (bed.width || 0.5) * PPM;
                    const bl = (bed.length || 0.5) * PPM;
                    // Bed top center against North wall
                    itemsToAdd.push({ product: bed, options: { left: snap(cx - bw / 2), top: snap(20), rotation: 0 } });

                    const sideTable = findItem('table') || findItem('stand');
                    if (sideTable) {
                        const sw = (sideTable.width || 0.5) * PPM;
                        itemsToAdd.push({ product: sideTable, options: { left: snap(cx - bw / 2 - sw - 20), top: snap(20), rotation: 0 } });
                        itemsToAdd.push({ product: sideTable, options: { left: snap(cx + bw / 2 + 20), top: snap(20), rotation: 0 } });
                    }
                }
                const wardrobe = findItem('wardrobe') || findItem('cabinet');
                if (wardrobe) {
                    itemsToAdd.push({ product: wardrobe, options: { left: snap(RL - ((wardrobe.width || 0.5) * PPM) - 20), top: snap(RW - ((wardrobe.length || 0.5) * PPM) - 20), rotation: 0 } });
                }

            } else if (roomType === 'living') {
                const sofa = findItem('sofa');
                if (sofa) {
                    const sw = (sofa.width || 0.5) * PPM;
                    const sl = (sofa.length || 0.5) * PPM;
                    // Center bottom
                    itemsToAdd.push({ product: sofa, options: { left: snap(cx - sw / 2), top: snap(RW - sl - 40), rotation: 0 } });

                    const table = findItem('table') || findItem('coffee');
                    if (table) {
                        const tw = (table.width || 0.5) * PPM;
                        const tl = (table.length || 0.5) * PPM;
                        itemsToAdd.push({ product: table, options: { left: snap(cx - tw / 2), top: snap(RW - sl - tl - 100), rotation: 0 } });
                    }
                }
                const tv = findItem('tv') || findItem('console');
                if (tv) {
                    const tvw = (tv.width || 0.5) * PPM;
                    itemsToAdd.push({ product: tv, options: { left: snap(cx - tvw / 2), top: snap(20), rotation: 0 } });
                }

            } else if (roomType === 'dining') {
                const table = findItem('dining') || findItem('table');
                if (table) {
                    const tw = (table.width || 0.5) * PPM;
                    const tl = (table.length || 0.5) * PPM;
                    itemsToAdd.push({ product: table, options: { left: snap(cx - tw / 2), top: snap(cy - tl / 2), rotation: 0 } });

                    const chair = findItem('chair');
                    if (chair) {
                        const cw = (chair.width || 0.5) * PPM;
                        const cl = (chair.length || 0.5) * PPM;
                        // Place 4 chairs around
                        itemsToAdd.push({ product: chair, options: { left: snap(cx - tw / 2 - cw - 20), top: snap(cy - cl / 2), rotation: 90 } });
                        itemsToAdd.push({ product: chair, options: { left: snap(cx + tw / 2 + 20), top: snap(cy - cl / 2), rotation: -90 } });
                    }
                }
            }

            // Stagger addition slightly to let Fabric render
            itemsToAdd.forEach((item, index) => {
                setTimeout(() => {
                    if (window.plannerAddProduct) window.plannerAddProduct(item.product, item.options);
                }, index * 100);
            });

            toast({ title: "Auto Layout Generated!", description: `A ${style} ${roomType} layout was applied.` });

        } catch (err) {
            console.error(err);
            toast({ title: "Generation failed", description: "Could not generate layout.", variant: "destructive" });
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-orange-600" size={40} />
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

            {/* Header */}
            <div className="bg-white border-b px-6 h-16 flex items-center justify-between shadow-sm z-30">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="font-bold text-gray-900 border-none focus:ring-0 text-lg">
                            <input
                                value={currentLayout.name}
                                onChange={(e) => setCurrentLayout({ ...currentLayout, name: e.target.value })}
                                className="bg-transparent focus:outline-none focus:border-b border-orange-200"
                            />
                        </h1>
                        <p className="text-xs text-gray-400">Virtual Room Planner</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border">
                        <Maximize2 size={14} />
                        <span>Room: {currentLayout.room_length}m x {currentLayout.room_width}m</span>
                    </div>

                    {/* Budget Tracker UI */}
                    <div className={`flex items-center gap-3 mr-4 text-sm px-3 py-1.5 rounded-lg border transition-colors ${isOverBudget ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                        <div className="flex items-center gap-2 font-semibold">
                            {isOverBudget && <AlertTriangle size={14} className="text-red-500" />}
                            <span>Total: ₹{totalCost.toLocaleString()}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">Max:</span>
                            <div className="relative">
                                <span className="absolute left-1 top-1/2 -translate-y-1/2 font-medium text-gray-500">₹</span>
                                <input
                                    type="number"
                                    value={maxBudget || ''}
                                    onChange={(e) => setMaxBudget(parseInt(e.target.value) || 0)}
                                    className={`w-20 pl-4 py-0.5 bg-transparent border-b outline-none text-right font-medium ${isOverBudget ? 'border-red-300 text-red-700' : 'border-gray-300 text-gray-700'}`}
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="secondary"
                        size="sm"
                        className="gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                        onClick={() => setIsAutoLayoutOpen(true)}
                    >
                        <Sparkles size={16} /> Auto Layout
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.location.reload()}
                    >
                        <RotateCcw size={16} /> Reset
                    </Button>
                    <div className="flex border rounded-md overflow-hidden mr-2">
                        <button
                            className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 ${viewMode === '2D' ? 'bg-orange-100 text-orange-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            onClick={() => setViewMode('2D')}
                        >
                            <Layout size={14} /> 2D
                        </button>
                        <button
                            className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 ${viewMode === '3D' ? 'bg-orange-100 text-orange-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            onClick={() => setViewMode('3D')}
                        >
                            <Box size={14} /> 3D
                        </button>
                    </div>
                    <Button
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 gap-2 shadow-md shadow-orange-100"
                        onClick={() => document.getElementById('canvas-save-trigger').click()}
                        disabled={saving}
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Design
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Library */}
                <FurnitureLibrary onSelectProduct={(p) => window.plannerAddProduct(p)} />

                {/* Center - Canvas */}
                <div className="flex-1 relative bg-gray-200 p-8 overflow-hidden">
                    {viewMode === '2D' ? (
                        <FabricCanvas
                            key={canvasKey + (currentLayout.id || currentLayout._id || 'new')}
                            roomLength={currentLayout.room_length}
                            roomWidth={currentLayout.room_width}
                            onSave={handleSave}
                            onItemsUpdate={setCurrentItems}
                            initialItems={currentLayout.items}
                            validateAddition={validateAddition}
                        />
                    ) : (
                        <Room3DViewer
                            items={currentItems}
                            roomLength={currentLayout.room_length}
                            roomWidth={currentLayout.room_width}
                        />
                    )}
                </div>

                {/* Right Panel - Saved Layouts */}
                <div className="w-72 bg-white border-l flex flex-col hidden lg:flex">
                    <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Layout size={18} className="text-orange-500" />
                            Saved Layouts
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-100 hover:text-orange-700 rounded-full"
                            onClick={handleNewLayout}
                            title="Add New Layout"
                        >
                            <Plus size={18} />
                        </Button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {layouts.map(l => {
                            const id = l.id || l._id;
                            const isEditing = editingLayoutId === id;
                            const isActive = (currentLayout.id || currentLayout._id) === id;

                            return (
                                <div
                                    key={id}
                                    className={`p-3 rounded-xl border transition-all group relative ${isActive ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200' : 'bg-white border-gray-100 hover:border-orange-300 hover:bg-orange-50/50'}`}
                                    onClick={() => !isEditing && setCurrentLayout(l)}
                                >
                                    {isEditing ? (
                                        <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                                            <input
                                                autoFocus
                                                value={tempName}
                                                onChange={e => setTempName(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleRenameLayout(id)}
                                                className="w-full text-sm font-medium p-1.5 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-200"
                                            />
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => setEditingLayoutId(null)} className="p-1 px-2 text-[10px] font-bold text-gray-400 hover:text-gray-600">CANCEL</button>
                                                <button onClick={() => handleRenameLayout(id)} className="p-1 px-2 text-[10px] font-bold text-white bg-orange-500 rounded hover:bg-orange-600">SAVE</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1 cursor-pointer">
                                                <div className="text-sm font-semibold text-gray-800 line-clamp-1">{l.name}</div>
                                                <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                    <span>Updated: {new Date(l.updated_at).toLocaleDateString()}</span>
                                                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 ml-1"></span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingLayoutId(id);
                                                        setTempName(l.name);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-100/50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteLayout(e, id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {layouts.length === 0 && (
                            <div className="text-center py-12 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                <Box className="mx-auto text-gray-300 mb-2" size={24} />
                                <p className="text-xs text-gray-400">No saved designs yet.</p>
                                <button onClick={handleNewLayout} className="mt-3 text-xs font-bold text-orange-600 hover:text-orange-700">CREATE FIRST DESIGN</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AutoLayoutModal
                isOpen={isAutoLayoutOpen}
                onClose={() => setIsAutoLayoutOpen(false)}
                onGenerate={generateAutoLayout}
            />
        </div>
    );
};

export default RoomPlanner;
