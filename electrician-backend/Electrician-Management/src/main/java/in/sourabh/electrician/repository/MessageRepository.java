package in.sourabh.electrician.repository;

import in.sourabh.electrician.entites.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByChatRoom_Id(Long chatRoomId);

    // ✅ Sorted query for chat history
    List<Message> findByChatRoom_IdOrderBySentAtAsc(Long chatRoomId);

    Page<Message> findByChatRoom_Id(Long chatRoomId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.senderId = :userId OR m.receiverId = :userId ORDER BY m.sentAt DESC")
    List<Message> findRecentConversationsByUserId(@Param("userId") Long userId);
}