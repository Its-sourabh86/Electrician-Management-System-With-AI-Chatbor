import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../../components/Input';
import { useNotification } from '../../context/NotificationContext';

export default function UserDashboard() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [electricians, setElectricians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
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
        location: user.location || ''
    });

    const [viewingElectrician, setViewingElectrician] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedElectrician, setSelectedElectrician] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [bookingFormData, setBookingFormData] = useState({
        serviceType: '',
        description: '',
        location: '',
        scheduledDate: '',
        estimatedCost: ''
    });
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        if (!user || Object.keys(user).length === 0) {
            console.warn("No user data found in dashboard, redirecting to login...");
            navigate('/login');
            return;
        }
        fetchElectricians();
    }, [user, navigate]);

    const fetchElectricians = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const response = await api.get('/user/electricians');
            let data = response.data.data || response.data;
            let processedElectricians = Array.isArray(data) ? data : [];

            // Fix: Swap mobileNumber and password if they are interchanged in the backend response
            processedElectricians = processedElectricians.map(elec => {
                const isPhoneInPassword = elec.password && /^[6-9]\d{9}$/.test(elec.password);
                const isHashInMobile = elec.mobileNumber && elec.mobileNumber.startsWith('$2a$');

                if (isPhoneInPassword && isHashInMobile) {
                    return {
                        ...elec,
                        mobileNumber: elec.password,
                        password: elec.mobileNumber
                    };
                }
                return elec;
            });

            setElectricians(processedElectricians);
        } catch (error) {
            console.error("Failed to fetch electricians:", error);
            const status = error.response?.status;
            if (status === 403) {
                setFetchError("Access Denied (403): You are logged in as a USER, but trying to call an ADMIN API. Move the API to a user path!");
            } else {
                setFetchError(`Error (${status || 'Network'}): Failed to load electricians.`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!user.id) {
            showNotification("Error: User ID is missing. Please log out and log in again.", "error");
            return;
        }
        setUpdateLoading(true);
        try {
            const updatePayload = {
                name: editFormData.name,
                mobileNumber: editFormData.mobileNumber,
                location: editFormData.location,
                email: user.email
            };

            const formData = new FormData();
            formData.append('user', new Blob([JSON.stringify(updatePayload)], { type: 'application/json' }));

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const response = await api.put(`/user/${user.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const apiUpdatedUser = response.data.data;
            if (apiUpdatedUser) {
                const finalUser = {
                    ...user,
                    ...apiUpdatedUser,
                    authHeader: user.authHeader
                };
                setUser(finalUser);
                localStorage.setItem('user', JSON.stringify(finalUser));
                setIsEditModalOpen(false);
                setImageFile(null);
                showNotification("Profile updated successfully!", "success");
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
            const msg = error.response?.data?.message || "Failed to update profile.";
            showNotification(msg, "error");
        } finally {
            setUpdateLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings/user/my-bookings');
            const data = response.data.data || response.data;
            setBookings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        }
    };

    const handleOpenBookingModal = (electrician) => {
        setSelectedElectrician(electrician);
        setBookingFormData({
            serviceType: '',
            description: '',
            location: '',
            scheduledDate: '',
            estimatedCost: ''
        });
        setIsBookingModalOpen(true);
        setViewingElectrician(null); // Close view modal if open
    };

    const handleCreateBooking = async (e) => {
        e.preventDefault();
        if (!selectedElectrician) return;

        setBookingLoading(true);
        try {
            const bookingPayload = {
                electricianId: selectedElectrician.id,
                serviceType: bookingFormData.serviceType,
                description: bookingFormData.description,
                location: bookingFormData.location,
                scheduledDate: new Date(bookingFormData.scheduledDate).toISOString(),
                estimatedCost: bookingFormData.estimatedCost ? parseFloat(bookingFormData.estimatedCost) : null
            };

            const response = await api.post('/bookings/user/create', bookingPayload);
            showNotification(response.data.message || "Booking created successfully!", "success");
            setIsBookingModalOpen(false);
            fetchBookings(); // Refresh bookings list
        } catch (error) {
            console.error("Failed to create booking:", error);
            const msg = error.response?.data?.message || "Failed to create booking.";
            showNotification(msg, "error");
        } finally {
            setBookingLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        try {
            const response = await api.put(`/bookings/user/${bookingId}/cancel`);
            showNotification(response.data.message || "Booking cancelled successfully!", "success");
            fetchBookings(); // Refresh bookings list
        } catch (error) {
            console.error("Failed to cancel booking:", error);
            const msg = error.response?.data?.message || "Failed to cancel booking.";
            showNotification(msg, "error");
        }
    };

    useEffect(() => {
        if (user && user.id) {
            fetchBookings();
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                        User Dashboard
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300"
                    >
                        Log Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Profile Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 sticky top-24">
                            <h2 className="text-xl font-semibold mb-6">Your Profile</h2>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-cyan-500/30">
                                    <img
                                        src={user.imageProfile || 'https://ui-avatars.com/api/?name=' + (user.name || 'User') + '&background=0ea5e9&color=fff'}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="text-xl font-bold">{user.name || 'Anonymous'}</h3>
                                <p className="text-slate-400 text-sm mb-6 uppercase tracking-widest font-bold text-xs">{user.role || 'User'}</p>

                                <div className="w-full space-y-4 text-left">
                                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email</p>
                                        <p className="text-slate-200 text-sm truncate">{user.email}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Mobile</p>
                                        <p className="text-slate-200">{user.mobileNumber || 'Not provided'}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Location</p>
                                        <p className="text-slate-200">{user.location || 'Not provided'}</p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setEditFormData({ name: user.name, mobileNumber: user.mobileNumber, location: user.location });
                                            setIsEditModalOpen(true);
                                        }}
                                        className="w-full mt-4 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-white transition-all font-bold text-sm"
                                    >
                                        Edit Profile ✎
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl -mr-32 -mt-32"></div>
                            <h2 className="text-2xl font-bold mb-2">Welcome Back, {user.name ? user.name.split(' ')[0] : 'User'}!</h2>
                            <p className="text-slate-400 mb-6">Discover top-rated electricians and manage your bookings.</p>

                            {fetchError && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
                                    <span className="text-xl">⚠️</span>
                                    <p className="text-sm font-medium">{fetchError}</p>
                                </div>
                            )}

                            <div className="mt-8">
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-cyan-400">
                                    <span className="text-xl">⚡</span> Available Electricians
                                </h3>

                                {loading ? (
                                    <div className="flex justify-center p-12">
                                        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {electricians.length > 0 ? (
                                            electricians.map((elec) => (
                                                <motion.div
                                                    key={elec.id}
                                                    whileHover={{ y: -5 }}
                                                    className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 flex gap-4 hover:border-cyan-500/50 transition-all group"
                                                >
                                                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-700 group-hover:border-cyan-500/30 transition-colors shrink-0">
                                                        <img
                                                            src={elec.imageProfile || `https://ui-avatars.com/api/?name=${elec.name}&background=random`}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{elec.name}</h4>
                                                        <p className="text-xs text-slate-500 font-medium mb-2">{elec.experience || 'Professional'} Experience</p>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20 uppercase">
                                                                {elec.degree || 'Certified'}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20 uppercase">
                                                                📍 {elec.location || 'Unknown'}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <button
                                                                onClick={() => setViewingElectrician(elec)}
                                                                className="py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 rounded-lg text-[10px] font-bold transition-all active:scale-95"
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/chat/${elec.id}`)}
                                                                className="py-2 bg-slate-800 hover:bg-slate-700 text-green-400 border border-green-500/30 rounded-lg text-[10px] font-bold transition-all active:scale-95"
                                                            >
                                                                Chat
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenBookingModal(elec)}
                                                                className="py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg text-[10px] font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                                                            >
                                                                Book
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 text-center py-12 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                                                <p className="text-slate-500">No electricians available at the moment.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* My Bookings Section */}
                        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <span className="text-2xl">📅</span> My Bookings
                            </h2>

                            {bookings.length > 0 ? (
                                <div className="space-y-4">
                                    {bookings.map((booking) => (
                                        <motion.div
                                            key={booking.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-white text-lg mb-1">{booking.serviceType}</h4>
                                                    <p className="text-sm text-slate-400">Electrician: {booking.electricianName}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${booking.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                    booking.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                        booking.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                            booking.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                                'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Location</p>
                                                    <p className="text-sm text-slate-300">📍 {booking.location}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Scheduled</p>
                                                    <p className="text-sm text-slate-300">🕒 {new Date(booking.scheduledDate).toLocaleString()}</p>
                                                </div>
                                            </div>

                                            {booking.description && (
                                                <div className="mb-4">
                                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Description</p>
                                                    <p className="text-sm text-slate-300">{booking.description}</p>
                                                </div>
                                            )}

                                            {booking.estimatedCost && (
                                                <div className="mb-4">
                                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Estimated Cost</p>
                                                    <p className="text-lg font-bold text-cyan-400">₹{booking.estimatedCost}</p>
                                                </div>
                                            )}

                                            {booking.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className="w-full py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all"
                                                >
                                                    Cancel Booking
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                                    <p className="text-slate-500 mb-4">No bookings yet</p>
                                    <p className="text-sm text-slate-600">Book an electrician to get started!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-slate-800 w-full max-w-md rounded-3xl border border-slate-700 overflow-hidden shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                                    <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white text-2xl">×</button>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <Input
                                        label="Full Name"
                                        name="name"
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        placeholder="Your Name"
                                        required
                                    />
                                    <Input
                                        label="Mobile Number"
                                        name="mobileNumber"
                                        value={editFormData.mobileNumber}
                                        onChange={(e) => setEditFormData({ ...editFormData, mobileNumber: e.target.value })}
                                        placeholder="10-digit mobile number"
                                        required
                                        maxLength={10}
                                    />
                                    <Input
                                        label="Location"
                                        name="location"
                                        value={editFormData.location}
                                        onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                                        placeholder="City / Area"
                                        required
                                    />
                                    <Input
                                        label="Profile Image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files[0])}
                                    />

                                    <div className="pt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={updateLoading}
                                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
                                        >
                                            {updateLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Booking Modal */}
            <AnimatePresence>
                {isBookingModalOpen && selectedElectrician && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsBookingModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-slate-800 w-full max-w-2xl rounded-3xl border border-slate-700 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Book Electrician</h2>
                                        <p className="text-slate-400 text-sm">Booking: {selectedElectrician.name}</p>
                                    </div>
                                    <button onClick={() => setIsBookingModalOpen(false)} className="text-slate-500 hover:text-white text-3xl">×</button>
                                </div>

                                <form onSubmit={handleCreateBooking} className="space-y-4">
                                    <Input
                                        label="Service Type"
                                        name="serviceType"
                                        value={bookingFormData.serviceType}
                                        onChange={(e) => setBookingFormData({ ...bookingFormData, serviceType: e.target.value })}
                                        placeholder="e.g., Wiring Repair, Installation, Short Circuit"
                                        required
                                    />

                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            value={bookingFormData.description}
                                            onChange={(e) => setBookingFormData({ ...bookingFormData, description: e.target.value })}
                                            placeholder="Describe the issue or work required..."
                                            rows={4}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                            required
                                        />
                                    </div>

                                    <Input
                                        label="Location"
                                        name="location"
                                        value={bookingFormData.location}
                                        onChange={(e) => setBookingFormData({ ...bookingFormData, location: e.target.value })}
                                        placeholder="Service address"
                                        required
                                    />

                                    <Input
                                        label="Scheduled Date & Time"
                                        type="datetime-local"
                                        name="scheduledDate"
                                        value={bookingFormData.scheduledDate}
                                        onChange={(e) => setBookingFormData({ ...bookingFormData, scheduledDate: e.target.value })}
                                        required
                                    />

                                    <Input
                                        label="Estimated Cost (Optional)"
                                        type="number"
                                        name="estimatedCost"
                                        value={bookingFormData.estimatedCost}
                                        onChange={(e) => setBookingFormData({ ...bookingFormData, estimatedCost: e.target.value })}
                                        placeholder="₹ 0"
                                    />

                                    <div className="pt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsBookingModalOpen(false)}
                                            className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={bookingLoading}
                                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
                                        >
                                            {bookingLoading ? 'Creating Booking...' : 'Confirm Booking'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Electrician Profile View Modal */}
            <AnimatePresence>
                {viewingElectrician && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingElectrician(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-slate-800 w-full max-w-2xl rounded-3xl border border-slate-700 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-0">
                                <div className="h-32 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                                <div className="px-8 pb-8">
                                    <div className="relative -mt-16 mb-6">
                                        <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-slate-800 shadow-xl">
                                            <img
                                                src={viewingElectrician.imageProfile || `https://ui-avatars.com/api/?name=${viewingElectrician.name}&background=random`}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-3xl font-bold text-white mb-1 uppercase tracking-tight">{viewingElectrician.name}</h2>
                                            <div className="flex items-center gap-3">
                                                <p className="text-cyan-400 font-bold flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                                                    Available for hire
                                                </p>
                                                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-black tracking-widest uppercase border border-green-500/20 rounded-full">
                                                    Verified Pro
                                                </span>
                                            </div>
                                        </div>
                                        <button onClick={() => setViewingElectrician(null)} className="text-slate-500 hover:text-white text-4xl leading-none">×</button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Experience</p>
                                            <p className="text-white font-medium flex items-center gap-2">🛠️ {viewingElectrician.experience || 'Professional'}</p>
                                        </div>
                                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Qualification</p>
                                            <p className="text-white font-medium flex items-center gap-2">📜 {viewingElectrician.degree || 'Certified'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Contact Information</h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="flex items-center gap-4 p-4 bg-slate-900/30 rounded-2xl border border-slate-700/50 group hover:border-cyan-500/30 transition-all">
                                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">📧</div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Email Address</p>
                                                    <p className="text-white font-medium">{viewingElectrician.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-slate-900/30 rounded-2xl border border-slate-700/50 group hover:border-cyan-500/30 transition-all">
                                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">📱</div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Phone Number</p>
                                                    <p className="text-white font-medium">{viewingElectrician.mobileNumber}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">About Professional</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed bg-slate-900/20 p-4 rounded-2xl border border-slate-700/30">
                                            Experienced electrician with a strong background in residential and commercial electrical systems. Specializing in diagnostics, wiring, and safety inspections. Known for providing reliable, high-quality service to ensure your home or business is powered safely and efficiently.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                navigate(`/chat/${viewingElectrician.id}`);
                                                setViewingElectrician(null); // Close the modal
                                            }}
                                            className="py-4 bg-slate-700 hover:bg-slate-600 text-green-400 border border-green-500/30 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            💬 Start Chat
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleOpenBookingModal(viewingElectrician);
                                            }}
                                            className="py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
                                        >
                                            📅 Book This Professional
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
