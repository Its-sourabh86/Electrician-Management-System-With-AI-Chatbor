import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatService from "../services/ChatService";
import ChatInterface from "../components/ChatInterface";

const ChatPage = () => {
  const { chatId } = useParams(); // ✅ Get receiverId from URL
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const senderId = storedUser?.id;
  const receiverId = chatId ? parseInt(chatId) : null;

  useEffect(() => {
    if (senderId) {
      ChatService.initialize({ id: senderId });
    }
    return () => ChatService.disconnect();
  }, [senderId]);

  if (!senderId || !receiverId) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
          <p className="text-slate-400">Invalid chat. Please select a user to start chatting.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-xl font-bold transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChatInterface
      senderId={senderId}
      receiverId={receiverId}
      senderName={storedUser?.name}
      receiverName={"Chat Partner"}
    />
  );
};

export default ChatPage;
