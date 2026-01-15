import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [electricians, setElectricians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [stats, setStats] = useState({ totalUsers: 0, totalElectricians: 0, totalJobs: 24 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setFetchError(null);

        try {
            // Fetch users
            let userData = [];
            try {
                const usersRes = await api.get('/admin/user');
                userData = usersRes.data.data || usersRes.data;
                console.log("Admin API Debug - Users Success:", userData);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                // If it's plural, try that
                try {
                    const usersRes = await api.get('/admin/users');
                    userData = usersRes.data.data || usersRes.data;
                    console.log("Admin API Debug - Users (plural) Success:", userData);
                } catch (err2) {
                    throw err; // Throw original error if both fail
                }
            }
            setUsers(Array.isArray(userData) ? userData : []);

            // Fetch electricians
            let electricianData = [];
            try {
                const electriciansRes = await api.get('/admin/electrician');
                electricianData = electriciansRes.data.data || electriciansRes.data;
                console.log("Admin API Debug - Electricians Success:", electricianData);
            } catch (err) {
                console.error("Failed to fetch electricians:", err);
                try {
                    const electriciansRes = await api.get('/admin/electricians');
                    electricianData = electriciansRes.data.data || electriciansRes.data;
                    console.log("Admin API Debug - Electricians (plural) Success:", electricianData);
                } catch (err2) {
                    throw err;
                }
            }
            let processedElectricians = Array.isArray(electricianData) ? electricianData : [];

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

            setStats({
                totalUsers: Array.isArray(userData) ? userData.length : 0,
                totalElectricians: processedElectricians.length,
                totalJobs: 24
            });
        } catch (error) {
            console.error("Final Admin API Error:", error);
            const status = error.response?.status;
            if (status === 401) setFetchError("Authentication failed (401). Please log out and in again.");
            else if (status === 403) setFetchError("Access denied (403). Admin role required.");
            else if (!error.response) setFetchError("Network Error: Backend unreachable or CORS issue. Please check your Spring Boot server.");
            else setFetchError(`Server Error (${status}): Could not fetch data.`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

        try {
            await api.delete(`/admin/${type}/${id}`);
            showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`, "success");
            fetchData();
            if (selectedProfile?.id === id) setSelectedProfile(null);
        } catch (error) {
            console.error("Delete failed:", error);
            showNotification("Failed to delete. Please try again.", "error");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const findPhone = (obj) => {
        // Look for 10-digit number in any field
        for (let key in obj) {
            const val = String(obj[key]);
            if (/^[6-9]\d{9}$/.test(val)) return val;
        }
        return null;
    };

    const StatusBadge = ({ verified }) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${verified ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
            {verified ? 'VERIFIED' : 'PENDING'}
        </span>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Header */}
            <header className="bg-slate-900/50 backdrop-blur-md border-b border-white/5 p-6 flex justify-between items-center sticky top-0 z-30">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-500 text-transparent bg-clip-text">
                        Admin Command Center
                    </h1>
                    <p className="text-slate-400 text-sm">System Administration & Management</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-5 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-sm font-semibold"
                >
                    Log Out
                </button>
            </header>

            <main className="p-6 md:p-8 flex-1 overflow-auto">
                {/* Navigation Tabs */}
                <div className="flex gap-4 mb-8 bg-slate-900/50 p-1.5 rounded-xl border border-white/5 w-fit">
                    {['overview', 'users', 'electricians', 'chat'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                if (tab === 'chat') {
                                    navigate('/chat');
                                } else {
                                    setActiveTab(tab);
                                }
                            }}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize ${activeTab === tab ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {fetchError && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
                        <span className="text-xl">⚠️</span>
                        <p className="font-medium">{fetchError}</p>
                        <button onClick={fetchData} className="ml-auto text-xs font-bold uppercase tracking-wider hover:underline">Retry</button>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="from-blue-500 to-cyan-500" />
                            <StatCard title="Electricians" value={stats.totalElectricians} icon="⚡" color="from-orange-500 to-red-500" />
                            <StatCard title="Total Jobs" value={stats.totalJobs} icon="🛠️" color="from-emerald-500 to-teal-500" />

                            <div className="md:col-span-3 bg-slate-900/50 rounded-3xl p-8 border border-white/5">
                                <h3 className="text-xl font-bold mb-4">Platform Growth</h3>
                                <div className="h-64 flex items-end justify-between gap-2">
                                    {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                                        <div key={i} className="flex-1 bg-gradient-to-t from-red-500 to-orange-400 rounded-t-lg transition-all hover:scale-105" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                                <div className="flex justify-between mt-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {(activeTab === 'users' || activeTab === 'electricians') && (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                            <th className="px-6 py-4">Profile</th>
                                            <th className="px-6 py-4">Contact</th>
                                            {activeTab === 'electricians' && <th className="px-6 py-4">Experience</th>}
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {(activeTab === 'users' ? users : electricians).map((item) => (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedProfile(item)}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                                                            <img src={item.imageProfile || `https://ui-avatars.com/api/?name=${item.name}&background=random`} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <span className="font-bold">{item.name || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm">{item.email}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {findPhone(item) || (item.mobileNumber?.startsWith('$2a$') ? 'Mobile missing in API' : item.mobileNumber || 'N/A')}
                                                    </p>
                                                </td>
                                                {activeTab === 'electricians' && <td className="px-6 py-4 text-sm font-medium text-red-400">{item.experience || 'New'}</td>}
                                                <td className="px-6 py-4">
                                                    <StatusBadge verified={activeTab === 'electricians' ? !!item.experience : true} />
                                                </td>
                                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleDelete(activeTab === 'users' ? 'user' : 'electrician', item.id)}
                                                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {loading && <div className="p-12 text-center text-slate-400">Loading data...</div>}
                                {!loading && (activeTab === 'users' ? users : electricians).length === 0 && (
                                    <div className="p-12 text-center text-slate-400">No records found.</div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Profile Modal */}
            <AnimatePresence>
                {selectedProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProfile(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-slate-900 w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex gap-6 items-center">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-red-500/30">
                                            <img src={selectedProfile.imageProfile || `https://ui-avatars.com/api/?name=${selectedProfile.name}&background=random`} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold">{selectedProfile.name}</h2>
                                            <p className="text-red-400 font-semibold">{activeTab.slice(0, -1).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedProfile(null)} className="text-slate-500 hover:text-white text-2xl">×</button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <InfoBox label="Email" value={selectedProfile.email} />
                                    <InfoBox label="Phone" value={findPhone(selectedProfile) || (selectedProfile.mobileNumber?.startsWith('$2a$') ? 'Missing in API' : selectedProfile.mobileNumber || 'N/A')} />
                                    {activeTab === 'electricians' && (
                                        <>
                                            <InfoBox label="Experience" value={selectedProfile.experience} />
                                            <InfoBox label="Degree" value={selectedProfile.degree} />
                                        </>
                                    )}
                                </div>

                                <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Debug Information (All Fields)</h3>
                                    <div className="grid grid-cols-1 gap-2 text-xs font-mono text-slate-400">
                                        {Object.entries(selectedProfile).map(([key, val]) => (
                                            <div key={key} className="flex justify-between border-b border-white/5 pb-1">
                                                <span>{key}:</span>
                                                <span className="text-slate-200 truncate max-w-[300px]">{String(val)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mt-8 mb-4 flex items-center gap-2">
                                    📊 Recent Activity
                                </h3>
                                <div className="space-y-3">
                                    <ActivityItem title="Profile Viewed by Admin" date="Just now" type="view" />
                                    <ActivityItem title="Successful Login" date="2 hours ago" type="login" />
                                    <ActivityItem title="Account Registered" date="1 day ago" type="success" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity`} />
            <div className="flex items-center gap-4">
                <div className="text-3xl">{icon}</div>
                <div>
                    <h4 className="text-slate-400 text-sm font-bold uppercase tracking-wider">{title}</h4>
                    <p className="text-3xl font-black mt-1">{value}</p>
                </div>
            </div>
        </div>
    );
}

function InfoBox({ label, value }) {
    return (
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{label}</p>
            <p className="text-slate-200 font-medium">{value}</p>
        </div>
    );
}

function ActivityItem({ title, date, type }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${type === 'success' ? 'bg-green-500' : 'bg-blue-500'} shadow-lg shadow-current`} />
                <span className="text-sm font-medium">{title}</span>
            </div>
            <span className="text-xs text-slate-500 font-bold">{date}</span>
        </div>
    );
}
