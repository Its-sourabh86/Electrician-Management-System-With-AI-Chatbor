import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import authBg from '../assets/auth-bg.png';

export default function Home() {
    const navigate = useNavigate();
    const [showRegisterOptions, setShowRegisterOptions] = useState(false);

    const features = [
        {
            title: "Verified Professionals",
            description: "All our electricians are vetted and certified professionals with years of experience.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            )
        },
        {
            title: "Quick Response",
            description: "Need emergency help? Find experts near you who can arrive in minutes.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            )
        },
        {
            title: "Transparent Pricing",
            description: "Get fair estimates upfront. No hidden charges or unexpected costs.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            )
        }
    ];

    const services = [
        { name: "Wiring & Rewiring", icon: "🔌" },
        { name: "Lighting Solutions", icon: "💡" },
        { name: "Panel Upgrades", icon: "⚡" },
        { name: "Emergency Repairs", icon: "🚨" },
        { name: "Smart Home Setup", icon: "🏠" },
        { name: "Maintenance", icon: "🛠️" }
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white selection:bg-cyan-500 selection:text-slate-900 overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center">
                <div className="absolute inset-0 z-0 opacity-40">
                    <img src={authBg} alt="Background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/60 to-slate-900" />
                </div>

                <div className="container mx-auto relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl"
                    >
                        <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tight">
                            Modern Solutions for <br />
                            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">
                                Electrical Needs
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium">
                            Join the future of professional electrical services. Connecting households with elite electricians instantly.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-lg mx-auto">
                            <AnimatePresence mode="wait">
                                {!showRegisterOptions ? (
                                    <motion.div
                                        key="hero-actions"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex flex-col sm:flex-row gap-4 w-full"
                                    >
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="flex-1 py-5 rounded-2xl bg-white text-slate-900 font-bold text-lg hover:bg-slate-200 transition-all shadow-xl shadow-white/10"
                                        >
                                            Get Started
                                        </button>
                                        <button
                                            onClick={() => setShowRegisterOptions(true)}
                                            className="flex-1 py-5 rounded-2xl border-2 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 text-white font-bold text-lg transition-all"
                                        >
                                            Create Account
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="hero-register"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="w-full grid grid-cols-2 gap-4"
                                    >
                                        <button
                                            onClick={() => navigate('/register/user')}
                                            className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500 transition-all text-center group"
                                        >
                                            <span className="block text-2xl mb-2">🧑‍💻</span>
                                            <span className="font-bold block">User</span>
                                        </button>
                                        <button
                                            onClick={() => navigate('/register/electrician')}
                                            className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-blue-500 transition-all text-center group"
                                        >
                                            <span className="block text-2xl mb-2">⚡</span>
                                            <span className="font-bold block">Electrician</span>
                                        </button>
                                        <button
                                            onClick={() => setShowRegisterOptions(false)}
                                            className="col-span-2 py-2 text-sm text-slate-500 hover:text-white transition-colors"
                                        >
                                            ← Go Back
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Feature Cards Section */}
            <section className="py-24 px-6 relative bg-slate-900">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Why Choose Electrician Pro?</h2>
                        <p className="text-slate-400">Our platform is designed to provide safety and efficiency.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/30 transition-all"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Grid Section */}
            <section className="py-24 bg-slate-950/50 px-6 border-y border-slate-800">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 text-center md:text-left">
                        <div className="max-w-2xl mx-auto md:mx-0">
                            <h2 className="text-4xl font-bold mb-4">Our Services</h2>
                            <p className="text-slate-400 uppercase tracking-widest text-sm font-bold">Expertise in all dimensions</p>
                        </div>
                        <button onClick={() => navigate('/login')} className="px-8 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors mx-auto md:mx-0">
                            View All Services
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {services.map((service, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ scale: 1.05 }}
                                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center group cursor-pointer hover:border-blue-500/50 transition-all"
                            >
                                <span className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">{service.icon}</span>
                                <span className="text-sm font-semibold text-slate-300 group-hover:text-white">{service.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Project info section */}
            <section className="py-32 px-6 bg-slate-900 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-3xl blur-2xl opacity-50" />
                        <img
                            src={authBg}
                            alt="Mission"
                            className="relative rounded-3xl border border-slate-700 shadow-2xl w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold mb-8">Empowering Homes & Businesses</h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center mt-1">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                </div>
                                <p className="text-slate-300 text-lg">Centralized platform for managing all electrical service requests seamlessly.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center mt-1">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                </div>
                                <p className="text-slate-300 text-lg">Robust profiles for electricians to showcase their expertise and certifications.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center mt-1">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                </div>
                                <p className="text-slate-300 text-lg">Real-time tracking and status updates for every job request.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="mt-12 px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:shadow-cyan-500/20 shadow-xl transition-all"
                        >
                            Join the Platform
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-slate-800 bg-slate-950/80">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight">Electrician Pro</span>
                    </div>
                    <p className="text-slate-500 text-sm">© 2026 Electrician Management System. Developed by Sourabh.</p>
                    <div className="flex gap-6 text-slate-400 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
