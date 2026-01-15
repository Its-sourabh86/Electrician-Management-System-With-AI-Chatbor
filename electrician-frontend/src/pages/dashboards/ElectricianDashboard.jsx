import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../../components/Input';
import { useNotification } from '../../context/NotificationContext';

// Assets
import toolsIcon from '../../assets/tools-icon.png';
import fuseBoxIcon from '../../assets/fuse-box.png';
import proAvatar from '../../assets/pro-avatar.png';

export default function ElectricianDashboard() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error("Error parsing user from localStorage:", e);
            return {};
        }
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: user.name || '',
        mobileNumber: user.mobileNumber || '',
        experience: user.experience || '',
        degree: user.degree || '',
        location: user.location || ''
    });

    const [activeTab, setActiveTab] = useState('requests'); // requests, active, completed
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || Object.keys(user).length === 0) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const updatePayload = {
                name: editFormData.name,
                mobileNumber: editFormData.mobileNumber,
                experience: editFormData.experience,
                degree: editFormData.degree,
                location: editFormData.location,
                email: user.email
            };

            const formData = new FormData();
            formData.append('electrician', new Blob([JSON.stringify(updatePayload)], { type: 'application/json' }));

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const response = await api.put(`/electrician/${user.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const apiUpdatedUser = response.data.data;
            if (apiUpdatedUser) {
                const finalUser = { ...user, ...apiUpdatedUser, authHeader: user.authHeader };
                setUser(finalUser);
                localStorage.setItem('user', JSON.stringify(finalUser));
                setIsEditModalOpen(false);
                setImageFile(null);
                showNotification("Profile updated!", "success");
            }
        } catch (error) {
            console.error("Update failed:", error);
            showNotification(error.response?.data?.message || "Update failed", "error");
        } finally {
            setUpdateLoading(false);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/bookings/electrician/all');
            const data = response.data.data || response.data;
            setBookings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptBooking = async (bookingId) => {
        try {
            const response = await api.put(`/bookings/electrician/${bookingId}/accept`);
            showNotification(response.data.message || "Booking accepted!", "success");
            fetchBookings();
        } catch (error) {
            showNotification("Failed to accept booking", "error");
        }
    };

    const handleRejectBooking = async (bookingId) => {
        if (!window.confirm("Reject this booking?")) return;
        try {
            const response = await api.put(`/bookings/electrician/${bookingId}/reject`);
            showNotification(response.data.message || "Booking rejected", "success");
            fetchBookings();
        } catch (error) {
            showNotification("Failed to reject booking", "error");
        }
    };

    const handleCompleteBooking = async (bookingId) => {
        if (!window.confirm("Mark job as completed?")) return;
        try {
            const response = await api.put(`/bookings/electrician/${bookingId}/complete`);
            showNotification(response.data.message || "Job completed!", "success");
            fetchBookings();
        } catch (error) {
            showNotification("Failed to complete booking", "error");
        }
    };

    useEffect(() => {
        if (user && user.id) {
            fetchBookings();
        }
    }, [user]);

    const pendingBookings = bookings.filter(b => b.status === 'PENDING');
    const activeBookings = bookings.filter(b => b.status === 'ACCEPTED');
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-white overflow-hidden">

            {/* Sidebar / Profile Section */}
            <aside className="w-full md:w-80 lg:w-96 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 flex-shrink-0 relative overflow-y-auto md:h-screen scrollbar-hide">
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-600/20 to-transparent"></div>

                <div className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <span className="text-xl">⚡</span>
                            </div>
                            <h1 className="font-bold text-lg tracking-wider">PRO DASHBOARD</h1>
                        </div>
                        <button onClick={handleLogout} className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest">
                            Logout
                        </button>
                    </div>

                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="relative w-32 h-32 mb-4 group">
                            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <img
                                src={user.imageProfile || proAvatar}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover border-4 border-slate-800 relative z-10 shadow-2xl"
                            />
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-800 z-20 flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-1">{user.name || 'Electrician'}</h2>
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-500/20">
                            Verified Professional
                        </span>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-4">
                            <img src={toolsIcon} alt="Experience" className="w-10 h-10 opacity-80" />
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Experience</p>
                                <p className="font-semibold">{user.experience || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-4">
                            <img src={fuseBoxIcon} alt="Degree" className="w-10 h-10 opacity-80" />
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Education</p>
                                <p className="font-semibold">{user.degree || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                            <div className="flex items-start gap-4 mb-2">
                                <span className="text-2xl">📍</span>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Location</p>
                                    <p className="font-semibold">{user.location || 'Not set'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <span className="text-2xl">📱</span>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Contact</p>
                                    <p className="font-semibold text-sm">{user.mobileNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setEditFormData({
                                name: user.name,
                                mobileNumber: user.mobileNumber,
                                experience: user.experience,
                                degree: user.degree,
                                location: user.location
                            });
                            setIsEditModalOpen(true);
                        }}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                    >
                        Edit Profile
                    </button>

                    <button
                        onClick={() => navigate('/chat')}
                        className="w-full mt-3 py-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold border border-slate-600 transition-all active:scale-[0.98]"
                    >
                        Messages
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto bg-slate-900 relative">
                {/* Top Stats Bar */}
                <div className="p-6 md:p-10 pb-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Pending Requests</p>
                            <h3 className="text-4xl font-bold text-white">{pendingBookings.length}</h3>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Active Jobs</p>
                            <h3 className="text-4xl font-bold text-white">{activeBookings.length}</h3>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Completed Jobs</p>
                            <h3 className="text-4xl font-bold text-white">{completedBookings.length}</h3>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-slate-800 overflow-x-auto scrollbar-hide">
                        {['requests', 'active', 'completed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-4 font-bold capitalize transition-all border-b-2 whitespace-nowrap ${activeTab === tab
                                        ? 'text-white border-blue-500'
                                        : 'text-slate-500 border-transparent hover:text-slate-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Booking List */}
                <div className="p-6 md:p-10 space-y-4 pb-20">
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <AnimatePresence mode='wait'>
                            {bookings.filter(b => b.status === (activeTab === 'requests' ? 'PENDING' : activeTab === 'active' ? 'ACCEPTED' : 'COMPLETED')).length > 0 ? (
                                bookings
                                    .filter(b => b.status === (activeTab === 'requests' ? 'PENDING' : activeTab === 'active' ? 'ACCEPTED' : 'COMPLETED'))
                                    .map((booking) => (
                                        <motion.div
                                            key={booking.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/5 group"
                                        >
                                            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-bold text-xl text-white">{booking.serviceType}</h4>
                                                        {booking.estimatedCost && (
                                                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-lg border border-green-500/20">
                                                                ₹{booking.estimatedCost}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-400 text-sm">Client: <span className="text-white font-medium">{booking.userName}</span></p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {activeTab === 'requests' && (
                                                        <>
                                                            <button onClick={() => handleAcceptBooking(booking.id)} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-500/20">
                                                                Accept
                                                            </button>
                                                            <button onClick={() => handleRejectBooking(booking.id)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-bold text-sm transition-all">
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {activeTab === 'active' && (
                                                        <button onClick={() => handleCompleteBooking(booking.id)} className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-green-500/20">
                                                            Mark Complete
                                                        </button>
                                                    )}
                                                    <button onClick={() => navigate(`/chat/${booking.userId}`)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-all">
                                                        Chat
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Issue Description</p>
                                                    <p className="text-sm text-slate-300 leading-relaxed">{booking.description}</p>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-slate-500">📍</span>
                                                        <p className="text-sm text-slate-300">{booking.location}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-slate-500">🕒</span>
                                                        <p className="text-sm text-slate-300">{new Date(booking.scheduledDate).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                            ) : (
                                <div className="text-center py-20 opacity-50">
                                    <div className="text-6xl mb-4">📭</div>
                                    <p className="text-xl font-medium">No bookings found</p>
                                </div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </main>

            {/* Edit Modal Integrated */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800 w-full max-w-lg rounded-3xl border border-slate-700 overflow-hidden shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">Edit Profile</h2>
                                    <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white text-2xl">×</button>
                                </div>
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <Input label="Name" name="name" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} required />
                                    <Input label="Mobile" name="mobileNumber" value={editFormData.mobileNumber} onChange={(e) => setEditFormData({ ...editFormData, mobileNumber: e.target.value })} required maxLength={10} />
                                    <Input label="Location" name="location" value={editFormData.location} onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })} required />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Experience" name="experience" value={editFormData.experience} onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })} required />
                                        <Input label="Degree" name="degree" value={editFormData.degree} onChange={(e) => setEditFormData({ ...editFormData, degree: e.target.value })} required />
                                    </div>
                                    <Input label="New Profile Photo" type="file" onChange={(e) => setImageFile(e.target.files[0])} accept="image/*" />

                                    <button type="submit" disabled={updateLoading} className="w-full py-4 mt-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all">
                                        {updateLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
