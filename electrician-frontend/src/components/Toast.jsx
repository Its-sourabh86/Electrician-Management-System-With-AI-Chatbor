import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';

const icons = {
    success: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    info: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

const colors = {
    success: 'bg-emerald-500 shadow-emerald-500/20',
    error: 'bg-rose-500 shadow-rose-500/20',
    info: 'bg-cyan-500 shadow-cyan-500/20',
};

const Toast = ({ notification }) => {
    const { removeNotification } = useNotification();

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`${colors[notification.type]} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] pointer-events-auto backdrop-blur-md border border-white/20`}
        >
            <div className="flex-shrink-0 bg-white/20 p-2 rounded-xl">
                {icons[notification.type]}
            </div>
            <div className="flex-1 font-medium">
                {notification.message}
            </div>
            <button
                onClick={() => removeNotification(notification.id)}
                className="hover:bg-white/20 p-1 rounded-lg transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </motion.div>
    );
};

export const ToastContainer = () => {
    const { notifications } = useNotification();

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <Toast key={notification.id} notification={notification} />
                ))}
            </AnimatePresence>
        </div>
    );
};
