import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ChatService from '../services/ChatService';

const ChatList = ({ currentUserId, userType }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch conversations from backend
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                // Fetch conversations using ChatService
                const response = await ChatService.getConversations(currentUserId);
                setConversations(response || []);
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
                // Fallback to mock data if API call fails
                const mockConversations = [
                    {
                        id: 1,
                        participantName: 'John Electrician',
                        participantId: 'electrician-1',
                        lastMessage: 'Yes, I can help with that wiring job',
                        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
                        unread: 0,
                        isOnline: true
                    },
                    {
                        id: 2,
                        participantName: 'Sarah Homeowner',
                        participantId: 'user-1',
                        lastMessage: 'Thanks for the quick response!',
                        timestamp: new Date(Date.now() - 86400000), // 1 day ago
                        unread: 2,
                        isOnline: false
                    },
                    {
                        id: 3,
                        participantName: 'Mike Electrician',
                        participantId: 'electrician-2',
                        lastMessage: 'The job is completed successfully',
                        timestamp: new Date(Date.now() - 172800000), // 2 days ago
                        unread: 0,
                        isOnline: true
                    }
                ];
                setConversations(mockConversations);
            } finally {
                setLoading(false);
            }
        };
        
        if (currentUserId) {
            fetchConversations();
        }
    }, [currentUserId]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Conversations</h2>
            </div>
            <div className="divide-y">
                {conversations.map((conversation) => (
                    <Link
                        key={conversation.id}
                        to={`/chat/${conversation.participantId}`}
                        className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                    {conversation.participantName.charAt(0)}
                                </div>
                                {conversation.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                )}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-gray-900 truncate">
                                        {conversation.participantName}
                                    </h3>
                                    <span className="text-xs text-gray-500">
                                        {conversation.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                    {conversation.lastMessage}
                                </p>
                            </div>
                            {conversation.unread > 0 && (
                                <div className="ml-2 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {conversation.unread}
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ChatList;