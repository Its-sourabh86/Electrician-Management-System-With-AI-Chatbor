import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatService from "../services/ChatService";

const ChatInterface = ({ senderId, receiverId, senderName, receiverName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketReady, setSocketReady] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // 🔹 Listen socket + incoming messages
  useEffect(() => {
    if (ChatService.isSocketConnected()) {
      setSocketReady(true);
    }

    const onSocketConnected = () => {
      console.log("🟢 Socket connected in UI");
      setSocketReady(true);
    };

    const onMessageReceived = (event) => {
      setMessages((prev) => [...prev, event.detail]);
    };

    window.addEventListener("socketConnected", onSocketConnected);
    window.addEventListener("messageReceived", onMessageReceived);

    return () => {
      window.removeEventListener("socketConnected", onSocketConnected);
      window.removeEventListener("messageReceived", onMessageReceived);
    };
  }, []);

  // Fetch chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const chatRoomId = `${Math.min(senderId, receiverId)}-${Math.max(senderId, receiverId)}`;
        const history = await ChatService.getChatHistory(chatRoomId);
        setMessages(history || []);
      } catch (err) {
        console.error("Chat history error", err);
        // Continue without history if fetch fails
      }
    };

    loadHistory();
  }, [senderId, receiverId]);


  // 🔹 Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!socketReady || !newMessage.trim()) return;

    ChatService.sendMessage({
      senderId,
      receiverId,
      content: newMessage,
      messageType: "TEXT",
    });

    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800 p-6 rounded-t-3xl border border-slate-700 border-b-0 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {receiverName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{receiverName}</h2>
              <p className="text-sm text-slate-400 flex items-center gap-2">
                {socketReady ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Online
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Connecting...
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-slate-800/50 border-x border-slate-700 p-6 h-[calc(100vh-300px)] overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p>No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.senderId === senderId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-lg ${msg.senderId === senderId
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-sm"
                    : "bg-slate-700 text-white rounded-bl-sm"
                    }`}
                >
                  <p className="text-sm leading-relaxed mb-1">{msg.content}</p>
                  <p className={`text-[10px] opacity-70 ${msg.senderId === senderId ? 'text-right' : 'text-left'}`}>
                    {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : ''}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="bg-slate-800 p-6 rounded-b-3xl border border-slate-700 border-t-0 flex gap-3"
        >
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!socketReady || !newMessage.trim()}
            className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${socketReady && newMessage.trim()
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20"
              : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
