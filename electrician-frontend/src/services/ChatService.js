import SockJS from "sockjs-client";
import { over } from "stompjs";

class ChatService {
  constructor() {
    this.stompClient = null;
    this.connectedUser = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.subscription = null;
  }

  // 🔹 Call this ONCE when chat page opens
  initialize(user) {
    if (!user || !user.id) return;
    if (this.isConnected || this.isConnecting) return;

    this.connectedUser = user;
    this.isConnecting = true;
    this.connect();
  }

  async getChatHistory(chatRoomId) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/chat/history/${chatRoomId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Accept": "application/json"
          }
        }
      );

      if (!response.ok) {
        console.warn(`⚠️ Chat history fetch failed with status: ${response.status}`);
        return [];
      }

      const text = await response.text();
      if (!text || text.trim() === "") return [];

      const data = JSON.parse(text);
      return Array.isArray(data) ? data : [];

    } catch (error) {
      console.error("❌ Error fetching chat history:", error.message);
      return [];
    }
  }

  connect() {
    const socket = new SockJS(import.meta.env.VITE_WS_URL);
    this.stompClient = over(socket);
    this.stompClient.debug = null; // Disable noisy stomp logs

    this.stompClient.connect(
      {},
      (frame) => {
        console.log("✅ WebSocket Connected:", frame);
        this.isConnected = true;
        this.isConnecting = false;

        window.dispatchEvent(new Event("socketConnected"));

        if (this.subscription) {
          this.subscription.unsubscribe();
        }

        this.subscription = this.stompClient.subscribe(
          `/topic/chat/${this.connectedUser.id}`,
          (message) => {
            if (message?.body) {
              const data = JSON.parse(message.body);
              this.handleMessage(data);
            }
          }
        );
      },
      (error) => {
        console.error("❌ WebSocket error:", error);
        this.isConnected = false;
        this.isConnecting = false;
      }
    );
  }

  isSocketConnected() {
    return this.isConnected && this.stompClient !== null;
  }

  sendMessage(chatMessage) {
    if (!this.isSocketConnected()) {
      console.error("❌ Socket not connected");
      return;
    }

    this.stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
  }

  handleMessage(message) {
    console.log("📩 Message received:", message);
    window.dispatchEvent(
      new CustomEvent("messageReceived", {
        detail: message
      })
    );
  }

  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.stompClient) {
      try {
        this.stompClient.disconnect();
        console.log("🔌 WebSocket disconnected");
      } catch (e) {
        console.warn("Disconnect failed:", e);
      }
      this.stompClient = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
  }
}

export default new ChatService();
