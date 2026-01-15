package in.sourabh.electrician.repository;

import in.sourabh.electrician.entites.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    Optional<ChatRoom> findByParticipantIdsContainingAndParticipantIdsContaining(String userId1, String userId2);
    
    List<ChatRoom> findByParticipantIdsContaining(String userId);
    
    @Query("SELECT c FROM ChatRoom c WHERE (c.participantIds LIKE %:userId%)")
    List<ChatRoom> findChatRoomsByUserId(@Param("userId") String userId);
}