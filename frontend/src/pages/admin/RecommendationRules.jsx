import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Settings, Plus, Trash2, Edit, X, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const RecommendationRules = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [realCategories, setRealCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        room_size_range: 'medium',
        budget_range: 'standard',
        style: 'modern',
        recommended_category: '',
        priority: 0,
        is_active: true
    });

    const fetchDropdownData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const [rulesRes, catsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/recommendation_rules/`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/categories/`)
            ]);
            setRules(rulesRes.data);
            setRealCategories(catsRes.data.map(cat => cat.name));
        } catch (error) {
            console.error("Fetch error:", error);
            toast({ title: 'Error fetching data', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.is_admin) fetchDropdownData();
    }, [user]);

    const handleOpenModal = (rule = null) => {
        if (rule) {
            setEditingRule(rule);
            setFormData({
                name: rule.name,
                description: rule.description || '',
                room_size_range: rule.room_size_range,
                budget_range: rule.budget_range,
                style: rule.style,
                recommended_category: rule.recommended_category,
                priority: rule.priority,
                is_active: rule.is_active
            });
        } else {
            setEditingRule(null);
            setFormData({
                name: '',
                description: '',
                room_size_range: 'medium',
                budget_range: 'standard',
                style: 'modern',
                recommended_category: '',
                priority: 0,
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRule(null);
        setFormData({
            name: '',
            description: '',
            room_size_range: 'medium',
            budget_range: 'standard',
            style: 'modern',
            recommended_category: '',
            priority: 0,
            is_active: true
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = {
                ...formData,
                priority: parseInt(formData.priority)
            };

            if (editingRule) {
                const ruleId = editingRule.id || editingRule._id;
                await axios.put(`${API_BASE_URL}/recommendation_rules/${ruleId}`, payload, config);
                toast({ title: 'Rule updated successfully' });
            } else {
                await axios.post(`${API_BASE_URL}/recommendation_rules/`, payload, config);
                toast({ title: 'Rule created successfully' });
            }

            fetchDropdownData();
            handleCloseModal();
        } catch (error) {
            toast({
                title: 'Error saving rule',
                description: error.response?.data?.detail || error.message,
                variant: 'destructive'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const deleteRule = async (id) => {
        if (!window.confirm("Delete this recommendation rule permanently?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/recommendation_rules/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: 'Rule deleted' });
            fetchDropdownData();
        } catch (error) {
            toast({ title: 'Failed to delete rule', variant: 'destructive' });
        }
    };

    const toggleRuleActive = async (rule) => {
        try {
            const token = localStorage.getItem('token');
            const ruleId = rule.id || rule._id;
            const updatedPayload = { ...rule, is_active: !rule.is_active };
            delete updatedPayload.id;
            delete updatedPayload._id;
            delete updatedPayload.created_at;
            delete updatedPayload.updated_at;

            await axios.put(`${API_BASE_URL}/recommendation_rules/${ruleId}`, updatedPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: `Rule ${!rule.is_active ? 'enabled' : 'disabled'}` });
            fetchDropdownData();
        } catch (error) {
            toast({ title: 'Failed to toggle rule', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Recommendation Rules</h1>
                    <p className="text-gray-500 mt-1">Configure logic for personalized furniture suggestions.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Rule
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b text-sm text-gray-500 uppercase">
                                <th className="p-4 font-semibold text-center w-20">Priority</th>
                                <th className="p-4 font-semibold">Rule Context (Size, Budget, Style)</th>
                                <th className="p-4 font-semibold">Recommended Category</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan="5" className="p-12 text-center text-gray-500 animate-pulse">Loading strategy rules...</td></tr>
                            ) : rules.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-500">
                                        <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                        <p>No recommendation rules defined yet.</p>
                                    </td>
                                </tr>
                            ) : (
                                rules.map(rule => (
                                    <tr key={rule.id || rule._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-center">
                                            <span className="font-bold text-gray-700">{rule.priority}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold capitalize">
                                                    {rule.room_size_range}
                                                </span>
                                                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold capitalize">
                                                    {rule.budget_range}
                                                </span>
                                                <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-semibold capitalize">
                                                    {rule.style}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2 font-medium">{rule.name}</p>
                                        </td>
                                        <td className="p-4 font-medium text-gray-900">{rule.recommended_category}</td>
                                        <td className="p-4 text-gray-600">
                                            <button
                                                onClick={() => toggleRuleActive(rule)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${rule.is_active ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                                                    }`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${rule.is_active ? 'bg-orange-600 animate-pulse' : 'bg-gray-400'}`}></div>
                                                {rule.is_active ? 'Active' : 'Paused'}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right space-x-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(rule)} className="text-blue-600 hover:bg-blue-50">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id || rule._id)} className="text-red-600 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">{editingRule ? 'Edit Rule' : 'Add Strategic Rule'}</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2 text-sm text-gray-500 italic pb-2">
                                    Rules determine which furniture categories are prioritized in the "AI Recommendations" page based on customer room profiles.
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label>Rule Name / Internal Label</Label>
                                    <Input
                                        name="name"
                                        placeholder="e.g. Premium Living Room Strategy"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Target Room Size</Label>
                                    <select
                                        name="room_size_range"
                                        value={formData.room_size_range}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                                    >
                                        <option value="small">Small (&lt; 150 sq ft)</option>
                                        <option value="medium">Medium (150-300 sq ft)</option>
                                        <option value="large">Large (&gt; 300 sq ft)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Budget Range</Label>
                                    <select
                                        name="budget_range"
                                        value={formData.budget_range}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                                    >
                                        <option value="budget">Budget (&lt; ₹50k)</option>
                                        <option value="standard">Standard (₹50k-1.5L)</option>
                                        <option value="premium">Premium (&gt; ₹1.5L)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Display Style</Label>
                                    <select
                                        name="style"
                                        value={formData.style}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                                    >
                                        <option value="modern">Modern</option>
                                        <option value="classic">Classic</option>
                                        <option value="minimalist">Minimalist</option>
                                        <option value="luxury">Luxury</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Boost Category</Label>
                                    <select
                                        name="recommended_category"
                                        required
                                        value={formData.recommended_category}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                                    >
                                        <option value="">Select Category</option>
                                        {realCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Priority Score (higher=stronger)</Label>
                                    <Input
                                        name="priority"
                                        type="number"
                                        required
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="flex items-center space-x-2 pt-8">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                    />
                                    <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">Active Strategy</Label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t mt-6">
                                <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>Cancel</Button>
                                <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700" disabled={submitting}>
                                    {submitting ? 'Processing...' : <span className="flex items-center gap-2"><Save className="w-4 h-4" /> {editingRule ? 'Update Strategy' : 'Save Strategy'}</span>}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecommendationRules;
