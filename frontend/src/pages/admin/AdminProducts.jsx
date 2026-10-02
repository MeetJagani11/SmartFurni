import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, X, Upload, CheckCircle2, XCircle, BarChart3, AlertTriangle, Check } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const AdminProducts = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        category: '',
        image: '',
        marketPrice: '',
        smartFurniPrice: '',
        discount: '',
        stockStatus: 'in_stock',
        sustainabilityScore: 5
    });

    const fetchProducts = React.useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/admin/products/?limit=1000`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(res.data);
        } catch (error) {
            toast({ title: 'Error fetching products', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (user?.is_admin) fetchProducts();
    }, [user, fetchProducts]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetForm = () => {
        setFormData({
            id: '', name: '', description: '', category: '', image: '',
            marketPrice: '', smartFurniPrice: '', discount: '',
            stockStatus: 'in_stock',
            sustainabilityScore: 5
        });
        setIsEditing(false);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setFormData({
            id: product.id,
            name: product.name,
            description: product.description || '',
            category: product.category,
            image: product.image,
            marketPrice: product.marketPrice,
            smartFurniPrice: product.smartFurniPrice,
            discount: product.discount,
            stockStatus: product.stockStatus || 'in_stock',
            sustainabilityScore: product.sustainabilityScore || 5
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/admin/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: 'Product deleted' });
            fetchProducts();
        } catch (error) {
            toast({ title: 'Failed to delete product', variant: 'destructive' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Format numbers
            const payload = {
                ...formData,
                marketPrice: parseFloat(formData.marketPrice),
                smartFurniPrice: parseFloat(formData.smartFurniPrice),
                discount: parseInt(formData.discount),
                sustainabilityScore: parseInt(formData.sustainabilityScore),
                stockStatus: formData.stockStatus
            };

            if (isEditing) {
                const { id, ...updateData } = payload;
                await axios.put(`${API_BASE_URL}/admin/products/${formData.id}`, updateData, config);
                toast({ title: 'Product updated successfully' });
            } else {
                const { id, ...createData } = payload;
                await axios.post(`${API_BASE_URL}/admin/products/`, createData, config);
                toast({ title: 'Product created successfully' });
            }

            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            toast({
                title: isEditing ? 'Failed to update' : 'Failed to create',
                description: error.response?.data?.detail || error.message,
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                <Button onClick={openCreateModal} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b text-sm text-gray-500 uppercase">
                                <th className="p-4 font-semibold">Product</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold">Price</th>
                                <th className="p-4 font-semibold">Eco</th>
                                <th className="p-4 font-semibold">Stock</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading products...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No products found.</td></tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 flex items-center space-x-3">
                                            <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover border shadow-sm" />
                                            <div>
                                                <p className="font-semibold text-gray-900 leading-tight">{product.name}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 capitalize text-sm">{product.category}</td>
                                        <td className="p-4">
                                            <p className="font-bold text-gray-900">₹{product.smartFurniPrice?.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 line-through">₹{product.marketPrice?.toLocaleString()}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-1.5">
                                                <BarChart3 className="w-3 h-3 text-emerald-500" />
                                                <span className="text-xs font-bold text-emerald-700">{product.sustainabilityScore || 5}</span>
                                                <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full"
                                                        style={{ width: `${(product.sustainabilityScore || 5) * 10}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-tight shadow-sm whitespace-nowrap bg-white border border-gray-100">
                                                {product.stockStatus === 'in_stock' ? (
                                                    <div className="flex items-center text-emerald-600">
                                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                        <span>In Stock</span>
                                                    </div>
                                                ) : product.stockStatus === 'few_available' ? (
                                                    <div className="flex items-center text-amber-600">
                                                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                                                        <span>Few Available</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-rose-600">
                                                        <XCircle className="w-3.5 h-3.5 mr-1" />
                                                        <span>Out of Stock</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => openEditModal(product)} className="p-2 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all shadow-sm bg-white" title="Edit Product">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => deleteProduct(product.id)} className="p-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all shadow-sm bg-white" title="Delete Product">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Product Name</Label>
                                    <Input name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Sofa Sets">Sofa & Recliners</option>
                                        <option value="Bedroom">Bedroom</option>
                                        <option value="Dining">Dining</option>
                                        <option value="Storage">Storage</option>
                                        <option value="Study & Office">Study & Office</option>
                                        <option value="Reclaimed & Distressed">Reclaimed & Distressed</option>
                                        <option value="Mattresses">Mattresses</option>
                                        <option value="Home Temple">Home Temple</option>
                                        <option value="New Launch">New Launch</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Market Price (₹)</Label>
                                    <Input name="marketPrice" type="number" value={formData.marketPrice} onChange={handleInputChange} required min="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label>SmartFurni Price (₹) (Selling Price)</Label>
                                    <Input name="smartFurniPrice" type="number" value={formData.smartFurniPrice} onChange={handleInputChange} required min="0" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Discount (%)</Label>
                                    <Input name="discount" type="number" value={formData.discount} onChange={handleInputChange} required min="0" max="100" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Image URL (Primary)</Label>
                                    <Input name="image" value={formData.image} onChange={handleInputChange} required placeholder="https://..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Sustainability Score (1-10)</Label>
                                    <Input
                                        name="sustainabilityScore"
                                        type="number"
                                        value={formData.sustainabilityScore}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                        max="10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                                    placeholder="Product description and details..."
                                />
                            </div>

                            <div className="space-y-3 border-t pt-4">
                                <Label className="text-gray-900 font-bold">Stock Status (Select one)</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'in_stock', label: 'In Stock', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                                        { id: 'few_available', label: 'Few Available', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700' },
                                        { id: 'out_of_stock', label: 'Out of Stock', color: 'rose', bg: 'bg-rose-50', text: 'text-rose-700' }
                                    ].map((status) => (
                                        <div 
                                            key={status.id}
                                            onClick={() => setFormData(prev => ({ ...prev, stockStatus: status.id }))}
                                            className={`cursor-pointer flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                                                formData.stockStatus === status.id 
                                                ? `border-gray-900 ${status.bg} ring-2 ring-gray-900/5` 
                                                : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                                            }`}
                                        >
                                            <span className={`text-xs font-bold uppercase tracking-tight ${formData.stockStatus === status.id ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {status.label}
                                            </span>
                                            {formData.stockStatus === status.id && (
                                                <div className="bg-gray-900 rounded-full p-1 shadow-sm">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                                    {isEditing ? 'Save Changes' : 'Create Product'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminProducts;
