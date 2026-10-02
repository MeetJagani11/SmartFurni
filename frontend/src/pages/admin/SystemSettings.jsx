import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../apiConfig';
import {
    Settings, Save, RefreshCw, Layers, DollarSign, Maximize, Bell, CheckCircle, Database, Download, History, AlertTriangle, LogOut, ChevronDown, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SystemSettings = () => {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [backups, setBackups] = useState([]);
    const [fetchingBackups, setFetchingBackups] = useState(false);
    const [activeTab, setActiveTab] = useState('settings'); // 'settings' or 'backup'
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [collapsedGroups, setCollapsedGroups] = useState({
        "Recommendation Engine Weights": true,
        "System Defaults (Budget & Room)": true,
        "Notifications & Feature Flags": true
    });

    const toggleGroup = (title) => {
        setCollapsedGroups(prev => ({ ...prev, [title]: !prev[title] }));
    };

    useEffect(() => {
        fetchConfigs();
        fetchBackups();
    }, []);

    const fetchConfigs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/system-configs/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setConfigs(response.data);
        } catch (err) {
            console.error("Error fetching configs", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBackups = async () => {
        setFetchingBackups(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/admin/backup/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBackups(res.data);
        } catch (err) {
            console.error("Error fetching backups", err);
        } finally {
            setFetchingBackups(false);
        }
    };

    const triggerBackup = async () => {
        setMessage({ type: 'info', text: 'Creating backup... please wait.' });
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/admin/backup/trigger`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Backup created successfully!' });
            fetchBackups();
        } catch (err) {
            setMessage({ type: 'error', text: 'Backup failed.' });
        }
    };

    const restoreBackup = async (name) => {
        if (!window.confirm(`Are you sure you want to restore ${name}? This will overwrite current data!`)) return;

        setMessage({ type: 'info', text: 'Restoring database... please wait.' });
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/admin/backup/${name}/restore`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Database restored successfully!' });
            window.location.reload(); // Refresh to show restored data
        } catch (err) {
            setMessage({ type: 'error', text: 'Restore failed.' });
        }
    };

    const handleUpdateChange = (key, value) => {
        setConfigs(prev => prev.map(c => c.key === key ? { ...c, value } : c));
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            // Update each config sequentially or we could add a bulk update endpoint
            // For now, let's do them in parallel
            await Promise.all(configs.map(config =>
                axios.post(`${API_BASE_URL}/system-configs/`, {
                    key: config.key,
                    value: config.value,
                    description: config.description
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ));
            setMessage({ type: 'success', text: 'All settings saved successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error("Error saving settings", err);
            setMessage({ type: 'error', text: 'Failed to save some settings.' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out from Admin Panel?")) {
            logout();
            navigate('/admin/login');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Settings...</div>;


    const renderGroup = (title, items, Icon) => {
        const isCollapsed = collapsedGroups[title];

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div 
                    className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleGroup(title)}
                >
                    <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3 text-orange-500" />
                        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                    </div>
                    {isCollapsed ? <ChevronRight className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
                {!isCollapsed && (
                    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                        {items.map(config => (
                            <div key={config.key} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        {config.key.replace(/_/g, ' ').toUpperCase()}
                                    </label>
                                    <p className="text-xs text-gray-500">{config.description || 'No description provided'}</p>
                                </div>
                                <div className="w-full md:w-64">
                                    {typeof config.value === 'boolean' ? (
                                        <button
                                            onClick={() => handleUpdateChange(config.key, !config.value)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${config.value ? 'bg-orange-500' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${config.value ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    ) : (
                                        <input
                                            type={typeof config.value === 'number' ? 'number' : 'text'}
                                            value={config.value}
                                            onChange={(e) => handleUpdateChange(config.key, typeof config.value === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const recSettings = configs.filter(c => c.key.startsWith('rec_'));
    const defaultSettings = configs.filter(c => c.key.startsWith('default_'));
    const notificationSettings = configs.filter(c => c.key.includes('notification') || c.key.startsWith('enable_'));

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">System Control</h1>
                    <div className="flex gap-4 mt-2">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`pb-2 px-1 text-sm font-bold transition-all ${activeTab === 'settings' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            General Settings
                        </button>
                        <button
                            onClick={() => setActiveTab('backup')}
                            className={`pb-2 px-1 text-sm font-bold transition-all ${activeTab === 'backup' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Backup Management
                        </button>
                    </div>
                </div>
                <div className="flex gap-3">
                    {activeTab === 'settings' ? (
                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className="flex items-center px-6 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {saving ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    ) : (
                        <button
                            onClick={triggerBackup}
                            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                        >
                            <Database className="w-5 h-5 mr-2" />
                            Create Backup Now
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all border border-gray-200"
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Log Out
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : message.type === 'info' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : message.type === 'info' ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
                    {message.text}
                </div>
            )}

            {activeTab === 'settings' ? (
                <>
                    {renderGroup("Recommendation Engine Weights", recSettings, Layers)}
                    {renderGroup("System Defaults (Budget & Room)", defaultSettings, DollarSign)}
                    {renderGroup("Notifications & Feature Flags", notificationSettings, Bell)}

                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 flex items-start">
                        <Maximize className="w-6 h-6 text-orange-500 mr-4 mt-1" />
                        <div>
                            <h4 className="font-bold text-orange-800">Pro Tip</h4>
                            <p className="text-sm text-orange-700 mt-1">
                                Recommendation weights should sum up to approximately 1.0 (100%) for balanced results.
                                Changing these values will take effect immediately for all users.
                            </p>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center">
                            <History className="w-5 h-5 mr-3 text-blue-500" />
                            <h2 className="text-lg font-bold text-gray-800">Backup History</h2>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Retention: Last 7 backups only</span>
                    </div>
                    <div className="p-0">
                        {fetchingBackups ? (
                            <div className="p-12 text-center text-gray-400">Loading backup history...</div>
                        ) : backups.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No backups found. Trigger one manually to start.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-400 border-b">
                                            <th className="px-6 py-3 font-bold">Backup Name</th>
                                            <th className="px-6 py-3 font-bold">Created At</th>
                                            <th className="px-6 py-3 font-bold">Size</th>
                                            <th className="px-6 py-3 font-bold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {backups.map(backup => (
                                            <tr key={backup.name} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-800 text-sm">{backup.name}</td>
                                                <td className="px-6 py-4 text-gray-500 text-xs">{new Date(backup.created_at).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-gray-500 text-xs">{(backup.size / 1024 / 1024).toFixed(2)} MB</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => restoreBackup(backup.name)}
                                                        className="flex items-center gap-1 ml-auto px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-all"
                                                    >
                                                        <RefreshCw size={12} />
                                                        Restore
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemSettings;
