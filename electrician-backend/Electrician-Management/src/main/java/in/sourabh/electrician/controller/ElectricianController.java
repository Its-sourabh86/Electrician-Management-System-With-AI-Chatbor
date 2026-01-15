package in.sourabh.electrician.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import in.sourabh.electrician.dto.ElectricianDto;
import in.sourabh.electrician.response.ApiResponse;
import in.sourabh.electrician.serviceimpl.ElectricianServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/electrician")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ElectricianController {

    private final ElectricianServiceImpl electricianServiceImpl;

    // create user
    // @PostMapping
    // public ResponseEntity<ApiResponse<ElectricianDto>> createElectrician(
    //        @Valid  @RequestBody ElectricianDto electricianDto) {

    //     ElectricianDto savedElectrician = electricianServiceImpl.createElectrician(electricianDto);

    //     ApiResponse<ElectricianDto> response = new ApiResponse<>(true, "Electrician created successfully",
    //             savedElectrician);

    //     return new ResponseEntity<>(response, HttpStatus.CREATED);
    // }

    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<ElectricianDto>> getElectricianById(
            @PathVariable("id") Long electricianId) {

        ElectricianDto electricianDto = electricianServiceImpl.getElectrician(electricianId);

        ApiResponse<ElectricianDto> response = new ApiResponse<>(true, "Electrician fetched successfully",
                electricianDto);

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ElectricianDto>>> getAllElectrician() {

        List<ElectricianDto> electricianDto = electricianServiceImpl.getAllElectrician();

        ApiResponse<List<ElectricianDto>> response = new ApiResponse<>(true, "All electricians fetched",
                electricianDto);

        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/{id}",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ElectricianDto>> updateElectrician(
            @PathVariable("id") Long electricianId,
            @RequestPart("electrician") ElectricianDto electricianDto,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        ElectricianDto updated = electricianServiceImpl.updateElectrician(electricianId, electricianDto,image);

        ApiResponse<ElectricianDto> response = new ApiResponse<>(true, "Electrician updated successfully", updated);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("{id}")
    public ResponseEntity<ApiResponse<String>> deleteElectrician(
            @PathVariable("id") Long electricianId) {

        electricianServiceImpl.deleteElectrician(electricianId);

        ApiResponse<String> response = new ApiResponse<>(true, "Electrician deleted successfully", null);

        return ResponseEntity.ok(response);
    }

}
