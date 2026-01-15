package in.sourabh.electrician.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import in.sourabh.electrician.dto.BookingDTO;
import in.sourabh.electrician.service.BookingService;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {
    
    @Autowired
    private BookingService bookingService;
    
    // User endpoints
    @PostMapping("/user/create")
    public ResponseEntity<?> createBooking(@RequestBody BookingDTO dto, Principal principal) {
        try {
            BookingDTO created = bookingService.createBooking(dto, principal.getName());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Booking created successfully");
            response.put("data", created);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/user/my-bookings")
    public ResponseEntity<?> getMyBookings(Principal principal) {
        try {
            List<BookingDTO> bookings = bookingService.getUserBookings(principal.getName());
            return ResponseEntity.ok(Map.of("data", bookings));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/user/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, Principal principal) {
        try {
            BookingDTO cancelled = bookingService.cancelBooking(id, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Booking cancelled", "data", cancelled));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    // Electrician endpoints
    @GetMapping("/electrician/all")
    public ResponseEntity<?> getElectricianBookings(Principal principal) {
        try {
            List<BookingDTO> bookings = bookingService.getElectricianBookings(principal.getName());
            return ResponseEntity.ok(Map.of("data", bookings));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/electrician/{id}/accept")
    public ResponseEntity<?> acceptBooking(@PathVariable Long id, Principal principal) {
        try {
            BookingDTO accepted = bookingService.acceptBooking(id, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Booking accepted", "data", accepted));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/electrician/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id, Principal principal) {
        try {
            BookingDTO rejected = bookingService.rejectBooking(id, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Booking rejected", "data", rejected));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/electrician/{id}/complete")
    public ResponseEntity<?> completeBooking(@PathVariable Long id, Principal principal) {
        try {
            BookingDTO completed = bookingService.completeBooking(id, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Booking completed", "data", completed));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
