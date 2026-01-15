package in.sourabh.electrician.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import in.sourabh.electrician.dto.ElectricianDto;
import in.sourabh.electrician.dto.UserDto;
import in.sourabh.electrician.entites.Electrician;
import in.sourabh.electrician.entites.User;
import in.sourabh.electrician.login.LoginRequest;
import in.sourabh.electrician.repository.ElectricianRepository;
import in.sourabh.electrician.repository.UserRepository;
import in.sourabh.electrician.response.ApiResponse;
import in.sourabh.electrician.serviceimpl.ElectricianServiceImpl;
import in.sourabh.electrician.serviceimpl.UserServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

        private final UserServiceImpl userServiceImpl;
        private final ElectricianServiceImpl electricianServiceImpl;
        private final AuthenticationManager authenticationManager;
        private final UserRepository userRepository;
        private final ElectricianRepository electricianRepository;

        // ✅ USER REGISTER
        @PostMapping("/register/user")
        public ResponseEntity<ApiResponse<UserDto>> registerUser(
                        @RequestPart("user") UserDto userDto,
                        @RequestPart(value = "image", required = false) MultipartFile image) {

                UserDto savedUser = userServiceImpl.createUser(userDto, image);

                return new ResponseEntity<>(
                                new ApiResponse<>(true, "User created successfully", savedUser),
                                HttpStatus.CREATED);
        }

        // ✅ ELECTRICIAN REGISTER
        @PostMapping("/register/electrician")
        public ResponseEntity<ApiResponse<ElectricianDto>> createElectrician(
                        @RequestPart("user") ElectricianDto electricianDto,
                        @RequestPart(value = "image", required = false) MultipartFile image) {

                ElectricianDto savedElectrician = electricianServiceImpl.createElectrician(electricianDto, image);

                ApiResponse<ElectricianDto> response = new ApiResponse<>(true, "Electrician registerd successfully",
                                savedElectrician);

                return new ResponseEntity<>(response, HttpStatus.CREATED);
        }

        // ✅ LOGIN (USER + ELECTRICIAN + ADMIN)
        @PostMapping("/login")
        public ResponseEntity<ApiResponse<Map<String, Object>>> login(
                        @RequestBody LoginRequest request) {

                // 1️⃣ Authenticate (USER / ELECTRICIAN / ADMIN)
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                Map<String, Object> data = new HashMap<>();

                // 2️⃣ Check USER table (USER + ADMIN)
                Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

                if (userOpt.isPresent()) {
                        User user = userOpt.get();

                        data.put("type", "USER_TABLE");
                        data.put("role", user.getRole().name());
                        data.put("id", user.getId());
                        data.put("name", user.getName());
                        data.put("email", user.getEmail());
                        data.put("mobileNumber", user.getMobileNumber());
                        data.put("imageProfile", user.getImageProfile());
                        data.put("location", user.getLocation());

                        return ResponseEntity.ok(
                                        new ApiResponse<>(true, "Login successful", data));
                }

                // 3️⃣ Check ELECTRICIAN table
                Optional<Electrician> elecOpt = electricianRepository.findByEmail(request.getEmail());

                if (elecOpt.isPresent()) {
                        Electrician e = elecOpt.get();

                        data.put("type", "ELECTRICIAN_TABLE");
                        data.put("role", "ELECTRICIAN");
                        data.put("id", e.getId());
                        data.put("name", e.getName());
                        data.put("email", e.getEmail());
                        data.put("password", e.getPassword());
                        data.put("mobileNumber", e.getMobileNumber());
                        data.put("imageProfile", e.getImageProfile());
                        data.put("location", e.getLocation());
                        data.put("experience", e.getExperience());
                        data.put("degree", e.getDegree());

                        return ResponseEntity.ok(
                                        new ApiResponse<>(true, "Login successful", data));
                }

                // 4️⃣ Not found
                throw new RuntimeException("User not found");
        }

}
