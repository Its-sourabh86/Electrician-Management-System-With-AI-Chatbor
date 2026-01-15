package in.sourabh.electrician.dto;

import lombok.Data;
import java.time.LocalDateTime;
@Data
public class BookingDTO {
    private Long id;
    private Long userId;
    private Long electricianId;
    private String serviceType;
    private String description;
    private String location;
    private LocalDateTime scheduledDate;
    private String status;
    private Double estimatedCost;
    private LocalDateTime createdAt;
    
    // User details (for electrician view)
    private String userName;
    private String userEmail;
    private String userMobile;
    
    // Electrician details (for user view)
    private String electricianName;
    private String electricianEmail;
    private String electricianMobile;
}
