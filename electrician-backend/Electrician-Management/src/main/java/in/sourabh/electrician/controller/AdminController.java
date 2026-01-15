package in.sourabh.electrician.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import in.sourabh.electrician.dto.ElectricianDto;
import in.sourabh.electrician.dto.UserDto;
import in.sourabh.electrician.response.ApiResponse;
import in.sourabh.electrician.serviceimpl.ElectricianServiceImpl;
import in.sourabh.electrician.serviceimpl.UserServiceImpl;
import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserServiceImpl userServiceImpl;
    private final ElectricianServiceImpl electricianServiceImpl;

    // ✅ Get All Users
    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUser() {

        List<UserDto> users = userServiceImpl.getAllUser();

        ApiResponse<List<UserDto>> response =
                new ApiResponse<>(true, "All users fetched successfully", users);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUser(
            @PathVariable("id") Long userId) {

        UserDto userDto = userServiceImpl.getUser(userId);

        ApiResponse<UserDto> response =
                new ApiResponse<>(true, "User fetched successfully", userDto);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @PathVariable("id") Long userId) {

        userServiceImpl.deleteUser(userId);

        ApiResponse<String> response =
                new ApiResponse<>(true, "User deleted successfully", null);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/electrician")
    public ResponseEntity<ApiResponse<List<ElectricianDto>>> getAllElectrician() {

        List<ElectricianDto> electricianDto = electricianServiceImpl.getAllElectrician();

        ApiResponse<List<ElectricianDto>> response = new ApiResponse<>(true, "All electricians fetched",
                electricianDto);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/electrician/{id}")
    public ResponseEntity<ApiResponse<ElectricianDto>> getElectricianById(
            @PathVariable("id") Long electricianId) {

        ElectricianDto electricianDto = electricianServiceImpl.getElectrician(electricianId);

        ApiResponse<ElectricianDto> response = new ApiResponse<>(true, "Electrician fetched successfully",
                electricianDto);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/electrician/{id}")
    public ResponseEntity<ApiResponse<String>> deleteElectrician(
            @PathVariable("id") Long electricianId) {

        electricianServiceImpl.deleteElectrician(electricianId);

        ApiResponse<String> response = new ApiResponse<>(true, "Electrician deleted successfully", null);

        return ResponseEntity.ok(response);
    }
}
