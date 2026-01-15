package in.sourabh.electrician.serviceimpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import in.sourabh.electrician.dto.UserDto;
import in.sourabh.electrician.entites.Role;
import in.sourabh.electrician.entites.User;
import in.sourabh.electrician.exception.ResourceAlreadyExistsException;
import in.sourabh.electrician.exception.ResourceNotFoundException;
import in.sourabh.electrician.mapper.UserMapper;
import in.sourabh.electrician.repository.UserRepository;
import in.sourabh.electrician.service.UserService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    // Create User
    @Override
    public UserDto createUser(UserDto userDto, MultipartFile image) {

        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new ResourceAlreadyExistsException(
                    "User already registered with email: " + userDto.getEmail());
        }
        User user = UserMapper.maToUser(userDto);
        user.setRole(Role.USER);
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));

        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService
                    .uploadImage(image, "users/profile");
            user.setImageProfile(imageUrl);
        }

        User savedUser = userRepository.save(user);
        return UserMapper.mapToUserDto(savedUser);
    }

    // Get userById
    @Override
    public UserDto getUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User is not exist with given id : " + userId));
        return UserMapper.mapToUserDto(user);
    }

    // Get AllUser
    @Override
    public List<UserDto> getAllUser() {
        List<User> user = userRepository.findAll();
        return user.stream().map((users) -> UserMapper.mapToUserDto(users)).collect(Collectors.toList());
    }

    // Update the user
    @Override
    public UserDto updateUser(Long userId, UserDto userDto, MultipartFile image) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id : " + userId));

        user.setName(userDto.getName());
        user.setEmail(userDto.getEmail());
        user.setMobileNumber(userDto.getMobileNumber());
        user.setLocation(userDto.getLocation());

        // ✅ Password update (optional)
        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }

        // ✅ Image update
        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image, "user/profile");
            user.setImageProfile(imageUrl);
        }

        User updatedUser = userRepository.save(user);
        return UserMapper.mapToUserDto(updatedUser);
    }

    // Delete user
    @Override
    public void deleteUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("user is not exist with given id : " + userId));
        userRepository.delete(user);
    }

}
