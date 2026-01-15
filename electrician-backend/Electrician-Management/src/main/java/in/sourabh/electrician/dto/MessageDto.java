package in.sourabh.electrician.dto;

import java.time.LocalDateTime;

public class MessageDto {
    private Long id;
    private String content;
    private Long senderId;
    private Long receiverId;
    private LocalDateTime sentAt;
    private String chatRoomId;
    private String messageType;
    private boolean seen;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    
    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }
    
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    
    public String getChatRoomId() { return chatRoomId; }
    public void setChatRoomId(String chatRoomId) { this.chatRoomId = chatRoomId; }
    
    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }
    
    public boolean isSeen() { return seen; }
    public void setSeen(boolean seen) { this.seen = seen; }
}