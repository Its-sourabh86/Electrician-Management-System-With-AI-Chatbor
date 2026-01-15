package in.sourabh.electrician.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import in.sourabh.electrician.dto.UserDto;

public interface UserService {

    UserDto createUser(UserDto userDto,MultipartFile image);
   UserDto updateUser(Long userId, UserDto userDto, MultipartFile image);

    UserDto getUser(Long userId);
    void deleteUser(Long userId);
    List<UserDto> getAllUser();
}
