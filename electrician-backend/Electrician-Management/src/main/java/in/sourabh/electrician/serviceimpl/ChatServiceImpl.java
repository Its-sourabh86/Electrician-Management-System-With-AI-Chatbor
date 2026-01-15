package in.sourabh.electrician.serviceimpl;

import in.sourabh.electrician.entites.ChatRoom;
import in.sourabh.electrician.entites.Message;
import in.sourabh.electrician.repository.ChatRoomRepository;
import in.sourabh.electrician.repository.MessageRepository;
import in.sourabh.electrician.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class ChatServiceImpl implements ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatServiceImpl.class);

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Override
    public Message saveMessage(Message message) {
        // Get or create chat room based on sender and receiver
        ChatRoom chatRoom = getOrCreateChatRoom(message.getSenderId(), message.getReceiverId());

        // Set the chat room relationship
        message.setChatRoom(chatRoom);
        message.setSentAt(LocalDateTime.now());

        // Update chat room with latest message
        updateChatRoomLastMessage(chatRoom, message.getContent(), message.getSentAt());

        return messageRepository.save(message);
    }

    @Override
    public String createChatRoomId(Long userId1, Long userId2) {
        // Create a consistent chat room ID regardless of who is user1 or user2
        Long firstId = Math.min(userId1, userId2);
        Long secondId = Math.max(userId1, userId2);
        return firstId + "_" + secondId;
    }

    @Override
    public void updateChatRoomLastMessage(ChatRoom chatRoom, String content, LocalDateTime time) {
        chatRoom.setLastMessage(content);
        chatRoom.setLastMessageTime(time);

        chatRoomRepository.save(chatRoom);
    }

    @Override
    public List<Message> getChatHistory(String chatRoomId, int page, int size) {
        try {
            // Parse chatRoomId format: "userId1-userId2"
            String[] parts = chatRoomId.split("-");
            if (parts.length != 2) {
                logger.warn("Invalid chatRoomId format: {}", chatRoomId);
                return Collections.emptyList();
            }

            Long userId1 = Long.parseLong(parts[0]);
            Long userId2 = Long.parseLong(parts[1]);

            // Get or create chat room
            ChatRoom chatRoom = getOrCreateChatRoom(userId1, userId2);

            // Fetch messages with sorting by sentAt
            List<Message> messages = messageRepository.findByChatRoom_IdOrderBySentAtAsc(chatRoom.getId());

            logger.info("Retrieved {} messages for chatRoom {}", messages.size(), chatRoomId);
            return messages != null ? messages : Collections.emptyList();

        } catch (NumberFormatException e) {
            logger.error("Invalid userId in chatRoomId: {}", chatRoomId, e);
            return Collections.emptyList();
        } catch (Exception e) {
            logger.error("Error fetching chat history for {}: {}", chatRoomId, e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    @Override
    public Page<Message> getChatHistoryWithPagination(String chatRoomId, int page, int size) {
        Long id = Long.valueOf(chatRoomId);
        Pageable pageable = PageRequest.of(page, size);
        return messageRepository.findByChatRoom_Id(id, pageable);
    }

    @Override
    public List<Message> getUserConversations(Long userId) {
        return messageRepository.findRecentConversationsByUserId(userId);
    }

    @Override
    public ChatRoom getOrCreateChatRoom(Long userId1, Long userId2) {

        return chatRoomRepository
                .findByParticipantIdsContainingAndParticipantIdsContaining(
                        userId1.toString(),
                        userId2.toString())
                .orElseGet(() -> {
                    ChatRoom room = new ChatRoom();
                    room.setParticipantIds(userId1 + "," + userId2);
                    room.setCreatedAt(LocalDateTime.now());
                    return chatRoomRepository.save(room);
                });
    }

    @Override
    public List<ChatRoom> getUserChatRooms(Long userId) {
        return chatRoomRepository.findByParticipantIdsContaining(String.valueOf(userId));
    }
}