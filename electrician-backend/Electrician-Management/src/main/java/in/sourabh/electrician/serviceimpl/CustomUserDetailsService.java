package in.sourabh.electrician.serviceimpl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import in.sourabh.electrician.entites.User;
import in.sourabh.electrician.entites.Electrician;
import in.sourabh.electrician.entites.Role;  // Enum
import in.sourabh.electrician.repository.ElectricianRepository;
import in.sourabh.electrician.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

@Autowired
private ElectricianRepository electricianRepo;
@Autowired
private UserRepository userRepo;

@Override
public UserDetails loadUserByUsername(String email)
        throws UsernameNotFoundException {

    // 1️⃣ User table check
    Optional<User> userOpt = userRepo.findByEmail(email);
    if (userOpt.isPresent()) {
        User user = userOpt.get();
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }

    // 2️⃣ Electrician table check
    Optional<Electrician> elecOpt = electricianRepo.findByEmail(email);
    if (elecOpt.isPresent()) {
        Electrician e = elecOpt.get();
        return new org.springframework.security.core.userdetails.User(
                e.getEmail(),
                e.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + e.getRole().name()))
        );
    }

    throw new UsernameNotFoundException("User not found with email: " + email);
}

}
