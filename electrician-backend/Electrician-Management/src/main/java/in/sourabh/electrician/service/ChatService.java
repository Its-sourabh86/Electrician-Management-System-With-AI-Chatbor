package in.sourabh.electrician.service;

import in.sourabh.electrician.entites.ChatRoom;
import in.sourabh.electrician.entites.Message;
import org.springframework.data.domain.Page;
import java.time.LocalDateTime;
import java.util.List;

public interface ChatService {
    Message saveMessage(Message message);
    String createChatRoomId(Long userId1, Long userId2);
    void updateChatRoomLastMessage(ChatRoom chatRoom, String content, LocalDateTime time);
    List<Message> getChatHistory(String chatRoomId, int page, int size);
    Page<Message> getChatHistoryWithPagination(String chatRoomId, int page, int size);
    List<Message> getUserConversations(Long userId);
    ChatRoom getOrCreateChatRoom(Long userId1, Long userId2);
    List<ChatRoom> getUserChatRooms(Long userId);
}