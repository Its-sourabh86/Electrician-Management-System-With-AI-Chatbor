package in.sourabh.electrician.controller;
import in.sourabh.electrician.dto.MessageDto;
import in.sourabh.electrician.entites.ChatRoom;
import in.sourabh.electrician.entites.Message;
import in.sourabh.electrician.entites.MessageType;
import in.sourabh.electrician.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Controller
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    @Autowired
    private ChatService chatService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    // ================= REST APIs =================
    /**
     * Get chat history between two users
     * @param chatRoomId Format: "userId1-userId2" (smaller ID first)
     * @return List of messages in chronological order
     */
    @GetMapping("/history/{chatRoomId}")
    @ResponseBody
    public ResponseEntity<List<MessageDto>> getChatHistory(@PathVariable String chatRoomId) {
        try {
            logger.info("Fetching chat history for room: {}", chatRoomId);
            
            List<Message> messages = chatService.getChatHistory(chatRoomId, 0, 50);
            List<MessageDto> dtos = messages.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            logger.info("Retrieved {} messages for room {}", dtos.size(), chatRoomId);
            return ResponseEntity.ok(dtos);
            
        } catch (Exception e) {
            logger.error("Error fetching chat history for room {}: {}", chatRoomId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    /**
     * Get all chat rooms for a specific user
     * @param userId User ID
     * @return List of chat rooms
     */
    @GetMapping("/rooms/{userId}")
    @ResponseBody
    public ResponseEntity<List<ChatRoom>> getUserChatRooms(@PathVariable Long userId) {
        try {
            logger.info("Fetching chat rooms for user: {}", userId);
            
            List<ChatRoom> rooms = chatService.getUserChatRooms(userId);
            
            logger.info("Retrieved {} chat rooms for user {}", rooms.size(), userId);
            return ResponseEntity.ok(rooms);
            
        } catch (Exception e) {
            logger.error("Error fetching chat rooms for user {}: {}", userId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    // ================= WEBSOCKET =================
    /**
     * Handle incoming WebSocket messages
     * Validates, saves, and broadcasts to both sender and receiver
     * @param dto Message data transfer object
     */
    @MessageMapping("/chat")
    public void sendMessage(@Payload MessageDto dto) {
        try {
            // ✅ Validation
            validateMessage(dto);
            logger.info("Processing message from {} to {}", dto.getSenderId(), dto.getReceiverId());
            // ✅ Create and populate message entity
            Message message = new Message();
            message.setContent(dto.getContent().trim());
            message.setSenderId(dto.getSenderId());
            message.setReceiverId(dto.getReceiverId());
            message.setMessageType(
                    dto.getMessageType() != null 
                            ? MessageType.valueOf(dto.getMessageType())
                            : MessageType.TEXT
            );
            message.setSentAt(LocalDateTime.now());
            message.setSeen(false);
            // ✅ Save to database
            Message saved = chatService.saveMessage(message);
            MessageDto savedDto = convertToDto(saved);
            logger.info("Message saved with ID: {}", saved.getId());
            // ✅ Send to receiver
            messagingTemplate.convertAndSend(
                    "/topic/chat/" + dto.getReceiverId(),
                    savedDto
            );
            logger.debug("Message sent to receiver: {}", dto.getReceiverId());
            // ✅ Send to sender for UI sync
            messagingTemplate.convertAndSend(
                    "/topic/chat/" + dto.getSenderId(),
                    savedDto
            );
            logger.debug("Message sent to sender: {}", dto.getSenderId());
        } catch (IllegalArgumentException e) {
            logger.error("Validation error: {}", e.getMessage());
            // Could send error notification to sender here if needed
            
        } catch (Exception e) {
            logger.error("Error processing message from {} to {}: {}", 
                    dto.getSenderId(), dto.getReceiverId(), e.getMessage(), e);
            // Could send error notification to sender here if needed
        }
    }
    // ================= VALIDATION =================
    /**
     * Validate incoming message DTO
     * @param dto Message DTO to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateMessage(MessageDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Message cannot be null");
        }
        
        if (dto.getSenderId() == null) {
            throw new IllegalArgumentException("Sender ID is required");
        }
        
        if (dto.getReceiverId() == null) {
            throw new IllegalArgumentException("Receiver ID is required");
        }
        
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }
        
        if (dto.getSenderId().equals(dto.getReceiverId())) {
            throw new IllegalArgumentException("Cannot send message to yourself");
        }
        
        // Optional: Add content length validation
        if (dto.getContent().length() > 5000) {
            throw new IllegalArgumentException("Message content too long (max 5000 characters)");
        }
    }
    // ================= MAPPERS =================
    /**
     * Convert Message entity to MessageDto
     * @param message Message entity
     * @return MessageDto
     */
    private MessageDto convertToDto(Message message) {
        if (message == null) {
            return null;
        }
        
        MessageDto dto = new MessageDto();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setSenderId(message.getSenderId());
        dto.setReceiverId(message.getReceiverId());
        dto.setSentAt(message.getSentAt());
        dto.setMessageType(message.getMessageType() != null 
                ? message.getMessageType().name() 
                : MessageType.TEXT.name());
        dto.setSeen(message.isSeen());
        
        // ✅ Null-safe chatRoom handling
        if (message.getChatRoom() != null && message.getChatRoom().getId() != null) {
            dto.setChatRoomId(message.getChatRoom().getId().toString());
        }
        
        return dto;
    }
}