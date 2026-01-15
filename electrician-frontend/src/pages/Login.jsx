import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Input from '../components/Input';
import api from '../api/axios';
import authBg from '../assets/auth-bg.png';
import { useNotification } from '../context/NotificationContext';

export default function Login() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (!formData.password) newErrors.password = "Password is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const response = await api.post('/auth/login', formData);
            const responseData = response.data.data || response.data;

            if (typeof responseData === 'string' || !responseData.role) {
                showNotification("Login successful, but role data is missing.", "error");
                return;
            }

            const role = responseData.role;

            // For Basic Auth: Store base64 encoded credentials
            const authHeader = btoa(`${formData.email}:${formData.password}`);
            const userData = { ...responseData, authHeader };

            localStorage.setItem('user', JSON.stringify(userData));
            showNotification("Welcome back! Login successful.", "success");

            if (role === 'ADMIN' || role === 'ROLE_ADMIN') navigate('/admin');
            else if (role === 'ELECTRICIAN' || role === 'ROLE_ELECTRICIAN') navigate('/electrician');
            else if (role === 'USER' || role === 'ROLE_USER') navigate('/user');
            else {
                console.warn("Unknown role:", role);
                navigate('/user');
            }
        } catch (error) {
            console.error("Login Failed:", error);
            const errorMsg = error.response?.data?.message || "Invalid email or password. Please try again.";
            showNotification(errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row h-screen">
            {/* Image Section */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden md:flex md:w-1/2 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-slate-900/40 z-10" />
                <img
                    src={authBg}
                    alt="Electrician Workspace"
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-10 left-10 z-20 max-w-md">
                    <h1 className="text-4xl font-bold text-white mb-4">Powering Your World</h1>
                    <p className="text-slate-200 text-lg">Connect with expert electricians or manage your services with ease.</p>
                </div>
            </motion.div>

            {/* Form Section */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/2 flex items-center justify-center p-8 bg-slate-900 relative"
            >
                {/* Decorative Elements */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="w-full max-w-md p-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text mb-2">Welcome Back</h2>
                    <p className="text-slate-400 mb-8">Please enter your details to sign in.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="you@example.com"
                        />
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="••••••••"
                        />

                        <div className="flex justify-end">
                            <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/25 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Processing...</span>
                                </div>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-slate-400 text-sm">
                        Don't have an account?{' '}
                        <button onClick={() => navigate('/')} className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                            Create Account
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
