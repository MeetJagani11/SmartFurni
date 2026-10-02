import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { useToast } from '../hooks/use-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log(`Sending forgot password request for: ${email}`);
            const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
            console.log("Forgot password response:", response.data);

            toast({
                title: "Reset link sent",
                description: `A password reset link has been sent to ${email}. Please check your inbox or terminal.`
            });
            navigate('/login');
        } catch (err) {
            console.error("Forgot password error details:", err);

            if (err.code === 'ERR_NETWORK') {
                setError("Network error: Cannot reach the backend server. Please make sure the backend is running.");
            } else {
                const msg = err.response?.data?.detail || err.response?.data?.message || "Failed to send reset email. Please try again.";
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 shadow rounded-lg">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center text-sm text-gray-500 hover:text-orange-600 transition-colors mb-6"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Login
                </button>

                <div>
                    <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Forgot password?
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        No worries, we'll send you reset instructions.
                    </p>
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-100 italic">
                            {error}
                        </div>
                    )}
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="email-address">Email address</Label>
                        <Input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="mt-1"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Reset password'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
