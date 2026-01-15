package in.sourabh.electrician.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import in.sourabh.electrician.entites.User;
import in.sourabh.electrician.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AdminPasswordEncryptRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        User admin = userRepository.findByEmail("admin@gmail.com")
                .orElse(null);

        if (admin != null && !admin.getPassword().startsWith("$2a$")) {
            admin.setPassword(passwordEncoder.encode(admin.getPassword()));
            userRepository.save(admin);
            System.out.println("✅ Admin password encrypted successfully");
        }
    }
}

