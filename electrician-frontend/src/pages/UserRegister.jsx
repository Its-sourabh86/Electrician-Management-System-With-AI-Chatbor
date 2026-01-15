import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Input from '../components/Input';
import api from '../api/axios';
import authBg from '../assets/auth-bg.png';
import { useNotification } from '../context/NotificationContext';

export default function UserRegister() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobileNumber: '',
        location: '',
        imageProfile: '', // Restoring this for backend compatibility
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name cannot be blank";
        else if (formData.name.length < 2 || formData.name.length > 50) newErrors.name = "Name must be 2-50 chars";

        if (!formData.location || !formData.location.trim()) newErrors.location = "Location is required";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) newErrors.email = "Email cannot be blank";
        else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

        if (!formData.password) newErrors.password = "Password cannot be blank";
        else if (formData.password.length < 6) newErrors.password = "Min 6 characters";

        const mobileRegex = /^[6-9]\d{9}$/;
        if (!formData.mobileNumber) newErrors.mobileNumber = "Mobile cannot be blank";
        else if (!mobileRegex.test(formData.mobileNumber)) newErrors.mobileNumber = "Must be 10 digits (start 6-9)";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            setImageFile(file);
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setImagePreview(null);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const formDataToSend = new FormData();

            // Create user details blob
            const userBlob = new Blob([JSON.stringify(formData)], {
                type: 'application/json'
            });
            formDataToSend.append('user', userBlob, 'user.json');

            // Append image if selected
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            const response = await api.post('/auth/register/user', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Registration Successful:", response.data);
            showNotification("Registration Successful! Welcome on board.", "success");
            navigate('/login');
        } catch (error) {
            console.error("Registration Failed:", error);
            const msg = error.response?.data?.message || error.message || "Registration failed.";
            showNotification(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row h-screen">
            {/* Form Section (Left side on desktop for variation) */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/2 flex items-center justify-center p-6 bg-slate-900 relative overflow-y-auto"
            >
                <div className="w-full max-w-lg p-6 my-auto">
                    <button onClick={() => navigate('/')} className="mb-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                        ← Back to Home
                    </button>

                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-2">Join as User</h2>
                    <p className="text-slate-400 mb-8">Create an account to hire the best electricians around.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            placeholder="John Doe"
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="john@example.com"
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

                        <Input
                            label="Mobile Number"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            error={errors.mobileNumber}
                            placeholder="9876543210"
                            maxLength={10}
                        />

                        <Input
                            label="Location (City/Area)"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            error={errors.location}
                            placeholder="e.g. Indrapuri, Bhopal"
                        />

                        <div className="space-y-4">
                            <Input
                                label="Profile Image (Optional)"
                                type="file"
                                name="image"
                                onChange={handleChange}
                                accept="image/*"
                            />
                            {imagePreview && (
                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/50 mx-auto">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Register Now'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-slate-400 text-sm">
                        Already have an account?{' '}
                        <button onClick={() => navigate('/login')} className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
                            Login here
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Image Section */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden md:flex md:w-1/2 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-l from-slate-900/10 to-slate-900/90 z-10" />
                <img
                    src={authBg}
                    alt="Smart Home"
                    className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute bottom-12 right-12 z-20 text-right max-w-lg">
                    <h3 className="text-3xl font-bold text-white mb-2">Find Reliable Help</h3>
                    <p className="text-slate-200">Our platform guarantees verified professionals for all your electrical needs.</p>
                </div>
            </motion.div>
        </div>
    );
}
