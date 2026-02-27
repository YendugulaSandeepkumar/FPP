import React, { useEffect, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import api from '../api';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const markRead = async () => {
        if (unreadCount > 0) {
            await api.post('/notifications/read');
            setUnreadCount(0);
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => { setIsOpen(!isOpen); markRead(); }}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-fade-in">
                    <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 text-sm">Notifications</div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-center text-gray-400 text-sm">No notifications</p>
                        ) : (
                            notifications.map(note => (
                                <div key={note.id} className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!note.isRead ? 'bg-blue-50/30' : ''}`}>
                                    <div className="flex gap-2">
                                        <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${note.type === 'success' ? 'bg-green-500' : note.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                        <div>
                                            <p className="text-sm text-gray-800">{note.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
