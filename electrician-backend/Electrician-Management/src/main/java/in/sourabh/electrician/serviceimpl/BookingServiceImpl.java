package in.sourabh.electrician.serviceimpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.sourabh.electrician.dto.BookingDTO;
import in.sourabh.electrician.entites.Booking;
import in.sourabh.electrician.entites.BookingStatus;
import in.sourabh.electrician.entites.Electrician;
import in.sourabh.electrician.entites.User;
import in.sourabh.electrician.repository.BookingRepository;
import in.sourabh.electrician.repository.ElectricianRepository;
import in.sourabh.electrician.repository.UserRepository;
import in.sourabh.electrician.service.BookingService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class BookingServiceImpl implements BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ElectricianRepository electricianRepository;
    
    @Override
    public BookingDTO createBooking(BookingDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Electrician electrician = electricianRepository.findById(dto.getElectricianId())
            .orElseThrow(() -> new RuntimeException("Electrician not found"));
        
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setElectrician(electrician);
        booking.setServiceType(dto.getServiceType());
        booking.setDescription(dto.getDescription());
        booking.setLocation(dto.getLocation());
        booking.setScheduledDate(dto.getScheduledDate());
        booking.setStatus(BookingStatus.PENDING);
        booking.setEstimatedCost(dto.getEstimatedCost());
        booking.setCreatedAt(LocalDateTime.now());
        
        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }
    
    @Override
    public List<BookingDTO> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return bookingRepository.findByUserId(user.getId())
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<BookingDTO> getElectricianBookings(String electricianEmail) {
        Electrician electrician = electricianRepository.findByEmail(electricianEmail)
            .orElseThrow(() -> new RuntimeException("Electrician not found"));
        
        return bookingRepository.findByElectricianIdOrderByCreatedAtDesc(electrician.getId())
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public BookingDTO acceptBooking(Long bookingId, String electricianEmail) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        Electrician electrician = electricianRepository.findByEmail(electricianEmail)
            .orElseThrow(() -> new RuntimeException("Electrician not found"));
        
        if (!booking.getElectrician().getId().equals(electrician.getId())) {
            throw new RuntimeException("Unauthorized: This booking is not for you");
        }
        
        booking.setStatus(BookingStatus.ACCEPTED);
        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }
    
    @Override
    public BookingDTO rejectBooking(Long bookingId, String electricianEmail) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        Electrician electrician = electricianRepository.findByEmail(electricianEmail)
            .orElseThrow(() -> new RuntimeException("Electrician not found"));
        
        if (!booking.getElectrician().getId().equals(electrician.getId())) {
            throw new RuntimeException("Unauthorized: This booking is not for you");
        }
        
        booking.setStatus(BookingStatus.REJECTED);
        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }
    
    @Override
    public BookingDTO completeBooking(Long bookingId, String electricianEmail) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        Electrician electrician = electricianRepository.findByEmail(electricianEmail)
            .orElseThrow(() -> new RuntimeException("Electrician not found"));
        
        if (!booking.getElectrician().getId().equals(electrician.getId())) {
            throw new RuntimeException("Unauthorized: This booking is not for you");
        }
        
        if (booking.getStatus() != BookingStatus.ACCEPTED) {
            throw new RuntimeException("Can only complete accepted bookings");
        }
        
        booking.setStatus(BookingStatus.COMPLETED);
        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }
    
    @Override
    public BookingDTO cancelBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: This is not your booking");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Can only cancel pending bookings");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }
    
    // Helper method to convert Entity to DTO
    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUser().getId());
        dto.setElectricianId(booking.getElectrician().getId());
        dto.setServiceType(booking.getServiceType());
        dto.setDescription(booking.getDescription());
        dto.setLocation(booking.getLocation());
        dto.setScheduledDate(booking.getScheduledDate());
        dto.setStatus(booking.getStatus().toString());
        dto.setEstimatedCost(booking.getEstimatedCost());
        dto.setCreatedAt(booking.getCreatedAt());
        
        // User details
        dto.setUserName(booking.getUser().getName());
        dto.setUserEmail(booking.getUser().getEmail());
        dto.setUserMobile(booking.getUser().getMobileNumber());
        
        // Electrician details
        dto.setElectricianName(booking.getElectrician().getName());
        dto.setElectricianEmail(booking.getElectrician().getEmail());
        dto.setElectricianMobile(booking.getElectrician().getMobileNumber());
        
        return dto;
    }
}
