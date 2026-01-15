package in.sourabh.electrician.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import in.sourabh.electrician.dto.ElectricianDto;
import in.sourabh.electrician.dto.UserDto;
import in.sourabh.electrician.response.ApiResponse;
import in.sourabh.electrician.serviceimpl.ElectricianServiceImpl;
import in.sourabh.electrician.serviceimpl.UserServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserServiceImpl userServiceImpl;
    private final ElectricianServiceImpl electricianServiceImpl;

    // ✅ Create User
    // @PostMapping
    // public ResponseEntity<ApiResponse<UserDto>> createUser(
    // @Valid @RequestBody UserDto userDto) {

    // UserDto savedUser = userServiceImpl.createUser(userDto);

    // ApiResponse<UserDto> response =
    // new ApiResponse<>(true, "User created successfully", savedUser);

    // return new ResponseEntity<>(response, HttpStatus.CREATED);
    // }

    // ✅ Get User By Id
    // @GetMapping("{id}")
    // public ResponseEntity<ApiResponse<UserDto>> getUser(
    // @PathVariable("id") Long userId) {

    // UserDto userDto = userServiceImpl.getUser(userId);

    // ApiResponse<UserDto> response =
    // new ApiResponse<>(true, "User fetched successfully", userDto);

    // return ResponseEntity.ok(response);
    // }

    // ✅ Get All Users
    // @GetMapping
    // public ResponseEntity<ApiResponse<List<UserDto>>> getAllUser() {

    // List<UserDto> users = userServiceImpl.getAllUser();

    // ApiResponse<List<UserDto>> response =
    // new ApiResponse<>(true, "All users fetched successfully", users);

    // return ResponseEntity.ok(response);
    // }

    // ✅ Update User
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable("id") Long userId,
            @RequestPart("user") UserDto userDto,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        UserDto updatedUser = userServiceImpl.updateUser(userId, userDto, image);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "User updated successfully", updatedUser));
    }

    // ✅ Delete User
    @DeleteMapping("{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @PathVariable("id") Long userId) {

        userServiceImpl.deleteUser(userId);

        ApiResponse<String> response = new ApiResponse<>(true, "User deleted successfully", null);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/electricians")
    public ResponseEntity<ApiResponse<List<ElectricianDto>>> getAllElectrician() {

        List<ElectricianDto> electricianDto = electricianServiceImpl.getAllElectrician();

        ApiResponse<List<ElectricianDto>> response = new ApiResponse<>(true, "All electricians fetched",
                electricianDto);

        return ResponseEntity.ok(response);
    }


    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<ElectricianDto>> getElectricianById(
            @PathVariable("id") Long electricianId) {

        ElectricianDto electricianDto = electricianServiceImpl.getElectrician(electricianId);

        ApiResponse<ElectricianDto> response = new ApiResponse<>(true, "Electrician fetched successfully",
                electricianDto);

        return ResponseEntity.ok(response);
    }

}
