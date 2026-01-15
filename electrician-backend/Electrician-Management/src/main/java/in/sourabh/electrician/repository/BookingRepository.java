package in.sourabh.electrician.repository;
import in.sourabh.electrician.entites.Booking;
import in.sourabh.electrician.entites.BookingStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByUserId(Long userId);
    
    List<Booking> findByElectricianId(Long electricianId);
    
    List<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);
    
    List<Booking> findByElectricianIdAndStatus(Long electricianId, BookingStatus status);
    
    List<Booking> findByElectricianIdOrderByCreatedAtDesc(Long electricianId);
}
