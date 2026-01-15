package in.sourabh.electrician.mapper;

import in.sourabh.electrician.dto.UserDto;
import in.sourabh.electrician.entites.User;

public class UserMapper {

    public static UserDto mapToUserDto(User user) {
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPassword(),
                user.getMobileNumber(),
                user.getImageProfile(),
                user.getLocation(),
                user.getRole());
    }

    public static User maToUser(UserDto userDto) {
        return new User(
                userDto.getId(),
                userDto.getName(),
                userDto.getEmail(),
                userDto.getPassword(),
                userDto.getMobileNumber(),
                userDto.getImageProfile(),
                userDto.getLocation(),
                userDto.getRole());
    }
}
