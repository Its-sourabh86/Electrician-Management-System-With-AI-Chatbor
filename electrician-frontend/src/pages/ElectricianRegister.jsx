import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Input from '../components/Input';
import api from '../api/axios';
import authBg from '../assets/auth-bg.png';
import { useNotification } from '../context/NotificationContext';

export default function ElectricianRegister() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobileNumber: '',
        experience: '',
        degree: '',
        location: '',
        imageProfile: '', // Restoring this for backend compatibility
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        else if (formData.name.length < 3) newErrors.name = "Min 3 chars";

        if (!formData.location || !formData.location.trim()) newErrors.location = "Location is required";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email";

        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6) newErrors.password = "Min 6 chars";

        const mobileRegex = /^[6-9]\d{9}$/;
        if (!formData.mobileNumber) newErrors.mobileNumber = "Mobile is required";
        else if (!mobileRegex.test(formData.mobileNumber)) newErrors.mobileNumber = "Invalid mobile";

        if (!formData.experience.trim()) newErrors.experience = "Experience is required";
        if (!formData.degree.trim()) newErrors.degree = "Degree is required";

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

            // Create user details blob (standardizing on 'user' as the part name)
            const electricianBlob = new Blob([JSON.stringify(formData)], {
                type: 'application/json'
            });
            formDataToSend.append('user', electricianBlob, 'user.json');

            // Append image if selected
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            const response = await api.post('/auth/register/electrician', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Registration Successful:", response.data);
            showNotification("Professional Registration Successful! Please login.", "success");
            navigate('/login');
        } catch (error) {
            console.error("Registration Failed Full Error:", error);
            const msg = error.response?.data?.message || error.message || "Registration failed.";
            showNotification(msg, "error");
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
                className="hidden md:flex md:w-1/3 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 to-slate-900/90 z-10" />
                <img
                    src={authBg}
                    alt="Professional Tools"
                    className="w-full h-full object-cover grayscale-[50%]"
                />
                <div className="absolute top-12 left-12 z-20 max-w-xs">
                    <h3 className="text-4xl font-bold text-white mb-4 leading-tight">Grow Your <br /> Business</h3>
                    <p className="text-slate-300">Join thousands of electricians finding new customers every day.</p>
                </div>
            </motion.div>

            {/* Form Section */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-2/3 flex items-center justify-center p-6 bg-slate-900 overflow-y-auto"
            >
                <div className="w-full max-w-2xl p-6">
                    <button onClick={() => navigate('/')} className="mb-6 text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                        ← Back to Home
                    </button>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 text-transparent bg-clip-text">Professional Registration</h2>
                        <p className="text-slate-400">Apply to become a verified service provider.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            placeholder="Sparky Steve"
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
                            placeholder="e.g. MP Nagar, Bhopal"
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="steve@example.com"
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
                            label="Years of Experience"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            error={errors.experience}
                            placeholder="e.g. 5 years"
                        />

                        <Input
                            label="Degree / Certification"
                            name="degree"
                            value={formData.degree}
                            onChange={handleChange}
                            error={errors.degree}
                            placeholder="ITI / Diploma"
                        />

                        <div className="md:col-span-2 space-y-4 text-center">
                            <Input
                                label="Profile Image (Optional)"
                                type="file"
                                name="image"
                                onChange={handleChange}
                                accept="image/*"
                            />
                            {imagePreview && (
                                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-emerald-500/50 mx-auto shadow-xl shadow-emerald-500/20">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 mt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting Application...' : 'Register as Professional'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <span className="text-slate-400">Already have an account? </span>
                        <button onClick={() => navigate('/login')} className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                            Login here
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
