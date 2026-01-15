package in.sourabh.electrician.service;

import java.util.List;

import in.sourabh.electrician.dto.BookingDTO;
public interface BookingService {
    
    // Create new booking
    BookingDTO createBooking(BookingDTO dto, String userEmail);
    
    // Get user bookings
    List<BookingDTO> getUserBookings(String userEmail);
    
    // Get electrician bookings
    List<BookingDTO> getElectricianBookings(String electricianEmail);
    
    // Accept booking
    BookingDTO acceptBooking(Long bookingId, String electricianEmail);
    
    // Reject booking
    BookingDTO rejectBooking(Long bookingId, String electricianEmail);
    
    // Complete booking
    BookingDTO completeBooking(Long bookingId, String electricianEmail);
    
    // Cancel booking
    BookingDTO cancelBooking(Long bookingId, String userEmail);
}
